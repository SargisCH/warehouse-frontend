import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMoveProductMutation } from "api/product";
import { useGetWarehouseQuery } from "api/warehouse";
import { getSelectErrorStyles } from "helpers/styles";
import { transformOptions } from "helpers/transformOptions";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import * as z from "zod";

const ValidationSchema = z.object({
  warehouseId: z.string().min(1, { message: "Warehouse is required" }),
  products: z.array(
    z.object({
      productId: z.number().min(1, { message: "Product is required" }),
      quantity: z.number().min(1, { message: "Quantity is required" }),
    }),
  ),
});

export default function MoveToWarehouseModal<
  RowType extends { name: string; id: string | number },
>({
  isOpen,
  onClose,
  rowSelection,
  selectedRowData,
}: {
  isOpen: boolean;
  onClose: () => void;
  rowSelection: { [key: string]: boolean };
  selectedRowData: RowType[];
}) {
  const [selectedMoveWarehouse, setSelectedMoveWarehouse] = useState<{
    label: string;
    value: string;
  }>();
  const { data: warehouses = [] } = useGetWarehouseQuery();
  const warehouseOptions = transformOptions(warehouses, {
    label: "name",
    value: "id",
  });
  const [moveProductMutation] = useMoveProductMutation();
  const { t } = useTranslation();
  const getLabel = (
    id: string,
    options: { label: string; value: string }[],
  ) => {
    const selectedLabel = options.find((op) => String(op.value) === id)?.label;
    return selectedLabel ?? "";
  };
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      warehouseId: null,
      products: [],
    },
    resolver: zodResolver(ValidationSchema),
  });
  const { fields, append } = useFieldArray({
    control,
    name: "products",
  });
  useEffect(() => {
    append(
      selectedRowData.map((prod) => ({
        productId: Number(prod.id),
        quantity: 0,
      })),
    );
  }, [selectedRowData, append]);
  console.log("fields", fields);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("common.product.moveToWarehouse")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form>
            <Controller
              name="warehouseId"
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={!!errors.warehouseId}>
                  <FormLabel>{t("common.warehouse.warehouse")}</FormLabel>
                  <Select
                    styles={{
                      control: (baseStyles) => ({
                        ...baseStyles,
                        ...getSelectErrorStyles(!!errors.warehouseId),
                      }),
                    }}
                    value={{
                      label: getLabel(String(field.value), warehouseOptions),
                      value: field.value,
                    }}
                    onChange={(valueSelected) => {
                      field.onChange(valueSelected.value);
                    }}
                    options={warehouseOptions}
                  />
                  <FormErrorMessage>
                    {errors.warehouseId?.message.toString()}
                  </FormErrorMessage>
                </FormControl>
              )}
            />
            <Flex mt={4} direction="column" gap={4}>
              {fields?.map((rowData, index) => {
                const productIdError = errors?.products?.[index]?.productId;
                const quantityError =
                  errors?.products?.[index]?.quantity?.message;

                return (
                  <Flex gap={4}>
                    <Controller
                      name={`products.${index}.productId`}
                      control={control}
                      render={({ field }) => (
                        <FormControl isInvalid={!!productIdError}>
                          <FormLabel>{t("common.productSingle")}</FormLabel>
                          <Input
                            value={
                              selectedRowData.find(
                                (row) => Number(row.id) === field.value,
                              )?.name || ""
                            }
                            disabled={true}
                          />
                          <FormErrorMessage>
                            {productIdError?.message.toString()}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    />
                    <Controller
                      name={`products.${index}.quantity`}
                      control={control}
                      render={({ field }) => (
                        <FormControl isInvalid={!!quantityError}>
                          <FormLabel>{t("common.amount")}</FormLabel>
                          <NumberInput value={field.value}>
                            <NumberInputField
                              placeholder={"quantity"}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          </NumberInput>
                        </FormControl>
                      )}
                    />{" "}
                  </Flex>
                );
              })}
            </Flex>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            colorScheme="brand"
            onClick={async () => {
              await moveProductMutation({
                ids: Object.keys(rowSelection),
                warehouseId: selectedMoveWarehouse.value,
              });
              onClose();
            }}
          >
            {t("common.save")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
