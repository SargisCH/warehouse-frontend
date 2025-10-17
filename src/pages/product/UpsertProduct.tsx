import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  NumberInput,
  NumberInputField,
  useBreakpointValue,
  Text,
  FormErrorMessage,
  Switch,
  Box,
} from "@chakra-ui/react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useDeleteProductMutation,
  useLazyGetProductByIdQuery,
  useUpdateProductMutation,
  useCreateProductMutation,
  useGetProductQuery,
} from "api/product";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Select, { Options } from "react-select";
import { links } from "../../routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { generateKey } from "helpers/generateKey";
import { useTranslation } from "react-i18next";
import { useGetUnitsQuery } from "api/unit";
import { useGetWarehouseQuery } from "api/warehouse";
import { useGetProductGroupQuery } from "api/productGroup";
import { Controller, useFieldArray, useForm } from "react-hook-form";

const ValidationSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  officialName: z.string().min(1, { message: "Official is required." }),
  unitId: z.string().min(1, { message: "Unit is required." }),
  productGroupId: z.string().min(1, { message: "Product Grop is required." }),
  warehouseId: z.string().min(1, { message: "warehouse  is required." }),
  fractional: z.boolean().optional(),
  returnable: z.boolean().optional(),
  forSale: z.boolean().optional(),
  ingredients: z
    .array(
      z.object({
        unitId: z.string().min(1, { message: "unit is required" }),
        quantity: z.string().min(1, { message: "quantitiy is required" }),
        productId: z.string().min(1, { message: "Product is required" }),
      }),
    )
    .optional(),
});

type ProductFormType = z.infer<typeof ValidationSchema>;

const getErrorStyles = (error: boolean) => {
  if (error) {
    return { borderColor: "red", borderWidth: "2px" };
  }

  return {};
};
type OptionData = {
  name: string;
  id: number;
};

