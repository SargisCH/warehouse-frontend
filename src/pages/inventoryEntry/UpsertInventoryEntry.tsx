import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Box,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  InventoryEntry,
  InventoryItem,
  useCreateInventoryEntryMutation,
  useGetInventoryEntryByIdQuery,
  useGetInventoryQuery,
  useLazyGetInventoryEntryByIdQuery,
  useUpdateInventoryEntryMutation,
} from "api/inventory";
import { useGetInventorySupplierQuery } from "api/inventorySupplier";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useFormik } from "formik";
import withAdminRoute from "hocs/withAdminRoute";
import { useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import { links } from "routes";

const UpsertInventory = (props: { create: boolean }) => {
  const params = useParams() as any;
  const [initialValues, setInitialValues] = useState<InventoryEntry>({
    date: new Date(),
    inventorySupplierId: null,
    inventoryEntryItems: [],
  });
  const [createInventoryEntry, { isLoading, isError, error }] =
    useCreateInventoryEntryMutation();
  const [updateInventoryEntry] = useUpdateInventoryEntryMutation();
  const { data: inventorySuppliers } = useGetInventorySupplierQuery();
  const { data } = useGetInventoryQuery();
  const supplierOptions =
    inventorySuppliers?.map((sup) => ({
      label: sup.name,
      value: sup.id,
    })) ?? [];
  const history = useHistory();
  const [getInventoryEntryById] = useLazyGetInventoryEntryByIdQuery();
  useEffect(() => {
    (async () => {
      if (params.inventoryEntryId) {
        const inventoryEntryRes = await getInventoryEntryById({
          inventoryEntryId: params.inventoryEntryId,
        });
        setInitialValues({
          date: inventoryEntryRes.data.date || new Date(),
          inventorySupplierId: inventoryEntryRes.data.inventorySupplierId,
          inventoryEntryItems: inventoryEntryRes.data.inventoryEntryItems,
        });
      }
    })();
  }, [params.inventoryEntryId, getInventoryEntryById]);

  const { values, handleSubmit, setFieldValue } = useFormik<InventoryEntry>({
    initialValues,
    onSubmit: async (values) => {
      if (params.inventoryEntryId) {
        await updateInventoryEntry({
          ...values,
        });
      } else {
        await createInventoryEntry({ ...values });
      }
      history.push(links.inventoryEntry);
    },
  });
  const selectedSupplier = supplierOptions.find(
    (sup) => sup.value === values.inventorySupplierId,
  );
  const amountUnitOptions = [
    {
      label: "KG",
      value: "kg",
    },
    {
      label: "G",
      value: "g",
    },
  ];
  const inventoryOptions =
    data?.inventories?.map((inv) => ({
      label: inv.name,
      value: inv.id,
    })) || [];
  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Box gap="20px">
          <Box>
            <Flex gap="20px">
              <FormControl>
                <FormLabel>Order date</FormLabel>
                <ReactDatePicker
                  name={"date"}
                  selected={values.date}
                  onChange={(date: Date) => setFieldValue("date", date)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Inventory Supplier</FormLabel>
                <Select
                  value={selectedSupplier}
                  onChange={(valueSelected) => {
                    setFieldValue("inventorySupplierId", valueSelected.value);
                    if (
                      valueSelected.value &&
                      !values.inventoryEntryItems.length
                    ) {
                      setFieldValue("inventoryEntryItems", [
                        {
                          amount: 0,
                          amountUnit: "",
                          price: 0,
                          inventoryId: null,
                        },
                      ]);
                    }
                  }}
                  options={supplierOptions}
                />
              </FormControl>
            </Flex>
          </Box>
          <Box>
            {values.inventoryEntryItems.map((inventoryEntryItem, index) => {
              const selectedAmountUnit = amountUnitOptions.find((au) => {
                return au.value === inventoryEntryItem.amountUnit;
              });
              const selectedInventory = inventoryOptions.find((invOp) => {
                return invOp.value === inventoryEntryItem.inventoryId;
              });
              return (
                <Box>
                  <Flex gap={"10px"}>
                    <FormControl>
                      <FormLabel>Inventory</FormLabel>
                      <Select
                        value={selectedInventory}
                        onChange={(valueSelected) => {
                          setFieldValue(
                            `inventoryEntryItems.${index}.inventoryId`,
                            valueSelected.value,
                          );
                        }}
                        options={inventoryOptions}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Price</FormLabel>
                      <NumberInput
                        value={inventoryEntryItem.price}
                        onChange={(value: string) => {
                          setFieldValue(
                            `inventoryEntryItems.${index}.price`,
                            Number(value),
                          );
                        }}
                      >
                        <NumberInputField placeholder="Price" />
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Amount</FormLabel>
                      <NumberInput
                        value={inventoryEntryItem.amount}
                        onChange={(value: string) => {
                          setFieldValue(
                            `inventoryEntryItems.${index}.amount`,
                            Number(value),
                          );
                        }}
                      >
                        <NumberInputField placeholder="Price" />
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Amount unit </FormLabel>
                      <Select
                        value={selectedAmountUnit}
                        onChange={(valueSelected) => {
                          setFieldValue(
                            `inventoryEntryItems.${index}.amountUnit`,
                            valueSelected.value,
                          );
                        }}
                        options={amountUnitOptions}
                      />
                    </FormControl>
                    <FormControl
                      width={"auto"}
                      alignItems="flex-end"
                      display={"flex"}
                      marginBottom={1}
                    >
                      <Button
                        background="teal.500"
                        color={"teal"}
                        onClick={() => {
                          setFieldValue("inventoryEntryItems", [
                            ...values.inventoryEntryItems,
                            {
                              amount: 0,
                              amountUnit: "",
                              price: 0,
                              inventoryId: null,
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
                        background="red.500"
                        onClick={() => {
                          const newItems = [...values.inventoryEntryItems];
                          newItems.splice(index, 1);
                          setFieldValue("inventoryEntryItems", newItems);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </FormControl>
                  </Flex>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box mt={5}>
          <Button colorScheme="teal" type="submit">
            Save
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default withAdminRoute(UpsertInventory);
