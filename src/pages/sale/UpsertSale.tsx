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
  Text,
} from "@chakra-ui/react";
import {
  useAddSaleMutation,
  SaleType,
  PaymentType,
  useLazyGetClientByIdQuery,
  ClientType,
  useLazyGetClientQuery,
} from "api/client";
import { Reducer, useEffect, useMemo, useReducer, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import { links } from "routes";
import { useGetStockProductQuery } from "api/product";
type OptionType = {
  label: string | number;
  value: string | number;
};

type SaleAction =
  | { type: "SET_PAYMENT_TYPE"; payload: OptionType }
  | { type: "SET_CLIENT_ID"; payload: number }
  | { type: "SET_PARTIAL_CREDIT_AMOUNT"; payload: number }
  | { type: "SET_PRICE"; payload: { index: number; data: number | string } }
  | { type: "SET_PRICE_UNIT"; payload: { index: number; data: OptionType } }
  | { type: "SET_AMOUNT_UNIT"; payload: { index: number; data: OptionType } }
  | { type: "SET_AMOUNT"; payload: { index: number; data: number | string } }
  | { type: "SET_PRODUCT"; payload: { index: number; data: OptionType } }
  | { type: "ADD_PRODUCT" }
  | { type: "DELETE_PRODUCT"; payload: { index: number } }
  | {
      type: "SET_PRODUCT_UNITS";
      payload: {
        stockProductId: number;
        priceUnit: OptionType;
      };
    };

const SaleReducer: Reducer<SaleStateType, SaleAction> = (
  state,
  action,
): SaleStateType => {
  switch (action.type) {
    case "SET_CLIENT_ID":
      return { ...state, clientId: action.payload };
    case "SET_PAYMENT_TYPE":
      return { ...state, paymentType: action.payload };
    case "SET_PARTIAL_CREDIT_AMOUNT":
      return { ...state, partialCreditAmount: action.payload };
    case "ADD_PRODUCT": {
      return {
        ...state,
        saleItems: [
          ...state.saleItems,
          {
            stockProduct: null,
            price: 0,
            amount: 0,
            priceUnit: {
              label: "KG",
              value: "KG",
            },
            amountUnit: {
              label: "item",
              value: "item",
            },
          },
        ],
      };
    }
    case "DELETE_PRODUCT": {
      return {
        ...state,
        saleItems: state.saleItems.filter(
          (_, index) => index !== action.payload.index,
        ),
      };
    }
    case "SET_PRODUCT": {
      const saleItems = [...state.saleItems];
      saleItems[action.payload.index] = {
        ...saleItems[action.payload.index],
        stockProduct: action.payload.data,
      };
      return {
        ...state,
        saleItems,
      };
    }
    case "SET_PRODUCT_UNITS": {
      const { stockProductId, priceUnit } = action.payload;
      const saleItems = [...state.saleItems];
      const itemIndex = saleItems.findIndex(
        (si) => si.stockProduct.value === stockProductId,
      );
      saleItems[itemIndex] = {
        ...saleItems[itemIndex],
        priceUnit,
      };
      return {
        ...state,
        saleItems,
      };
    }
    case "SET_PRICE_UNIT": {
      const saleItems = [...state.saleItems];
      saleItems[action.payload.index] = {
        ...saleItems[action.payload.index],
        priceUnit: action.payload.data,
      };
      return {
        ...state,
        saleItems,
      };
    }
    case "SET_AMOUNT_UNIT": {
      const saleItems = [...state.saleItems];
      saleItems[action.payload.index] = {
        ...saleItems[action.payload.index],
        amountUnit: action.payload.data,
      };
      return {
        ...state,
        saleItems,
      };
    }
    case "SET_PRICE": {
      const saleItems = [...state.saleItems];
      saleItems[action.payload.index] = {
        ...saleItems[action.payload.index],
        price: action.payload.data,
      };
      return {
        ...state,
        saleItems,
      };
    }
    case "SET_AMOUNT": {
      const saleItems = [...state.saleItems];
      saleItems[action.payload.index] = {
        ...saleItems[action.payload.index],
        amount: action.payload.data,
      };
      return {
        ...state,
        saleItems,
      };
    }
    default:
      return state;
  }
};

type SaleStateType = {
  clientId: number;
  paymentType: OptionType;
  partialCreditAmount?: number;
  saleItems: Array<{
    amount: number | string;
    amountUnit: OptionType;
    price: number | string;
    priceUnit: OptionType;
    stockProduct: OptionType;
  }>;
};

const initialState: SaleStateType = {
  clientId: null,
  saleItems: [],
  paymentType: { label: "", value: "" },
};

const UpsertSale = () => {
  const params = useParams() as any;
  const [saleState, dispatch] = useReducer(SaleReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Array<ClientType>>([]);
  const [addSale] = useAddSaleMutation();
  const history = useHistory();
  const [getClientById] = useLazyGetClientByIdQuery();
  const [getClients] = useLazyGetClientQuery();
  const { data } = useGetStockProductQuery();
  const stockProducts = data?.stockProducts || [];
  const totals = useMemo(() => {
    const totalsTemp: {
      cash: number;
      credit: number;
      transfer: number;
      partial_credit: number;
      total: number;
      [key: string]: number;
    } = {
      cash: 0,
      credit: 0,
      transfer: 0,
      partial_credit: 0,
      total: 0,
    };
    if (!saleState.saleItems?.length) return totalsTemp;
    const total = saleState.saleItems.reduce((acc, item) => {
      return acc + Number(item.amount) * Number(item.price);
    }, 0);
    totalsTemp.total = total;
    if (saleState.paymentType.value === PaymentType.CASH) {
      totalsTemp.cash = total;
    } else if (saleState.paymentType.value === PaymentType.TRANSFER) {
      totalsTemp.transfer = total;
    } else if (saleState.paymentType.value === PaymentType.CREDIT) {
      totalsTemp.credit = total;
    } else {
      totalsTemp.partial_credit = saleState.partialCreditAmount;
    }
    return totalsTemp;
  }, [
    saleState.saleItems,
    saleState.paymentType.value,
    saleState.partialCreditAmount,
  ]);
  useEffect(() => {
    (async () => {
      if (params.clientId) {
        setIsLoading(true);
        const clientRes = await getClientById({ clientId: params.clientId });
        dispatch({ type: "SET_CLIENT_ID", payload: clientRes.data.id });
        setClients([clientRes.data]);
        setIsLoading(false);
      } else {
        const allClientRes = await getClients();
        setClients(allClientRes.data);
      }
    })();
  }, [params.clientId, setClients, getClients, getClientById]);
  useEffect(() => {
    if (saleState.paymentType.value && !saleState.saleItems?.length) {
      dispatch({ type: "ADD_PRODUCT" });
    }
  }, [saleState.paymentType, saleState.saleItems.length]);
  const saveSale = async () => {
    const data: SaleType = {
      clientId: saleState.clientId,
      paymentType: saleState.paymentType.value as PaymentType,
      partialCreditAmount: saleState.partialCreditAmount,
      saleItems: saleState.saleItems.map((si) => {
        return {
          stockProductId: Number(si.stockProduct.value),
          price: Number(si.price),
          priceUnit: si.priceUnit.value.toString(),
          amount: Number(si.amount),
          amountUnit: si.amountUnit.value.toString(),
        };
      }),
    };
    await addSale(data);
    history.push(links.sale);
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
    <Flex direction="column">
      <Flex direction="row">
        <Box width={"100%"} gap="20px">
          <Flex direction={"column"} width={"100%"} gap="20px">
            <Flex gap="20px" width={"100%"}>
              <FormControl>
                <FormLabel>Clients</FormLabel>
                <Select
                  options={clients.map((cl) => ({
                    label: cl.name,
                    value: cl.id,
                  }))}
                  value={{
                    value: saleState.clientId,
                    label:
                      clients.find((cl) => cl.id === saleState.clientId)
                        ?.name ?? saleState.clientId,
                  }}
                  isDisabled={params.clientId}
                  onChange={(op) => {
                    dispatch({ type: "SET_CLIENT_ID", payload: op.value });
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Payment Type</FormLabel>
                <Select
                  options={[
                    { label: PaymentType.CASH, value: PaymentType.CASH },
                    {
                      label: PaymentType.TRANSFER,
                      value: PaymentType.TRANSFER,
                    },
                    { label: PaymentType.CREDIT, value: PaymentType.CREDIT },
                    {
                      label: PaymentType.PARTIAL_CREDIT,
                      value: PaymentType.PARTIAL_CREDIT,
                    },
                  ]}
                  value={saleState.paymentType}
                  onChange={(op) => {
                    dispatch({ type: "SET_PAYMENT_TYPE", payload: op });
                  }}
                />
              </FormControl>
              {saleState.paymentType.value === PaymentType.PARTIAL_CREDIT ? (
                <FormControl>
                  <FormLabel>Partial credit amount</FormLabel>
                  <Input
                    placeholder="How is paid right now"
                    type="number"
                    value={saleState.partialCreditAmount}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_PARTIAL_CREDIT_AMOUNT",
                        payload: Number(e.target.value),
                      })
                    }
                  />
                </FormControl>
              ) : null}
            </Flex>
          </Flex>
          <Flex direction="column" gap={"20px"} marginTop="20px">
            {saleState.saleItems?.map((si, siIndex) => {
              return (
                <Flex gap="20px">
                  <FormControl>
                    <FormLabel>Product</FormLabel>
                    <Select
                      options={stockProducts.map((pd) => ({
                        label: pd.product.name,
                        value: pd.id,
                      }))}
                      value={si.stockProduct}
                      onChange={(op) => {
                        dispatch({
                          type: "SET_PRODUCT",
                          payload: { index: siIndex, data: op },
                        });
                        const stockProductFound = stockProducts.find(
                          (pr) => pr.id === op.value,
                        );
                        dispatch({
                          type: "SET_PRODUCT_UNITS",
                          payload: {
                            stockProductId: Number(op.value),
                            priceUnit: {
                              label: stockProductFound.product.priceUnit,
                              value: stockProductFound.product.priceUnit,
                            },
                          },
                        });
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Price</FormLabel>
                    <NumberInput
                      value={si.price}
                      onChange={(value) =>
                        dispatch({
                          type: "SET_PRICE",
                          payload: {
                            index: siIndex,
                            data: value,
                          },
                        })
                      }
                    >
                      <NumberInputField placeholder="Price for one unit" />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Price unit</FormLabel>
                    <Select
                      placeholder="Price unit"
                      options={[si.priceUnit]}
                      value={si.priceUnit}
                      isDisabled={true}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Amount</FormLabel>
                    <NumberInput
                      value={si.amount}
                      onChange={(value) =>
                        dispatch({
                          type: "SET_AMOUNT",
                          payload: {
                            index: siIndex,
                            data: value,
                          },
                        })
                      }
                    >
                      <NumberInputField placeholder="Amount for one unit" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Amount unit</FormLabel>
                    <Select
                      placeholder="Amount unit"
                      options={[si.amountUnit]}
                      isDisabled={true}
                      value={si.amountUnit}
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
                        dispatch({ type: "ADD_PRODUCT" });
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
                      onClick={() =>
                        dispatch({
                          type: "DELETE_PRODUCT",
                          payload: { index: siIndex },
                        })
                      }
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </FormControl>
                </Flex>
              );
            })}
          </Flex>
        </Box>
      </Flex>
      {saleState.saleItems.length ? (
        <Flex justifyContent={"flex-end"}>
          <Box marginTop={"20px"} paddingRight="20px">
            <Text>
              {saleState.paymentType.value === PaymentType.PARTIAL_CREDIT ? (
                <>partial credit : {totals.partial_credit}</>
              ) : (
                <>
                  {(saleState.paymentType.value as string).toLowerCase()} :
                  {
                    totals[
                      (saleState.paymentType.value as string).toLowerCase()
                    ]
                  }
                </>
              )}
            </Text>
            <Text>Total: {totals.total}</Text>
          </Box>
        </Flex>
      ) : null}
      <Box mt={5}>
        <Button colorScheme="teal" onClick={() => saveSale()}>
          Save
        </Button>
      </Box>
    </Flex>
  );
};

export default UpsertSale;
