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
  FormErrorMessage,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  useAddSaleMutation,
  PaymentType,
  useLazyGetClientByIdQuery,
  ClientType,
  useLazyGetClientQuery,
} from "api/client";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import { links } from "routes";
import { useGetStockProductQuery } from "api/product";
import { Form, Formik, FieldArray, getIn } from "formik";
import * as Yup from "yup";
import SaleForm from "./SaleForm";
import { generateKey } from "helpers/generateKey";
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

const SaleSchema = Yup.object().shape({
  clientId: Yup.number().required("Required"),
  paymentType: Yup.string().required("Required"),
  partialCreditAmount: Yup.number().optional(),
  saleItems: Yup.array(
    Yup.object({
      amount: Yup.number()
        .notOneOf([0], "Amount should be greater than 0")
        .required("Required"),
      amountUnit: Yup.string().required("Required"),
      price: Yup.number().required("Required"),
      priceUnit: Yup.string().required("Required"),
      stockProduct: Yup.number().required("Required"),
    }),
  ),
});

export type SaleStateType = {
  clientId: number;
  paymentType: string;
  partialCreditAmount?: number;
  saleItems: Array<{
    amount: number | string;
    amountUnit: string;
    price: number | string;
    priceUnit: string;
    stockProduct: number;
    reactKey?: string;
  }>;
};

