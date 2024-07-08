import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Box,
  NumberInput,
  NumberInputField,
  Text,
  useDisclosure,
  useBreakpointValue,
} from "@chakra-ui/react";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  InventoryEntry,
  useCreateInventoryEntryMutation,
  useGetInventoryQuery,
  useLazyGetInventoryEntryByIdQuery,
  useUpdateInventoryEntryMutation,
} from "api/inventory";
import { useGetInventorySupplierQuery } from "api/inventorySupplier";
import { useFormik } from "formik";
import withAdminRoute from "hocs/withAdminRoute";
import { useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import Select, { components, MenuProps } from "react-select";
import { links } from "routes";
import InventoryCreateModal from "./InventoryCreateModal";

interface CustomOptionType {
  label: string;
  value: string | number;
}

const CustomMenu = (
  props: MenuProps<{ label: string; value: string | number }>,
) => {
  const { t } = useTranslation();
  return (
    <components.Menu {...props}>
      <Box>
        <Box>{props.children}</Box>
        <Box borderTop={"1px solid grey"} padding="10px 5px">
          <Flex
            justifyContent={"center"}
            _hover={{
              cursor: "pointer",
            }}
          >
            <Text
              onClick={() =>
                props.selectOption({ label: "", value: "newInventory" })
              }
              color={"blue.500"}
              _hover={{
                textDecoration: "underline",
              }}
            >
              {t("common.inventory.createNewInventory")}
            </Text>
          </Flex>
        </Box>
      </Box>
    </components.Menu>
  );
};

const UpsertInventory = (props: { create: boolean }) => {
  const { t } = useTranslation();
  const params = useParams() as any;
  const [inventoryIndexToCreate, setInventoryIndexToCreate] =
    useState<number>();
  const [initialValues, setInitialValues] = useState<InventoryEntry>({
    date: new Date(),
    inventorySupplierId: null,
    inventoryEntryItems: [],
  });
  const [createInventoryEntry, { isLoading, isError, error }] =
    useCreateInventoryEntryMutation();
  const [updateInventoryEntry] = useUpdateInventoryEntryMutation();
  const { data: inventorySuppliers } = useGetInventorySupplierQuery();
  const { data, refetch } = useGetInventoryQuery();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const supplierOptions: { label: string; value: number | "noSupplier" }[] =
    inventorySuppliers?.map((sup) => ({
      label: sup.name,
      value: sup.id,
    })) ?? [];
  supplierOptions.push({
    label: t("common.inventory.noSupplier"),
    value: "noSupplier",
  });
  const history = useHistory();
  const [getInventoryEntryById] = useLazyGetInventoryEntryByIdQuery();

  const isMobile = useBreakpointValue({ base: true, md: false });
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
      const inventorySupplierId =
        values.inventorySupplierId === "noSupplier"
          ? undefined
          : values.inventorySupplierId;
      if (params.inventoryEntryId) {
        await updateInventoryEntry({
          ...values,
          inventorySupplierId,
        });
      } else {
        await createInventoryEntry({ ...values, inventorySupplierId });
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
    {
      label: t("common.piece"),
      value: "g",
    },
  ];
  const inventoryOptions: CustomOptionType[] =
    data?.inventories?.map((inv) => ({
      label: inv.name,
      value: inv.id,
    })) || [];
  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Box gap="20px">
          <Box>
            <Flex gap="20px" flexDirection={isMobile ? "column" : "row"}>
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
                  <Flex
                    flexDirection={isMobile ? "column" : "row"}
                    gap={"10px"}
                  >
                    <FormControl>
                      <FormLabel>Inventory</FormLabel>
                      <Select
                        components={{ Menu: CustomMenu }}
                        value={selectedInventory}
                        onChange={(valueSelected) => {
                          const value = (valueSelected as CustomOptionType)
                            .value;
                          if (value === "newInventory") onOpen();
                          setFieldValue(
                            `inventoryEntryItems.${index}.inventoryId`,
                            value,
                          );
                          setInventoryIndexToCreate(index);
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
                        {isMobile ? (
                          <Text mr={2} color={"white"}>
                            {t("common.add")}
                          </Text>
                        ) : null}
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
                        {isMobile ? (
                          <Text mr={2} color={"white"}>
                            {t("common.delete")}
                          </Text>
                        ) : null}
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
            {t("common.save")}
          </Button>
        </Box>
      </form>
      <InventoryCreateModal
        isOpen={isOpen}
        onClose={onClose}
        index={inventoryIndexToCreate}
        setInventoryId={(index, id) => {
          setFieldValue(`inventoryEntryItems.${index}.inventoryId`, id);
          setInventoryIndexToCreate(null);
          refetch();
        }}
      />
    </Box>
  );
};

export default withAdminRoute(UpsertInventory);
