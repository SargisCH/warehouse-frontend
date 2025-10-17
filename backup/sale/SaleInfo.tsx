import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { SaleType, useGetSaleByIdQuery } from "api/client";
import { useParams } from "react-router-dom";

export default function SaleInfo() {
  const params: any = useParams();
  const { data: saleData = {} as SaleType } = useGetSaleByIdQuery({
    id: params.saleId,
  });

  const itemTotals =
    saleData.saleItems?.map((item) => item.price * item.amount) || [];
  const total = itemTotals.reduce((acc, itemTotal) => acc + itemTotal, 0);

  return (
    <>
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
      <Table variant="simple" marginTop={"30px"}>
        <Thead>
          <Tr>
            <Th>Product Name</Th>
            <Th>Price</Th>
            <Th>Original price</Th>
            <Th>Price Unit</Th>
            <Th>Amount</Th>
            <Th>Amount Unit</Th>
            <Th>Total</Th>
          </Tr>
        </Thead>
        <Tbody>
          {saleData.saleItems?.map((item, index) => {
            const priceChanged = typeof item.originalPrice === "number";
            return (
              <Tr key={index}>
                <Td>{item.stockProduct?.product.name}</Td>
                <Td color={priceChanged ? "red.500" : ""}>{item.price}</Td>
                <Td>{priceChanged ? item.originalPrice : item.price}</Td>
                <Td>{item.priceUnit}</Td>
                <Td>{item.amount}</Td>
                <Td>{item.amountUnit}</Td>
                <Td>{item.price * item.amount}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </>
  );
}
