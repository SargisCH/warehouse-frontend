import { Box, Flex, Text } from "@chakra-ui/react";
import { PaymentType } from "api/client";
import React, { useMemo } from "react";
import { SaleStateType } from "./UpsertSale";

type Props = {
  values: SaleStateType;
};

export default function SaleForm({ values }: Props) {
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
    const { saleItems, paymentType, partialCreditAmount } = values;
    if (!saleItems?.length) return totalsTemp;
    const total = saleItems.reduce((acc, item) => {
      return acc + Number(item.amount) * Number(item.price);
    }, 0);
    totalsTemp.total = total;
    if (paymentType === PaymentType.CASH) {
      totalsTemp.cash = total;
    } else if (paymentType === PaymentType.TRANSFER) {
      totalsTemp.transfer = total;
    } else if (paymentType === PaymentType.CREDIT) {
      totalsTemp.credit = total;
    } else {
      totalsTemp.partial_credit = partialCreditAmount;
    }
    return totalsTemp;
  }, [values]);
  return values.saleItems.length ? (
    <Flex justifyContent={"flex-end"}>
      <Box paddingRight="20px">
        <Text>
          {values.paymentType === PaymentType.PARTIAL_CREDIT ? (
            <>partial credit : {totals.partial_credit}</>
          ) : (
            <>
              {(values.paymentType as string).toLowerCase()} :
              {totals[(values.paymentType as string).toLowerCase()]}
            </>
          )}
        </Text>
        <Text>Total: {totals.total}</Text>
      </Box>
    </Flex>
  ) : null;
}
