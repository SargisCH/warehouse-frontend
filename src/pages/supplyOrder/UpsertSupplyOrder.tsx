import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Box,
  NumberInput,
  NumberInputField,
  useBreakpointValue,
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
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import { links } from "routes";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { generateKey } from "helpers/generateKey";
import { PaymentType } from "api/client";
import { useTranslation } from "react-i18next";

const paymentTypeOptions = [
  {
    label: PaymentType.CASH,
    value: PaymentType.CASH,
  },
  {
    label: PaymentType.TRANSFER,
    value: PaymentType.TRANSFER,
  },
  {
    label: PaymentType.CREDIT,
    value: PaymentType.CREDIT,
  },
  {
    label: PaymentType.PARTIAL_CREDIT,
    value: PaymentType.PARTIAL_CREDIT,
  },
];

type OrderType = {
  orderId?: number;
  supplierId: number;
  orderDate: Date;
  paymentType: string;
  partialCreditAmount?: number;
  orderItems: Array<{
    inventoryId: number;
    amount: number;
    price: number;
    amountUnit: string;
    priceUnit: string;
    reactKey?: string;
  }>;
};

const intialValues: OrderType = {
  supplierId: null,
  paymentType: "",
  orderDate: dayjs().toDate(),
  orderItems: [],
};
const UpsertSupplierOrder = () => {
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [orderItemLatestDetails, setOrderItemLatestDetails] = useState<{
    [key: number]: OrderItem;
  }>({});
  const [suppliers, setSuppliers] = useState([]);
  const params = useParams() as any;
  const [createSupplierOrder] = useCreateSupplierOrderMutation();
  const [updateSupplierOrder] = useUpdateInventorySupplierOrderMutation();
  const [deleteInventorySupplierOrder] =
    useDeleteInventorySupplierOrderMutation();
  const history = useHistory();
  const [getInventorySupplierOrderById] =
    useLazyGetInventorySupplierOrderByIdQuery();
  const [getLatestOrderDetailsQuery] = useLazyGetLatestOrderDetailsQuery();
  const { data } = useGetInventoryQuery();
  const inventoryData = useMemo(
    () => data?.inventories || [],
    [data?.inventories],
  );
  const [getSuppliers] = useLazyGetInventorySupplierQuery();
  const [getSupplierById] = useLazyGetInventorySupplierByIdQuery();
  const { t } = useTranslation();
  const unitOptions = [
    { label: "kg", value: "kg" },
    { label: "gram", value: "g" },
    { label: t("common.piece"), value: "piece" },
  ];
  const { values, setFieldValue, handleSubmit, isSubmitting } = useFormik({
    initialValues: { ...intialValues },
    onSubmit: async (values) => {
      const data: OrderType = {
        ...values,
        paymentType: values.paymentType as PaymentType,
        orderItems: values.orderItems.map((oi) => ({
          ...oi,
          amount: Number(oi.amount),
          price: Number(oi.price),
          reactKey: undefined,
        })),
      };
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
    },
  });
  const inventoryOptions = inventoryData.map((inventory) => ({
    label: inventory.name,
    value: inventory.id,
  }));
  const supplierOptions = suppliers?.map((s) => ({
    label: s.name,
    value: s.id,
  }));

  const isMobile = useBreakpointValue({ base: true, md: false });
  useEffect(() => {
    (async () => {
      if (params.inventorySupplierOrderId) {
        const orderRes = await getInventorySupplierOrderById({
          inventorySupplierId: params.inventorySupplierId,
          inventorySupplierOrderId: params.inventorySupplierOrderId,
        });
        const initialValuesRes: Partial<OrderType> = {
          supplierId: params.inventorySupplierId,
          orderItems: orderRes.data.orderItems.map((oi) => {
            return {
              amount: oi.amount,
              amountUnit: oi.amountUnit,
              price: oi.price,
              priceUnit: oi.priceUnit,
              inventoryId: oi.inventoryId,
              reactKey: generateKey("orderItems"),
            };
          }),
        };
        if (dayjs(orderRes.data.orderDate).isValid()) {
          initialValuesRes.orderDate = dayjs(orderRes.data.orderDate).toDate();
        }
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

      values.orderItems.forEach(async (oi, oiIndex) => {
        if (!oi.inventoryId || orderItemLatestDetails[oi.inventoryId]) {
          return;
        }

        const latestOrderRes = await getLatestOrderDetailsQuery({
          inventorySupplierId: params.inventorySupplierId,
          inventoryId: Number(oi.inventoryId),
        });
        const orderItem = latestOrderRes.data.orderItem;
        if (!orderItem) return;
        setOrderItemLatestDetails({
          ...orderItemLatestDetails,
          [oi.inventoryId]: orderItem,
        });
        setFieldValue(`orderItems[${oiIndex}].amount`, orderItem.amount);
        setFieldValue(`orderItems[${oiIndex}].price`, orderItem.price);
        setFieldValue(`orderItems[${oiIndex}].priceUnit`, orderItem.priceUnit);
        setFieldValue(
          `orderItems[${oiIndex}].amountUnit`,
          orderItem.amountUnit,
        );
      });
    })();
  }, [
    setFieldValue,
    values.orderItems,
    orderItemLatestDetails,
    getLatestOrderDetailsQuery,
    params.inventorySupplierId,
    params.inventorySupplierOrderId,
  ]);
  useEffect(() => {
    // getting the supplier mentioned in params or getting all the suppliers
    (async () => {
      if (params.inventorySupplierId) {
        const supplierData = await getSupplierById({
          inventorySupplierId: params.inventorySupplierId,
        });
        setFieldValue("supplierId", Number(params.inventorySupplierId));
        setSuppliers([supplierData.data]);
      } else {
        const suppliersRes = await getSuppliers();
        setSuppliers(suppliersRes.data);
      }
    })();
  }, [
    params.inventorySupplierId,
    getSupplierById,
    getSuppliers,
    setFieldValue,
  ]);

  const selectedSupplier = suppliers.find((s) => s.id === values.supplierId);
  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Flex gap="20px" flexDirection={isMobile ? "column" : "row"}>
          <FormControl>
            <FormLabel>Order date</FormLabel>
            <DatePicker
              selected={values.orderDate}
              onChange={(date: Date) => setFieldValue("orderDate", date)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Suplier</FormLabel>
            <Select
              options={supplierOptions}
              value={{
                label: selectedSupplier?.name || "",
                value: selectedSupplier?.id || "",
              }}
              onChange={(newSelectedSupplier) =>
                setFieldValue("supplierId", newSelectedSupplier.value)
              }
              isDisabled={params.inventorySupplierId}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Payment Type</FormLabel>
            <Select
              options={paymentTypeOptions}
              value={paymentTypeOptions.find(
                (op) => op.value === values.paymentType,
              )}
              onChange={(op) => {
                setFieldValue("paymentType", op.value);

                console.log("set field", values.orderItems.length);
                if (!values.orderItems.length) {
                  console.log("set field 2", values.orderItems.length);
                  setFieldValue("orderItems", [
                    ...values.orderItems,
                    {
                      inventoryId: null,
                      amount: 0,
                      amountUnit: "",
                      price: 0,
                      priceUnit: "",
                      reactKey: generateKey("orderItem"),
                    },
                  ]);
                }
              }}
            />
          </FormControl>
          {values.paymentType === PaymentType.PARTIAL_CREDIT ? (
            <FormControl>
              <FormLabel>Partial credit amount</FormLabel>
              <NumberInput value={values.partialCreditAmount}>
                <NumberInputField
                  name={"partialCreditAmount"}
                  placeholder="How is paid right now"
                  onChange={(e) => {
                    setFieldValue("partialCreditAmount", e.target.value);
                  }}
                />
              </NumberInput>
            </FormControl>
          ) : null}
        </Flex>
        {values.orderItems.map((oi, oiIndex) => {
          const selectedAmountUnit = unitOptions.find(
            (op) => oi.amountUnit === op.value,
          );
          const selectedPriceUnit = unitOptions.find(
            (op) => oi.priceUnit === op.value,
          );
          const selectedInventory = inventoryData.find(
            (inv) => inv.id === oi.inventoryId,
          );
          return (
            <Flex
              gap={"20px"}
              key={oi.reactKey}
              flexDirection={isMobile ? "column" : "row"}
            >
              <FormControl>
                <FormLabel>Select Inventory</FormLabel>
                <Select
                  name={`orderItems[${oiIndex}].inventoryId`}
                  placeholder="Select Inventory"
                  value={{
                    label: selectedInventory?.name ?? "",
                    value: selectedInventory?.id ?? "",
                  }}
                  onChange={(newSelectedUnit) => {
                    setFieldValue(
                      `orderItems[${oiIndex}].inventoryId`,
                      newSelectedUnit.value,
                    );
                  }}
                  options={inventoryOptions}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Amount</FormLabel>
                <NumberInput value={oi.amount}>
                  <NumberInputField
                    placeholder="Amount"
                    name={`orderItems[${oiIndex}].amount`}
                    onChange={(e) => {
                      setFieldValue(
                        `orderItems[${oiIndex}].amount`,
                        e.target.value,
                      );
                    }}
                  />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Amount Unit</FormLabel>
                <Select
                  name={`orderItems[${oiIndex}].amountUnit`}
                  placeholder="Select amount Unit"
                  value={{
                    label: selectedAmountUnit?.label ?? "",
                    value: selectedAmountUnit?.value ?? "",
                  }}
                  onChange={(newSelectedUnit) => {
                    setFieldValue(
                      `orderItems[${oiIndex}].amountUnit`,
                      newSelectedUnit.value,
                    );
                  }}
                  options={unitOptions}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Price</FormLabel>
                <NumberInput value={oi.price}>
                  <NumberInputField
                    name={`orderItems[${oiIndex}].price`}
                    placeholder="Price"
                    onChange={(e) => {
                      setFieldValue(
                        `orderItems[${oiIndex}].price`,
                        e.target.value,
                      );
                    }}
                  />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Price Unit</FormLabel>
                <Select
                  placeholder="Select price unit"
                  name={`orderItems[${oiIndex}].priceUnit`}
                  value={{
                    label: selectedPriceUnit?.label || "",
                    value: selectedPriceUnit?.value || "",
                  }}
                  onChange={(newSelectedUnit) => {
                    setFieldValue(
                      `orderItems[${oiIndex}].priceUnit`,
                      newSelectedUnit.value,
                    );
                  }}
                  options={unitOptions}
                />
              </FormControl>
              <FormControl
                width={"auto"}
                alignItems="flex-end"
                display={"flex"}
                marginBottom={1}
              >
                <Button
                  colorScheme={"teal"}
                  onClick={() => {
                    setFieldValue("orderItems", [
                      ...values.orderItems,
                      {
                        inventoryId: null,
                        amount: 0,
                        amountUnit: "",
                        price: 0,
                        priceUnit: "",
                        reactKey: generateKey("orderItem"),
                      },
                    ]);
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </Button>
              </FormControl>
              <FormControl
                width={"auto"}
                alignItems="flex-end"
                display={"flex"}
                marginBottom={1}
              >
                <Button
                  colorScheme={"red"}
                  onClick={() => {
                    setFieldValue(
                      "orderItems",
                      values.orderItems.filter((_, index) => index !== oiIndex),
                    );
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </FormControl>
            </Flex>
          );
        })}
        <Box mt={5}>
          <Button
            colorScheme="teal"
            type="submit"
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            {t("common.save")}
          </Button>
          {params.inventorySupplierOrderId ? (
            <Button
              ml={4}
              colorScheme="red"
              onClick={() => setIsDeleteDialogOpened(true)}
            >
              {t("common.delete")}
            </Button>
          ) : null}
        </Box>
      </form>
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
    </Box>
  );
};

export default UpsertSupplierOrder;
