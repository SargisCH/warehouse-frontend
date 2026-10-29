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
  Box,
} from "@chakra-ui/react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateSupplyMutation } from "api/supply";
import { useGetDocumentQuery } from "api/document";
import { useGetWarehouseQuery } from "api/warehouse";
import { useGetProductQuery } from "api/product";
import {
  useGetPriceListsQuery,
  useLazyGetPriceListEntriesQuery,
} from "api/priceList";
import { formatMoney, lineAmount, today } from "helpers/money";
import { Supply, SupplyItem } from "types";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import { links } from "../../routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { generateKey } from "helpers/generateKey";
import { useTranslation } from "react-i18next";
import { Controller, useFieldArray, useForm } from "react-hook-form";

const ValidationSchema = z.object({
  documentId: z.string().min(1, { message: "Document is required." }),
  warehouseId: z.string().min(1, { message: "Warehouse is required." }),
  documentDate: z.string().min(1, { message: "Date is required." }),
  receiver: z.string().optional(),
  note: z.string().optional(),
  priceListId: z.string().optional(),
  products: z
    .array(
      z.object({
        productId: z.string().min(1, { message: "Product is required" }),
        amount: z.string().min(1, { message: "Amount is required" }),
        price: z.string().optional(),
      }),
    )
    .min(1, { message: "At least one product is required." }),
});

type SupplyFormType = z.infer<typeof ValidationSchema>;

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

