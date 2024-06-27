import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Box,
  Spinner,
  NumberInput,
  NumberInputField,
  Checkbox,
  CheckboxGroup,
} from "@chakra-ui/react";
import {
  useDeleteProductMutation,
  useLazyGetProductByIdQuery,
  useUpdateProductMutation,
  useCreateProductMutation,
} from "api/product";
import { useGetInventoryQuery } from "api/inventory";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import Select from "react-select";
import { links } from "routes";
import IngredientAmount from "./IngredientAmounts";
import { FieldArray, Form, Formik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { generateKey } from "helpers/generateKey";
import { useTranslation } from "react-i18next";

const UpsertProduct = (props: { create: boolean }) => {
  const [initialValues, setInitialValues] = useState({
    name: "",
    price: null,
    priceUnit: "",
    ingredients: [
      {
        reactKey: generateKey("ingredient"),
        amount: 0,
        amountUnit: "",
        inventoryId: null,
      },
    ],
  });
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const params = useParams() as any;
  const { data } = useGetInventoryQuery();
  const inventoryData = data?.inventories || [];

  const [createProduct, { isError, error }] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const history = useHistory();
  const { t } = useTranslation();
  const unitOptions = [
    { label: "KG", value: "kg" },
    { label: "GRAM", value: "g" },
    { label: t("common.piece"), value: "piece" },
  ];
  const [getProductById] = useLazyGetProductByIdQuery();
  useEffect(() => {
    (async () => {
      if (params.productId) {
        setIsLoading(true);
        const productItemRes = await getProductById({
          productId: params.productId,
        });
        if (!productItemRes.data) return;
        setInitialValues({
          name: productItemRes.data.name,
          price: productItemRes.data.price,
          priceUnit: productItemRes.data.priceUnit,
          ingredients:
            productItemRes.data.ingredients.map((ing) => ({
              ...ing,
              amount: ing.amount,
              amountUnit: ing.amountUnit,
              inventoryId: ing.inventoryId,
              reactKey: generateKey("ingredient"),
            })) ?? [],
        });
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      }
    })();
  }, [params.productId, getProductById, setIsLoading, setInitialValues]);

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
    <Flex>
      <Formik
        initialValues={{ ...initialValues }}
        onSubmit={async (values) => {
          const postData = {
            ...values,
            price: Number(values.price),
            ingredients: values.ingredients.map((ing) => ({
              ...ing,
              amount: Number(ing.amount),
              amountUnit: ing.amountUnit,
              reactKey: undefined,
            })),
          };
          if (params.productId) {
            await updateProduct({
              ...postData,
              id: params.productId,
            });
          } else {
            await createProduct({ ...postData });
          }
          history.push(links.product);
        }}
      >
        {({
          values,
          setFieldValue,
          touched,
          errors,
          handleSubmit,
          isSubmitting,
        }) => {
          return (
            <Box>
              <Form onSubmit={handleSubmit}>
                <Box gap="20px">
                  <Flex gap="20px">
                    <FormControl>
                      <FormLabel>{t("common.name")}</FormLabel>
                      <Input
                        type="text"
                        placeholder={t("common.name")}
                        value={values.name}
                        onChange={(e) => setFieldValue("name", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel> {t("common.price")} </FormLabel>
                      <NumberInput value={values?.price || 0}>
                        <NumberInputField
                          placeholder="Price"
                          onChange={(e) =>
                            setFieldValue("price", e.target.value)
                          }
                        />
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t("common.unit")}</FormLabel>
                      <Select
                        value={{
                          label: values.priceUnit,
                          value: values.priceUnit,
                        }}
                        onChange={(valueSelected) => {
                          setFieldValue("priceUnit", valueSelected.value);
                        }}
                        options={unitOptions}
                      />
                    </FormControl>
                  </Flex>
                  <Box>
                    <FieldArray name="ingredients">
                      {({ push, remove }) => {
                        return values.ingredients.map((ing, ingIndex) => {
                          const selectedInventory = inventoryData.find(
                            (inv) => inv.id === ing.inventoryId,
                          );
                          return (
                            <Flex
                              gap={"20px"}
                              marginTop="20px"
                              key={ing.reactKey}
                            >
                              <FormControl>
                                <FormLabel>{t("common.ingredients")}</FormLabel>
                                <Select
                                  value={{
                                    label: selectedInventory?.name ?? "",
                                    value: selectedInventory?.id ?? "",
                                  }}
                                  onChange={(valueSelected) => {
                                    setFieldValue(
                                      `ingredients[${ingIndex}].inventoryId`,
                                      valueSelected.value,
                                    );
                                  }}
                                  options={inventoryData.map((inv) => ({
                                    label: inv.name,
                                    value: inv.id,
                                  }))}
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel colorScheme="black">
                                  {t("common.amount")}
                                </FormLabel>
                                <NumberInput value={ing.amount}>
                                  <NumberInputField
                                    placeholder={"amount"}
                                    onChange={(e) => {
                                      setFieldValue(
                                        `ingredients[${ingIndex}].amount`,
                                        e.target.value,
                                      );
                                    }}
                                  />
                                </NumberInput>
                              </FormControl>
                              <FormControl>
                                <FormLabel>{t("common.unit")}</FormLabel>
                                <Select
                                  value={{
                                    label: ing.amountUnit,
                                    value: ing.amountUnit,
                                  }}
                                  onChange={(valueSelected) => {
                                    setFieldValue(
                                      `ingredients[${ingIndex}].amountUnit`,
                                      valueSelected.value,
                                    );
                                  }}
                                  options={[...unitOptions]}
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
                                  onClick={() => {
                                    push({
                                      amount: 0,
                                      amountUnit: "item",
                                      inventoryId: 0,
                                      reactKey: generateKey("product"),
                                    });
                                  }}
                                >
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
                                  isDisabled={ingIndex === 0}
                                  background="red.500"
                                  onClick={() => remove(ingIndex)}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </Button>
                              </FormControl>
                            </Flex>
                          );
                        });
                      }}
                    </FieldArray>
                  </Box>
                </Box>

                <Box marginTop={"20px"}>
                  <Button
                    colorScheme="teal"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {t("common.save")}
                  </Button>
                </Box>
              </Form>
              <Box mt={5}>
                {params.productId ? (
                  <Button
                    ml={4}
                    colorScheme="red"
                    onClick={() => setIsDeleteDialogOpened(true)}
                  >
                    Delete
                  </Button>
                ) : null}
              </Box>
            </Box>
          );
        }}
      </Formik>
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
    </Flex>
  );
};

export default UpsertProduct;