const UpsertProduct = (props: { create: boolean }) => {
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);

  const params = useParams() as any;
  const [ingredientsOpened, setIngredientsOpened] = useState(false);
  const [createProduct, { isError, error }] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const history = useHistory();
  const { t } = useTranslation();
  const [getProductById, { isLoading }] = useLazyGetProductByIdQuery();
  const { data: productResponse } = useGetProductQuery(undefined);
  const { data: units = [] } = useGetUnitsQuery();
  const { data: warehouses = [] } = useGetWarehouseQuery();
  const { data: productGroups = [] } = useGetProductGroupQuery();
  const products = productResponse?.data || [];
  const getLabel = (
    id: string,
    options: { label: string; value: string }[],
  ) => {
    const selectedLabel = options.find((op) => String(op.value) === id)?.label;
    return selectedLabel ?? "";
  };
  const unitOptions = units.map((unit) => ({
    label: t(`common.units.${unit.name}`),
    value: String(unit.id),
  }));
  const getOptions = (data: OptionData[]) =>
    data.map((warehouse) => ({
      label: warehouse.name,
      value: String(warehouse.id),
    }));
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductFormType>({
    resolver: zodResolver(ValidationSchema),
    defaultValues: {
      name: "",
      officialName: "",
      unitId: "",
      warehouseId: "",
      productGroupId: "",
      returnable: false,
      forSale: false,
      fractional: false,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  const isMobile = useBreakpointValue({ base: true, md: false });
  useEffect(() => {
    (async () => {
      if (params.productId) {
        const productItemRes = await getProductById({
          productId: params.productId,
        });
        if (!productItemRes.data) return;
        reset({
          name: productItemRes.data.name,
          officialName: productItemRes.data.officialName,
          unitId: String(productItemRes.data.unitId),
          warehouseId: String(productItemRes.data.warehouseId),
          productGroupId: String(productItemRes.data.groupId),
          forSale: productItemRes.data.forSale,
          returnable: productItemRes.data.returnable,
          fractional: productItemRes.data.fractional,
          ingredients: productItemRes?.data?.ingredients?.map((ing) => ({
            ...ing,
            quantity: String(ing.quantity),
            unitId: String(ing.unitId),
            productId: String(ing.productId),
            reactKey: generateKey("ingredient"),
          })),
        });
        if (productItemRes.data.ingredients.length) {
          setIngredientsOpened(true);
        }
      }
    })();
  }, [params.productId, getProductById, reset]);
  const onSubmit = async (values: ProductFormType) => {
    const postData = {
      ...values,
      unitId: Number(values.unitId),
      warehouseId: Number(values.warehouseId),
      groupId: Number(values.productGroupId),
      ingredients: !ingredientsOpened
        ? []
        : values.ingredients.map((ing) => ({
            ...ing,
            quantity: Number(ing.quantity),
            unitId: Number(ing.unitId),
            productId: Number(ing.productId),
          })),
    };
    if (params.productId) {
      await updateProduct({
        ...postData,
        id: params.productId,
      });
    } else {
      console.log("else");
      await createProduct({ ...postData });
    }
    history.push(links.product);
  };

  if (isLoading) {
    return (
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    );
  }
  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex gap="20px" flexDirection={isMobile ? "column" : "row"}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>{t("common.name")}</FormLabel>
                <Input {...field} placeholder={t("common.name")} />
                {errors.name ? (
                  <FormErrorMessage>
                    {errors.name?.message.toString()}
                  </FormErrorMessage>
                ) : null}
              </FormControl>
            )}
          />
          <Controller
            name="officialName"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.officialName}>
                <FormLabel>{t("common.product.officialName")}</FormLabel>
                <Input
                  {...field}
                  placeholder={t("common.product.officialName")}
                />
                {errors.officialName ? (
                  <FormErrorMessage>
                    {errors.officialName.message}
                  </FormErrorMessage>
                ) : null}
              </FormControl>
            )}
          />
          <Controller
            name="unitId"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.unitId}>
                <FormLabel>{t("common.unit")}</FormLabel>
                <Select
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      ...getErrorStyles(!!errors.unitId),
                    }),
                  }}
                  value={{
                    label: getLabel(String(field.value), unitOptions),
                    value: field.value,
                  }}
                  onChange={(valueSelected) => {
                    field.onChange(valueSelected.value);
                  }}
                  options={unitOptions}
                />
                <FormErrorMessage>{errors.unitId?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
        </Flex>

        <Flex gap="20px" mt="4">
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
                      ...getErrorStyles(!!errors.warehouseId),
                    }),
                  }}
                  value={{
                    label: getLabel(
                      field.value,
                      getOptions(warehouses as OptionData[]),
                    ),
                    value: field.value,
                  }}
                  onChange={(valueSelected) => {
                    field.onChange(valueSelected.value);
                  }}
                  options={getOptions(warehouses as OptionData[])}
                />
                <FormErrorMessage>
                  {errors.warehouseId?.message}
                </FormErrorMessage>
              </FormControl>
            )}
          />
          <Controller
            name="productGroupId"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.productGroupId}>
                <FormLabel>{t("common.productGroups.productGroups")}</FormLabel>
                <Select
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      ...getErrorStyles(!!errors.productGroupId),
                    }),
                  }}
                  value={{
                    label: getLabel(
                      String(field.value),
                      getOptions(productGroups as OptionData[]),
                    ),
                    value: field.value,
                  }}
                  onChange={(valueSelected) => {
                    field.onChange(valueSelected.value);
                  }}
                  options={getOptions(productGroups as OptionData[])}
                />
                <FormErrorMessage>
                  {errors.productGroupId?.message}
                </FormErrorMessage>
              </FormControl>
            )}
          />
        </Flex>
        <Flex mt="4">
          <Controller
            name="forSale"
            control={control}
            render={({ field }) => (
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="for-sale" mb="0">
                  {t("common.product.forSale")}
                </FormLabel>
                <Switch
                  id="for-sale"
                  onChange={() => field.onChange(!field.value)}
                  isChecked={field.value}
                />
              </FormControl>
            )}
          />
          <Controller
            name="returnable"
            control={control}
            render={({ field }) => (
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="returnable" mb="0">
                  {t("common.product.returnable")}
                </FormLabel>
                <Switch
                  id="returnable"
                  onChange={() => field.onChange(!field.value)}
                  isChecked={field.value}
                />
              </FormControl>
            )}
          />
          <Controller
            name="fractional"
            control={control}
            render={({ field }) => (
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="fractional" mb="0">
                  {t("common.product.fractional")}
                </FormLabel>
                <Switch
                  id="fractional"
                  onChange={() => field.onChange(!field.value)}
                  isChecked={field.value}
                />
              </FormControl>
            )}
          />
        </Flex>
        <Flex mt="4">
          {t("common.set")}
          <Switch
            id="set"
            ml="4"
            isChecked={ingredientsOpened}
            onChange={() => {
              setIngredientsOpened(!ingredientsOpened);
              if (!fields.length) {
                append({
                  productId: "",
                  quantity: "",
                  unitId: "",
                });
              }
            }}
          />
        </Flex>
        {ingredientsOpened
          ? fields.map((row, index) => {
              const ingredientErrors = errors.ingredients;
              const productIdError = ingredientErrors?.[index]?.productId;
              const quantityError = ingredientErrors?.[index]?.quantity;
              const unitIdError = ingredientErrors?.[index]?.unitId;
              return (
                <Flex
                  gap={"20px"}
                  marginTop="20px"
                  key={row.id}
                  flexDirection={isMobile ? "column" : "row"}
                  width={"100%"}
                >
                  <Controller
                    name={`ingredients.${index}.productId`}
                    control={control}
                    render={({ field }) => (
                      <FormControl isInvalid={!!productIdError}>
                        <FormLabel>{t("common.ingredients")}</FormLabel>
                        <Select
                          styles={{
                            control: (baseStyles) => ({
                              ...baseStyles,
                              ...getErrorStyles(!!productIdError),
                            }),
                          }}
                          value={{
                            label: getLabel(
                              String(field.value),
                              getOptions(products as OptionData[]),
                            ),
                            value: field.value,
                          }}
                          onChange={(valueSelected) => {
                            field.onChange(valueSelected.value);
                          }}
                          options={getOptions(products as OptionData[])}
                        />
                        <FormErrorMessage>
                          {productIdError?.message}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  />
                  <Controller
                    name={`ingredients.${index}.quantity`}
                    control={control}
                    render={({ field }) => (
                      <FormControl isInvalid={!!quantityError}>
                        <FormLabel>{t("common.amount")}</FormLabel>
                        <NumberInput value={field.value}>
                          <NumberInputField
                            placeholder={"amount"}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                            }}
                          />
                        </NumberInput>

                        <FormErrorMessage>
                          {quantityError?.message}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  />
                  <Controller
                    name={`ingredients.${index}.unitId`}
                    control={control}
                    render={({ field }) => (
                      <FormControl isInvalid={!!unitIdError}>
                        <FormLabel>{t("common.unit")}</FormLabel>
                        <Select
                          styles={{
                            control: (baseStyles) => ({
                              ...baseStyles,
                              ...getErrorStyles(!!unitIdError),
                            }),
                          }}
                          value={{
                            label: getLabel(String(field.value), unitOptions),
                            value: field.value,
                          }}
                          onChange={(valueSelected) => {
                            field.onChange(valueSelected.value);
                          }}
                          options={unitOptions}
                        />
                        <FormErrorMessage>
                          {unitIdError?.message.toString()}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  />
                  <FormControl
                    width={"auto"}
                    alignItems="flex-end"
                    display={"flex"}
                    marginBottom={1}
                  >
                    <Button
                      background="teal.500"
                      onClick={() => {
                        append({
                          quantity: "",
                          unitId: "",
                          productId: "",
                        });
                      }}
                    >
                      {isMobile ? <Text mr={2}>{t("common.add")}</Text> : null}
                      <FontAwesomeIcon icon={faPlus} />
                    </Button>
                  </FormControl>
                  <FormControl
                    width="auto"
                    alignItems="flex-end"
                    display={"flex"}
                    marginBottom={1}
                  >
                    <Button
                      isDisabled={index === 0}
                      background="red.500"
                      onClick={() => remove(index)}
                    >
                      {isMobile ? (
                        <Text mr={2}>{t("common.delete")}</Text>
                      ) : null}
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </FormControl>
                </Flex>
              );
            })
          : null}
        <Box marginTop={"20px"}>
          <Button colorScheme="teal" type="submit" disabled={isSubmitting}>
            {t("common.save")}
          </Button>
        </Box>
      </form>
      {isDeleteDialogOpened ? (
        <AlertDialog
          handleConfirm={async () => {
            await deleteProduct(params.productId);
            history.push(links.product);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={`Are you sure? You can't undo this action afterwards.`}
          headerText={`Delete Product`}
        />
      ) : null}
    </Box>
  );
};

export default UpsertProduct;
