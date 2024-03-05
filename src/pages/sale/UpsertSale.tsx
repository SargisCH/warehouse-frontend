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
} from "@chakra-ui/react";
import {
  useAddSaleMutation,
  useGetClientByIdQuery,
  SaleType,
  PaymentType,
  useLazyGetClientByIdQuery,
  ClientType,
  useLazyGetClientQuery,
} from "api/client";
import { useGetProductQuery } from "api/product";
import { Reducer, useEffect, useReducer, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import { links } from "routes";
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
        productId: number;
        inStockUnit: OptionType;
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
            product: null,
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
        product: action.payload.data,
      };
      return {
        ...state,
        saleItems,
      };
    }
    case "SET_PRODUCT_UNITS": {
      const { productId, inStockUnit, priceUnit } = action.payload;
      const saleItems = [...state.saleItems];
      const itemIndex = saleItems.findIndex(
        (si) => si.product.value === productId,
      );
      saleItems[itemIndex] = {
        ...saleItems[itemIndex],
        priceUnit,
        amountUnit: inStockUnit,
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
    product: OptionType;
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
  const { data: products = [] } = useGetProductQuery();
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

  const saveSale = async () => {
    const data: SaleType = {
      clientId: saleState.clientId,
      paymentType: saleState.paymentType.value as PaymentType,
      partialCreditAmount: saleState.partialCreditAmount,
      saleItems: saleState.saleItems.map((si) => ({
        productId: Number(si.product.value),
        price: Number(si.price),
        priceUnit: si.priceUnit.value.toString(),
        amount: Number(si.amount),
        amountUnit: si.amountUnit.value.toString(),
      })),
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
        <Flex direction="column" width={"100%"} gap="20px">
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

            {!saleState.saleItems.length ? (
              <Button
                maxWidth={"150px"}
                paddingLeft="10px"
                paddingRight="10px"
                onClick={() => {
                  dispatch({ type: "ADD_PRODUCT" });
                }}
              >
                Add Product
              </Button>
            ) : null}
          </Flex>
          <Flex direction="column" gap={"20px"}>
            {saleState.saleItems?.map((si, siIndex) => {
              return (
                <Flex gap="20px">
                  <FormControl>
                    <FormLabel>Product</FormLabel>
                    <Select
                      options={products.map((pd) => ({
                        label: pd.name,
                        value: pd.id,
                      }))}
                      value={si.product}
                      onChange={(op) => {
                        dispatch({
                          type: "SET_PRODUCT",
                          payload: { index: siIndex, data: op },
                        });
                        const productFound = products.find(
                          (pr) => pr.id === op.value,
                        );
                        dispatch({
                          type: "SET_PRODUCT_UNITS",
                          payload: {
                            productId: Number(op.value),
                            priceUnit: {
                              label: productFound.priceUnit,
                              value: productFound.priceUnit,
                            },
                            inStockUnit: {
                              label: productFound.inStockUnit,
                              value: productFound.inStockUnit,
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
        </Flex>
      </Flex>
      <Box mt={5}>
        <Button colorScheme="teal" onClick={() => saveSale()}>
          Save
        </Button>
      </Box>
    </Flex>
  );
};

export default UpsertSale;
