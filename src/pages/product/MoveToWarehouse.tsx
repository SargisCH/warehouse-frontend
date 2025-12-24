import {
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
import { useEffect } from "react";
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
  selectedRowData,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  rowSelection: { [key: string]: boolean };
  selectedRowData: RowType[];
  onConfirm?: () => void;
}) {
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
    reset,
  } = useForm({
    defaultValues: {
      warehouseId: null,
      products: [],
    },
    resolver: zodResolver(ValidationSchema),
  });
  const { fields } = useFieldArray({
    control,
    name: "products",
  });
  type FormType = z.infer<typeof ValidationSchema>;
  useEffect(() => {
    if (selectedRowData.length > 0) {
      reset({
        warehouseId: null,
        products: selectedRowData.map((prod) => ({
          productId: Number(prod.id),
          quantity: 0,
        })),
      });
    }
  }, [selectedRowData, reset]);
  const onSubmit = async (values: FormType) => {
    try {
      await moveProductMutation(values);
      if (onConfirm) {
        onConfirm();
      }
    } catch (e: any) {
      alert(e?.message || e?.toString());
    }
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("common.product.moveToWarehouse")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
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
                                field.onChange(Number(e.target.value));
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
            <ModalFooter>
              <Button mr={3} variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button colorScheme="brand" type="submit">
                {t("common.save")}
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
