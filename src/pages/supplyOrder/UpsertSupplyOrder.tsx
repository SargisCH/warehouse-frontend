import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Box,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useGetInventoryQuery } from "api/inventory";
import {
  useCreateSupplierOrderMutation,
  useDeleteInventorySupplierOrderMutation,
  useLazyGetInventorySupplierOrderByIdQuery,
  useLazyGetLatestOrderDetailsQuery,
  useUpdateInventorySupplierOrderMutation,
  OrderItem,
  useLazyGetInventorySupplierQuery,
  useLazyGetInventorySupplierByIdQuery,
} from "api/inventorySupplier";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import { links } from "routes";
import dayjs from "dayjs";
type OptionType = {
  label: string;
  value: number | string;
};

const UpsertSupplierOrder = (props: { create: boolean }) => {
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Array<OptionType>>(
    []
  );
  const [selectedSupplier, setSelectedSupplier] = useState<OptionType>();
  const [orderItemLatestDetails, setOrderItemLatestDetails] = useState<{
    [key: number]: OrderItem;
  }>({});
  const [amount, setAmount] = useState<{
    [key: number]: number;
  }>({});
  const [price, setPrice] = useState<{
    [key: number]: number;
  }>({});
  const [selectedAmountUnit, setSelectedAmountUnit] = useState<{
    [key: number]: OptionType;
  }>({});
  const [selectedPriceUnit, setSelectedPriceUnit] = useState<{
    [key: number]: OptionType;
  }>({});
  const [suppliers, setSuppliers] = useState([]);
  const [orderDate, setOrderDate] = useState(new Date());
  const params = useParams() as any;
  const [createSupplierOrder, { isLoading, isError, error }] =
    useCreateSupplierOrderMutation();
  const [updateSupplierOrder] = useUpdateInventorySupplierOrderMutation();
  const [deleteInventorySupplierOrder] =
    useDeleteInventorySupplierOrderMutation();
  const history = useHistory();
  const [getInventorySupplierOrderById] =
    useLazyGetInventorySupplierOrderByIdQuery();
  const [getLatestOrderDetailsQuery] = useLazyGetLatestOrderDetailsQuery();
  const { data: inventoryData = [] } = useGetInventoryQuery();
  const [getSuppliers] = useLazyGetInventorySupplierQuery();
  const [getSupplierById] = useLazyGetInventorySupplierByIdQuery();
  useEffect(() => {
    (async () => {
      if (params.inventorySupplierOrderId) {
        const orderRes = await getInventorySupplierOrderById({
          inventorySupplierId: params.inventorySupplierId,
          inventorySupplierOrderId: params.inventorySupplierOrderId,
        });
        if (dayjs(orderRes.data.orderDate).isValid()) {
          setOrderDate(dayjs(orderRes.data.orderDate).toDate());
        }
        const orderInventory: Array<{ label: string; value: number }> = [];
        const amountTemp: { [key: number]: number } = {};
        const selectedAmountTemp: { [key: number]: OptionType } = {};
        const priceTemp: { [key: number]: number } = {};
        const selectedPriceTemp: { [key: number]: OptionType } = {};
        orderRes.data.orderItems.forEach((order) => {
          amountTemp[order.inventory.id] = order.amount;
          priceTemp[order.inventory.id] = order.price;
          selectedAmountTemp[order.inventory.id] = {
            label: order.amountUnit,
            value: order.amountUnit,
          };
          selectedPriceTemp[order.inventory.id] = {
            label: order.priceUnit,
            value: order.priceUnit,
          };
          const inventoryMatch = inventoryData.find(
            (inv) => inv.id === order.inventory.id
          );
          if (!inventoryMatch) return;
          orderInventory.push({
            label: inventoryMatch.name,
            value: order.inventory.id,
          });
        });
        setAmount(amountTemp);
        setSelectedAmountUnit(selectedAmountTemp);
        setPrice(priceTemp);
        setSelectedPriceUnit(selectedPriceTemp);
        setSelectedInventory(orderInventory);
      }
    })();
  }, [
    inventoryData,
    getInventorySupplierOrderById,
    params.inventorySupplierId,
    params.inventorySupplierOrderId,
  ]);

  useEffect(() => {
    (async () => {
      if (params.inventorySupplierOrderId) return;
      selectedInventory.forEach(async (inv: OptionType) => {
        if (orderItemLatestDetails[Number(inv.value)]) {
          return;
        }

        const latestOrderRes = await getLatestOrderDetailsQuery({
          inventorySupplierId: params.inventorySupplierId,
          inventoryId: Number(inv.value),
        });
        const orderItem = latestOrderRes.data.orderItem;
        if (!orderItem) return;
        setOrderItemLatestDetails({
          ...orderItemLatestDetails,
          [Number(inv.value)]: orderItem,
        });
        setAmount({
          ...amount,
          [Number(inv.value)]: orderItem.amount,
        });
        setPrice({
          ...price,
          [Number(inv.value)]: orderItem.price,
        });
        setSelectedAmountUnit({
          ...selectedAmountUnit,
          [Number(inv.value)]: {
            label: orderItem.amountUnit,
            value: orderItem.amountUnit,
          },
        });
        setSelectedPriceUnit({
          ...selectedPriceUnit,
          [Number(inv.value)]: {
            label: orderItem.priceUnit,
            value: orderItem.priceUnit,
          },
        });
      });
    })();
  }, [
    selectedInventory,
    orderItemLatestDetails,
    getLatestOrderDetailsQuery,
    params.inventorySupplierId,
    params.inventorySupplierOrderId,
    amount,
    price,
    selectedAmountUnit,
    selectedPriceUnit,
  ]);
  useEffect(() => {
    // getting the supplier mentioned in params or getting all the suppliers
    (async () => {
      if (params.inventorySupplierId) {
        const supplierData = await getSupplierById({
          inventorySupplierId: params.inventorySupplierId,
        });
        setSelectedSupplier({
          label: supplierData.data.name,
          value: supplierData.data.id,
        });
        setSuppliers([supplierData.data]);
      } else {
        const suppliersRes = await getSuppliers();
        setSuppliers(suppliersRes.data);
      }
    })();
  }, [params.inventorySupplierId, getSupplierById, getSuppliers]);

  const saveInventorySupplierOrder = async () => {
    if (!selectedSupplier) return;
    const data: any = {
      id: selectedSupplier.value,
      orderDate,
      orderItems: [],
    };
    selectedInventory.forEach((inv: OptionType) => {
      data.orderItems.push({
        inventoryId: inv.value,
        amount: amount[Number(inv.value)],
        amountUnit: selectedAmountUnit[Number(inv.value)].value,
        price: price[Number(inv.value)],
        priceUnit: selectedPriceUnit[Number(inv.value)].value,
      });
    });
    try {
      if (params.inventorySupplierOrderId) {
        data.orderId = params.inventorySupplierOrderId;
        await updateSupplierOrder(data);
      } else {
        await createSupplierOrder(data);
      }
      history.push(links.supplyOrders);
    } catch (e) {
      alert(e.toString());
    }
  };

  return (
    <Flex direction="column">
      <Flex gap="20px">
        <FormControl>
          <FormLabel>Select Order Items</FormLabel>
          <Select
            options={inventoryData.map((inv) => ({
              label: inv.name,
              value: inv.id,
            }))}
            isMulti
            value={selectedInventory}
            onChange={(newSelectedInventory) =>
              setSelectedInventory([...newSelectedInventory])
            }
            isDisabled={!selectedSupplier}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Order date</FormLabel>
          <DatePicker
            selected={orderDate}
            onChange={(date: Date) => setOrderDate(date)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Suplier</FormLabel>
          <Select
            options={suppliers.map((inv) => ({
              label: inv.name,
              value: inv.id,
            }))}
            value={selectedSupplier}
            onChange={(newSelectedSupplier) =>
              setSelectedSupplier(newSelectedSupplier)
            }
            isDisabled={params.inventorySupplierId}
          />
        </FormControl>
      </Flex>
      {selectedInventory.map((inv: OptionType, index) => {
        return (
          <Flex key={index}>
            <FormControl>
              <FormLabel>Inventory name</FormLabel>
              <Input
                placeholder={inv.label}
                value={inv.label}
                disabled={true}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <Input
                placeholder="Amount"
                value={amount[Number(inv.value)] || ""}
                onChange={(e) => {
                  setAmount({
                    ...amount,
                    [inv.value]: Number(e.target.value),
                  });
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Amount Unit</FormLabel>
              <Select
                placeholder="Select amount Unit"
                value={selectedAmountUnit[Number(inv.value)]}
                onChange={(newSelectedUnit) => {
                  setSelectedAmountUnit({
                    ...selectedAmountUnit,
                    [inv.value]: newSelectedUnit,
                  });
                }}
                options={[
                  { label: "kg", value: "kg" },
                  { label: "gram", value: "g" },
                ]}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Price</FormLabel>
              <Input
                placeholder="Price"
                value={price[Number(inv.value)] || ""}
                onChange={(e) => {
                  setPrice({
                    ...price,
                    [inv.value]: Number(e.target.value),
                  });
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Price Unit</FormLabel>
              <Select
                placeholder="Select price unit"
                value={selectedPriceUnit[Number(inv.value)]}
                onChange={(newSelectedUnit) => {
                  setSelectedPriceUnit({
                    ...selectedPriceUnit,
                    [inv.value]: newSelectedUnit,
                  });
                }}
                options={[
                  { label: "kg", value: "kg" },
                  { label: "gram", value: "g" },
                ]}
              />
            </FormControl>
          </Flex>
        );
      })}
      <Box mt={5}>
        <Button colorScheme="teal" onClick={saveInventorySupplierOrder}>
          Save
        </Button>
        {params.inventorySupplierOrderId ? (
          <Button
            ml={4}
            colorScheme="red"
            onClick={() => setIsDeleteDialogOpened(true)}
          >
            Delete
          </Button>
        ) : null}
      </Box>

      {isDeleteDialogOpened ? (
        <AlertDialog
          handleConfirm={async () => {
            await deleteInventorySupplierOrder({
              supplierId: params.inventorySupplierId,
              orderId: params.inventorySupplierOrderId,
            });
            history.push(links.supplyOrders);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={`Are you sure? You can't undo this action afterwards.`}
          headerText={`Delete Inventory`}
        />
      ) : null}
    </Flex>
  );
};

export default UpsertSupplierOrder;