const UpsertSupply = () => {
  const [createSupply, { isError, error, isSuccess }] =
    useCreateSupplyMutation();
  const history = useHistory();
  const { t } = useTranslation();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { data: documents = [] } = useGetDocumentQuery();
  const { data: warehouses = [] } = useGetWarehouseQuery();
  const { data: productsData } = useGetProductQuery(undefined);
  const products = productsData?.data || [];
  const { data: priceLists = [] } = useGetPriceListsQuery();
  const [getEntries] = useLazyGetPriceListEntriesQuery();
  const [listPrices, setListPrices] = useState<Record<number, string>>({});

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<SupplyFormType>({
    resolver: zodResolver(ValidationSchema),
    defaultValues: {
      documentId: "",
      warehouseId: "",
      documentDate: today(),
      receiver: "",
      note: "",
      priceListId: "",
      products: [],
    },
  });

  // «Գնացուցակի տեսակ»: fills the price of every line left without one.
  const priceListId = watch("priceListId");
  const lines = watch("products");
  useEffect(() => {
    (async () => {
      if (!priceListId) {
        setListPrices({});
        return;
      }
      const res = await getEntries({ priceListId });
      const byProduct = Object.fromEntries(
        (res.data ?? []).map((entry) => [entry.productId, entry.price]),
      );
      setListPrices(byProduct);
      getValues("products").forEach((line, index) => {
        if (
          line.productId &&
          !line.price &&
          byProduct[Number(line.productId)]
        ) {
          setValue(
            `products.${index}.price`,
            byProduct[Number(line.productId)],
          );
        }
      });
    })();
  }, [priceListId, getEntries, getValues, setValue]);
  const total = (lines ?? []).reduce(
    (sum, line) => sum + lineAmount(line.amount, line.price),
    0,
  );

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  useEffect(() => {
    if (isSuccess) {
      history.push(links.supplies); // Redirect to supplies list on success
    }
    if (isError) {
      // Handle error display
      console.error("Create supply error:", error);
    }
  }, [isSuccess, isError, history, error]);

  const getLabel = (
    id: string,
    options: { label: string; value: string }[],
  ) => {
    const selectedLabel = options.find((op) => String(op.value) === id)?.label;
    return selectedLabel ?? "";
  };

  const getOptions = (options: OptionData[]) => {
    return options.map((op) => ({ label: op.name, value: String(op.id) }));
  };

  const documentOptions = getOptions(documents as OptionData[]);
  const warehouseOptions = getOptions(warehouses as OptionData[]);
  const productOptions = getOptions(products as OptionData[]);

  const onSubmit = async (values: SupplyFormType) => {
    const supplyProducts: SupplyItem[] = values.products.map((p) => ({
      productId: Number(p.productId),
      amount: String(p.amount),
      price: p.price ? String(p.price) : undefined,
    }));

    const data: Partial<Supply> = {
      documentId: Number(values.documentId),
      warehouseId: Number(values.warehouseId),
      documentDate: values.documentDate,
      receiver: values.receiver || undefined,
      note: values.note || undefined,
      priceListId: values.priceListId ? Number(values.priceListId) : undefined,
      products: supplyProducts,
    };
    await createSupply(data);
  };

  useEffect(() => {
    if (!fields.length) {
      append({ productId: "", amount: "", price: "" });
    }
  }, [fields.length, append]);

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex gap="20px" flexDirection={isMobile ? "column" : "row"}>
          <Controller
            name="documentId"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.documentId}>
                <FormLabel>{t("supply.document")}</FormLabel>
                <Select
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      ...getErrorStyles(!!errors.documentId),
                    }),
                  }}
                  value={{
                    label: getLabel(String(field.value), documentOptions),
                    value: field.value,
                  }}
                  onChange={(valueSelected) => {
                    field.onChange(valueSelected.value);
                  }}
                  options={documentOptions}
                />
                <FormErrorMessage>
                  {errors.documentId?.message}
                </FormErrorMessage>
              </FormControl>
            )}
          />
          <Controller
            name="warehouseId"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.warehouseId}>
                <FormLabel>{t("supply.warehouse")}</FormLabel>
                <Select
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      ...getErrorStyles(!!errors.warehouseId),
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
                  {errors.warehouseId?.message}
                </FormErrorMessage>
              </FormControl>
            )}
          />
        </Flex>

        <Flex gap="20px" mt="20px" flexDirection={isMobile ? "column" : "row"}>
          <Controller
            name="documentDate"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.documentDate}>
                <FormLabel>{t("supply.documentDate")}</FormLabel>
                <Input type="date" {...field} />
              </FormControl>
            )}
          />
          <Controller
            name="receiver"
            control={control}
            render={({ field }) => (
              <FormControl>
                <FormLabel>{t("supply.receiver")}</FormLabel>
                <Input {...field} />
              </FormControl>
            )}
          />
          <Controller
            name="priceListId"
            control={control}
            render={({ field }) => {
              const options = priceLists.map((p) => ({
                label: `${p.code} — ${p.name}`,
                value: String(p.id),
              }));
              return (
                <FormControl>
                  <FormLabel>{t("supply.priceList")}</FormLabel>
                  <Select
                    isClearable
                    options={options}
                    value={options.find((o) => o.value === field.value) ?? null}
                    onChange={(picked) => field.onChange(picked?.value ?? "")}
                  />
                </FormControl>
              );
            }}
          />
          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <FormControl>
                <FormLabel>{t("supply.note")}</FormLabel>
                <Input {...field} />
              </FormControl>
            )}
          />
        </Flex>

        <Text fontSize="xl" fontWeight="bold" mt={6} mb={3}>
          {t("supply.productsToSupply")}
        </Text>
        {fields.map((row, index) => {
          const productErrors = errors.products;
          const productIdError = productErrors?.[index]?.productId;
          const quantityError = productErrors?.[index]?.amount;
          return (
            <Flex
              gap={"20px"}
              marginTop="20px"
              key={row.id}
              flexDirection={isMobile ? "column" : "row"}
              width={"100%"}
            >
              <Controller
                name={`products.${index}.productId`}
                control={control}
                render={({ field }) => (
                  <FormControl isInvalid={!!productIdError}>
                    <FormLabel>{t("supply.product")}</FormLabel>
                    <Select
                      styles={{
                        control: (baseStyles) => ({
                          ...baseStyles,
                          ...getErrorStyles(!!productIdError),
                        }),
                      }}
                      value={{
                        label: getLabel(String(field.value), productOptions),
                        value: field.value,
                      }}
                      onChange={(valueSelected) => {
                        field.onChange(valueSelected.value);
                        const listPrice =
                          listPrices[Number(valueSelected.value)];
                        if (
                          listPrice &&
                          !getValues(`products.${index}.price`)
                        ) {
                          setValue(`products.${index}.price`, listPrice);
                        }
                      }}
                      options={productOptions}
                    />
                    <FormErrorMessage>
                      {productIdError?.message}
                    </FormErrorMessage>
                  </FormControl>
                )}
              />
              <Controller
                name={`products.${index}.amount`}
                control={control}
                render={({ field }) => (
                  <FormControl isInvalid={!!quantityError}>
                    <FormLabel>{t("supply.quantity")}</FormLabel>
                    <NumberInput value={field.value} min={0} precision={3}>
                      <NumberInputField
                        placeholder={t("supply.quantityPlaceholder")}
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
                name={`products.${index}.price`}
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <FormLabel>{t("supply.price")}</FormLabel>
                    <Input
                      placeholder="0.00"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
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
                      productId: "",
                      amount: "",
                      price: "",
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
                  isDisabled={index === 0 && fields.length === 1}
                  background="red.500"
                  onClick={() => remove(index)}
                >
                  {isMobile ? <Text mr={2}>{t("common.delete")}</Text> : null}
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </FormControl>
            </Flex>
          );
        })}
        {errors.products ? (
          <Text color="red.500" fontSize="sm" mt={2}>
            {errors.products.message}
          </Text>
        ) : null}

        <Text fontWeight="bold" mt="16px">
          {t("supply.total")}: {formatMoney(total)}
        </Text>

        <Box marginTop={"20px"}>
          <Button
            colorScheme="teal"
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {t("common.save")}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default UpsertSupply;
