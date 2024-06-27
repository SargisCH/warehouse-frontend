import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Box,
  Spinner,
  NumberInput,
  NumberInputField,
  FormErrorMessage,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import {
  SaleType,
  useGetSaleByIdQuery,
  useReturnSaleMutation,
} from "api/client";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import { links } from "routes";
import { getIn, useFormik } from "formik";
import * as Yup from "yup";

const ReturnSale = () => {
  const [initialState, setInitialState] = useState<{
    saleItems: Array<{
      stockProductId: number;
      amount: number;
      reactKey?: string;
    }>;
  }>({
    saleItems: [],
  });
  const [isLoading] = useState(false);
  const [returnSale, { isLoading: isReturnSaleLoading, isSuccess }] =
    useReturnSaleMutation();
  const history = useHistory();
  const params: any = useParams();
  console.log("params sale id", params);
  const { data: saleData = {} as SaleType } = useGetSaleByIdQuery({
    id: params.saleId,
  });
  const { errors, setFieldValue, values, touched, ...formik } = useFormik({
    initialValues: { ...initialState },
    validate: (values: {
      saleItems: Array<{ stockProductId: number; amount: number }>;
    }) => {
      const errors = {} as any;
      values?.saleItems?.forEach((value, index) => {
        const saleItem = saleData?.saleItems?.find(
          (si) => si.stockProductId === value.stockProductId,
        );

        if (Number(value.amount) > saleItem.amount) {
          errors.saleItems = [];
          errors.saleItems[index] = {
            amount: "Amount should be less then the original value",
          };
          // rerender the component
          setInitialState({ ...values });
        }
      });
      return errors;
    },
    onSubmit: async (values: {
      saleItems: Array<{ stockProductId: number; amount: number }>;
    }) => {
      const itemsToSend = values?.saleItems.map((si) => {
        return {
          amount: Number(si.amount),
          stockProductId: si.stockProductId,
        };
      });
      try {
        await returnSale({ saleId: params.saleId, returnData: itemsToSend });
      } catch (e: any) {
        alert(e.message || e);
      }
    },
  });
  useEffect(() => {
    setFieldValue(`saleItems`, saleData.saleItems);
  }, [saleData.saleItems, setInitialState, setFieldValue]);
  useEffect(() => {
    if (isSuccess) {
      history.push(links.sale);
    }
  }, [isSuccess, history]);

  if (isLoading || isReturnSaleLoading) {
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
      <Box>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Payment typed</Th>
              <Th>Client</Th>
              <Th>Payment Type</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>{saleData.id}</Td>
              <Td>{saleData.client?.name}</Td>
              <Td>{saleData.paymentType}</Td>
            </Tr>
          </Tbody>
        </Table>
        <form onSubmit={formik.handleSubmit}>
          <Flex direction="row">
            <Box width={"100%"} gap="20px">
              <Flex direction="column" gap={"20px"} marginTop="20px">
                {saleData.saleItems?.map((si, siIndex) => {
                  const amountError =
                    getIn(errors, `saleItems[${siIndex}].amount`) ||
                    (errors as any)?.[siIndex]?.amount;
                  const saleItemData = saleData.saleItems.find(
                    (dataSaleItem) =>
                      si.stockProductId === dataSaleItem.stockProductId,
                  );
                  const stockProduct = saleItemData?.stockProduct;

                  return (
                    <Flex gap="20px" key={si.id}>
                      <FormControl>
                        <FormLabel>Product</FormLabel>
                        <Select
                          isDisabled={true}
                          options={[
                            {
                              label: stockProduct?.product?.name,
                              value: stockProduct?.id,
                            },
                          ]}
                          value={{
                            label: stockProduct?.product?.name,
                            value: stockProduct?.id,
                          }}
                        />
                      </FormControl>
                      <FormControl isInvalid={amountError}>
                        <FormLabel>Amount</FormLabel>
                        <NumberInput
                          value={values?.saleItems?.[siIndex]?.amount}
                        >
                          <NumberInputField
                            placeholder="Amount for one unit"
                            onChange={(e) => {
                              setFieldValue(
                                `saleItems[${siIndex}].amount`,
                                e.target.value,
                              );
                            }}
                          />
                        </NumberInput>

                        <FormErrorMessage>{amountError}</FormErrorMessage>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Amount unit</FormLabel>
                        <Select
                          isDisabled={true}
                          options={[
                            {
                              label: saleItemData.amountUnit,
                              value: saleItemData.amountUnit,
                            },
                          ]}
                          value={{
                            label: saleItemData.amountUnit,
                            value: saleItemData.amountUnit,
                          }}
                        />
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
                            setFieldValue(
                              "saleItems",
                              values.saleItems.filter(
                                (vsi) =>
                                  vsi.stockProductId !== si.stockProductId,
                              ),
                            )
                          }
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </FormControl>
                    </Flex>
                  );
                })}
              </Flex>
              <Box mt={5}>
                <Flex justifyContent={"space-between"}>
                  <Button
                    colorScheme="teal"
                    isLoading={formik.isSubmitting}
                    disabled={formik.isSubmitting}
                    type="submit"
                  >
                    Save
                  </Button>
                </Flex>
              </Box>
            </Box>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
};

export default ReturnSale;