const UpsertSale = () => {
  const params = useParams() as any;
  const [initialState, setInitialState] = useState<SaleStateType>({
    clientId: null,
    paymentType: "",
    saleItems: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Array<ClientType>>([]);
  const [addSale] = useAddSaleMutation();
  const history = useHistory();
  const [getClientById] = useLazyGetClientByIdQuery();
  const [getClients] = useLazyGetClientQuery();
  const { data } = useGetStockProductQuery();
  const stockProducts = data?.stockProducts || [];

  const isMobile = useBreakpointValue({ base: true, md: false });
  useEffect(() => {
    (async () => {
      if (params.clientId) {
        setIsLoading(true);
        const clientRes = await getClientById({ clientId: params.clientId });
        if (!initialState.clientId) {
          setInitialState({ ...initialState, clientId: clientRes.data.id });
        }
        setClients([clientRes.data]);
        setIsLoading(false);
      } else {
        const allClientRes = await getClients();
        setClients(allClientRes.data);
      }
    })();
  }, [
    params.clientId,
    setClients,
    getClients,
    getClientById,
    setInitialState,
    initialState,
  ]);
  const clientOptions = useMemo(
    () =>
      clients.map((cl) => ({
        label: cl.name,
        value: cl.id,
      })),
    [clients],
  );
  const stockProductOptions = stockProducts.map((pd) => ({
    label: pd.product.name,
    value: pd.id,
  }));
  const { t } = useTranslation();
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
  if (params.clientId && !initialState.clientId) return null;
  return (
    <Flex direction="column">
      <Box>
        <Formik
          initialValues={{ ...initialState }}
          validationSchema={SaleSchema}
          onSubmit={async (values) => {
            const itemsToSend = values.saleItems.map((si) => {
              return {
                ...si,
                amount: Number(si.amount),
                price: Number(si.price),
                stockProductId: si.stockProduct,
                stockProduct: undefined,
                reactKey: undefined,
              };
            });
            try {
              await addSale({
                ...values,
                paymentType: values.paymentType as PaymentType,
                saleItems: itemsToSend,
                partialCreditAmount: values.partialCreditAmount
                  ? Number(values.partialCreditAmount)
                  : undefined,
              });
              history.push(links.sale);
            } catch (e: any) {
              alert(e.message || e);
            }
          }}
        >
          {({
            values,
            handleSubmit,
            errors,
            touched,
            setFieldValue,
            isSubmitting,
          }) => {
            const selectedClient = clients.find((c) => {
              return c.id === values.clientId;
            });

            return (
              <Form onSubmit={handleSubmit}>
                <Flex>
                  <Box width={"100%"} gap="20px">
                    <Flex direction={"column"} width={"100%"} gap="20px">
                      <Flex
                        gap="20px"
                        width={"100%"}
                        direction={isMobile ? "column" : "row"}
                      >
                        <FormControl
                          isInvalid={errors.clientId && touched.clientId}
                        >
                          <FormLabel>Clients</FormLabel>
                          <Select
                            options={clientOptions}
                            value={{
                              value: values.clientId,
                              label: selectedClient?.name ?? values.clientId,
                            }}
                            isDisabled={params.clientId}
                            onChange={(op) =>
                              setFieldValue("clientId", op.value)
                            }
                          />
                          <FormErrorMessage>{errors.clientId}</FormErrorMessage>
                        </FormControl>
                        <FormControl
                          isInvalid={errors.paymentType && touched.paymentType}
                        >
                          <FormLabel>Payment Type</FormLabel>
                          <Select
                            options={paymentTypeOptions}
                            value={paymentTypeOptions.find(
                              (op) => op.value === values.paymentType,
                            )}
                            onChange={(op) => {
                              setFieldValue("paymentType", op.value);
                              if (!values.saleItems.length) {
                                values.saleItems.push({
                                  stockProduct: null,
                                  amountUnit: "item",
                                  amount: 0,
                                  price: 0,
                                  priceUnit: "",
                                  reactKey: generateKey("product"),
                                });
                              }
                            }}
                          />
                          <FormErrorMessage>
                            {errors.paymentType}
                          </FormErrorMessage>
                        </FormControl>
                        {values.paymentType === PaymentType.PARTIAL_CREDIT ? (
                          <FormControl
                            isInvalid={
                              errors.partialCreditAmount &&
                              touched.partialCreditAmount
                            }
                          >
                            <FormLabel>Partial credit amount</FormLabel>
                            <Input
                              placeholder="How is paid right now"
                              type="number"
                              value={values.partialCreditAmount}
                              onChange={(e) =>
                                setFieldValue(
                                  "partialCreditAmount",
                                  e.target.value,
                                )
                              }
                            />
                            <FormErrorMessage>
                              {errors.partialCreditAmount}
                            </FormErrorMessage>
                          </FormControl>
                        ) : null}
                      </Flex>
                    </Flex>
                    <Flex gap={"20px"} marginTop="20px">
                      <FieldArray name="saleItems">
                        {({ push, remove }) => {
                          return values.saleItems?.map((si, siIndex) => {
                            const stockProductError = getIn(
                              errors,
                              `saleItems[${siIndex}].stockProduct`,
                            );
                            const stockProductTouched = getIn(
                              touched,
                              `saleItems[${siIndex}].stockProduct`,
                            );
                            const priceError = getIn(
                              errors,
                              `saleItems[${siIndex}].price`,
                            );
                            const priceTouched = getIn(
                              touched,
                              `saleItems[${siIndex}].price`,
                            );
                            const priceUnitError = getIn(
                              errors,
                              `saleItems[${siIndex}].priceUnit`,
                            );
                            const priceUnitTouched = getIn(
                              touched,
                              `saleItems[${siIndex}].priceUnit`,
                            );
                            const amountError = getIn(
                              errors,
                              `saleItems[${siIndex}].amount`,
                            );
                            const amountTouched = getIn(
                              touched,
                              `saleItems[${siIndex}].amount`,
                            );
                            const amountUnitError = getIn(
                              errors,
                              `saleItems[${siIndex}].amountUnit`,
                            );
                            const amountUnitTouched = getIn(
                              touched,
                              `saleItems[${siIndex}].amountUnit`,
                            );
                            return (
                              <Flex
                                gap="20px"
                                key={si.stockProduct ?? si.reactKey}
                                direction={isMobile ? "column" : "row"}
                              >
                                <FormControl
                                  isInvalid={
                                    stockProductError && stockProductTouched
                                  }
                                >
                                  <FormLabel>Product</FormLabel>
                                  <Select
                                    options={stockProductOptions}
                                    value={stockProductOptions.find(
                                      (so) => so.value === si.stockProduct,
                                    )}
                                    onChange={(op) => {
                                      setFieldValue(
                                        `saleItems[${siIndex}].stockProduct`,
                                        op.value,
                                      );
                                      const stockProductFound =
                                        stockProducts.find(
                                          (pr) => pr.id === op.value,
                                        );

                                      if (stockProductFound) {
                                        setFieldValue(
                                          `saleItems[${siIndex}].priceUnit`,
                                          stockProductFound.product.priceUnit,
                                        );
                                        setFieldValue(
                                          `saleItems[${siIndex}].amountUnit`,
                                          stockProductFound.inStockUnit,
                                        );
                                        setFieldValue(
                                          `saleItems[${siIndex}].price`,
                                          stockProductFound.product?.price,
                                        );
                                      }
                                    }}
                                  />
                                  <FormErrorMessage>
                                    {stockProductError}
                                  </FormErrorMessage>
                                </FormControl>
                                <FormControl
                                  isInvalid={priceError && priceTouched}
                                >
                                  <FormLabel>Price</FormLabel>
                                  <NumberInput
                                    value={si.price}
                                    onChange={(value) => {
                                      setFieldValue(
                                        `saleItems[${siIndex}].price`,
                                        value,
                                      );
                                    }}
                                  >
                                    <NumberInputField placeholder="Price for one unit" />
                                  </NumberInput>
                                  <FormErrorMessage>
                                    {priceError}
                                  </FormErrorMessage>
                                </FormControl>
                                <FormControl
                                  isInvalid={priceUnitError && priceUnitTouched}
                                >
                                  <FormLabel>Price unit</FormLabel>
                                  <Select
                                    placeholder="Price unit"
                                    options={[
                                      {
                                        label: si.priceUnit,
                                        value: si.priceUnit,
                                      },
                                    ]}
                                    value={{
                                      label: si.priceUnit,
                                      value: si.priceUnit,
                                    }}
                                    isDisabled={true}
                                  />
                                  <FormErrorMessage>
                                    {priceUnitError}
                                  </FormErrorMessage>
                                </FormControl>
                                <FormControl
                                  isInvalid={amountError && amountTouched}
                                >
                                  <FormLabel>Amount</FormLabel>
                                  <NumberInput
                                    value={values.saleItems[siIndex]?.amount}
                                  >
                                    <NumberInputField
                                      placeholder="Amount for one unit"
                                      onChange={(e) =>
                                        setFieldValue(
                                          `saleItems[${siIndex}].amount`,
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </NumberInput>
                                  <FormErrorMessage>
                                    {amountError}
                                  </FormErrorMessage>
                                </FormControl>
                                <FormControl
                                  isInvalid={
                                    amountUnitError && amountUnitTouched
                                  }
                                >
                                  <FormLabel>Amount unit</FormLabel>
                                  <Select
                                    placeholder="Amount unit"
                                    options={[
                                      {
                                        label: si.amountUnit,
                                        value: si.amountUnit,
                                      },
                                    ]}
                                    isDisabled={true}
                                    value={{
                                      label: si.amountUnit,
                                      value: si.amountUnit,
                                    }}
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
                                        price: 0,
                                        stockProduct: null,
                                        amountUnit: "item",
                                        priceUnit: "",
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
                                    background="red.500"
                                    onClick={() => remove(siIndex)}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </Button>
                                </FormControl>
                              </Flex>
                            );
                          });
                        }}
                      </FieldArray>
                    </Flex>
                    <Box mt={5}>
                      <Flex justifyContent={"space-between"}>
                        <Button
                          colorScheme="teal"
                          isLoading={isSubmitting}
                          disabled={isSubmitting}
                          type="submit"
                        >
                          {t("common.save")}
                        </Button>
                        <Box>
                          <SaleForm values={values} />
                        </Box>
                      </Flex>
                    </Box>
                  </Box>
                </Flex>
              </Form>
            );
          }}
        </Formik>
      </Box>
    </Flex>
  );
};

export default UpsertSale;
