import { Card } from "@aws-amplify/ui-react";
import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Text,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TransactionType, useGetBalanceHistoryQuery } from "api/balanceHistory";
import { useGetPayoutQuery } from "api/payout";
import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";
import { links } from "routes";
import PayoutCreateModal from "./PayoutCreateModal";
import dayjs from "dayjs";

export default function Manager() {
  const { data = [], refetch: refetchBalanceHistory } =
    useGetBalanceHistoryQuery();
  const { data: payouts = [], refetch: refetchPayout } = useGetPayoutQuery();
  const { t } = useTranslation();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "secondaryGray.600";
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box>
      <h1>Balance History</h1>

      <Box marginRight={"20px"}>
        <Table>
          <Thead>
            <Tr>
              <Td>Client name </Td>
              <Td>Supplier name </Td>
              <Td>Payout id </Td>
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
                  <Td>{balance.payoutId}</Td>
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
      <Box mt="20px">
        <Button onClick={onOpen} colorScheme={"green"}>
          {t("common.makeNewPayout")}
        </Button>
        <Table>
          <Thead>
            <Tr>
              <Td>Payout id </Td>
              <Td>Created At </Td>
              <Td>Amount </Td>
              <Td>Payout type </Td>
              <Td>Other </Td>
            </Tr>
          </Thead>
          <Tbody>
            {payouts.map((payout, index) => {
              return (
                <Tr key={index}>
                  <Td>{payout.id}</Td>
                  <Td>{dayjs(payout.created_at).format("DD/MM/YYYY")}</Td>
                  <Td>{payout.amount}</Td>
                  <Td>{payout.type.name}</Td>
                  {payout.type.name === "other" ? (
                    <Td>{payout.otherPayoutType}</Td>
                  ) : null}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
        <PayoutCreateModal
          isOpen={isOpen}
          onClose={(isCreated) => {
            if (isCreated) {
              refetchPayout();
              refetchBalanceHistory();
            }
            onClose();
          }}
        />
      </Box>
    </Box>
  );
}
