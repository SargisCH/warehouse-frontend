import { Card } from "@aws-amplify/ui-react";
import {
  Box,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TransactionType, useGetBalanceHistoryQuery } from "api/balanceHistory";
import { Link, useRouteMatch } from "react-router-dom";
import { links } from "routes";

export default function Manager() {
  const { data = [], isLoading } = useGetBalanceHistoryQuery();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "secondaryGray.600";
  return (
    <Box>
      <h1>Balance History</h1>

      <Box marginRight={"20px"}>
        <Table>
          <Thead>
            <Tr>
              <Td>Client name </Td>
              <Td>Supplier name </Td>
              <Td>Direction </Td>
              <Td>Sale </Td>
              <Td>Order </Td>
              <Td>Amount </Td>
              <Td>Before </Td>
              <Td>Result </Td>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((balance, index) => {
              return (
                <Tr key={index}>
                  <Td>{balance.client?.name}</Td>
                  <Td>{balance.inventorySupplier?.name}</Td>
                  <Td>{balance.direction}</Td>
                  <Td>
                    {balance.saleId && (
                      <Link to={links.saleInfo(balance.saleId)}>
                        Check Sale
                      </Link>
                    )}
                  </Td>
                  <Td>
                    {balance.orderId && (
                      <Link
                        to={links.supplyOrder(
                          balance.inventorySupplierId,
                          balance.orderId,
                        )}
                      >
                        Check Order
                      </Link>
                    )}
                  </Td>
                  <Td>
                    <Text
                      color={
                        balance.direction === TransactionType.OUT
                          ? "red.500"
                          : "green.500"
                      }
                    >
                      {balance.amount}
                    </Text>
                  </Td>
                  <Td>
                    <Text>{balance.before}</Text>
                  </Td>
                  <Td>
                    <Text
                      color={
                        balance.direction === TransactionType.OUT
                          ? "red.500"
                          : "green.500"
                      }
                    >
                      <span> {balance.result}</span>
                      <span style={{ marginLeft: "5px" }}>
                        <FontAwesomeIcon
                          icon={
                            balance.direction === TransactionType.OUT
                              ? faArrowDown
                              : faArrowUp
                          }
                          color={
                            balance.direction === TransactionType.OUT
                              ? "red"
                              : "green"
                          }
                        />
                      </span>
                    </Text>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
