import {
  Box,
  Button,
  Flex,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { useGetProductQuery } from "api/product";
import { formatMoney, lineAmount } from "helpers/money";

export type ProductLine = {
  key: number;
  productId: string;
  quantity: string;
  price: string;
};

type Props = {
  lines: ProductLine[];
  onChange: (lines: ProductLine[]) => void;
  // Prices by product id, e.g. from the chosen price list.
  prices?: Record<number, string>;
  showPrice?: boolean;
  readOnly?: boolean;
};

let nextKey = 1;
export const emptyLine = (): ProductLine => ({
  key: nextKey++,
  productId: "",
  quantity: "",
  price: "",
});

/** «Ապրանքներ» tab: product, quantity and optionally price per line. */
export function ProductLines({
  lines,
  onChange,
  prices = {},
  showPrice = true,
  readOnly,
}: Props) {
  const { t } = useTranslation();
  const { data } = useGetProductQuery(undefined);
  const products = data?.data ?? [];
  const options = products.map((p) => ({
    label: `${p.sku ?? ""} — ${p.name}`,
    value: String(p.id),
  }));

  const update = (key: number, patch: Partial<ProductLine>) =>
    onChange(
      lines.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );

  const total = lines.reduce(
    (sum, line) => sum + lineAmount(line.quantity, line.price),
    0,
  );
  const totalQuantity = lines.reduce(
    (sum, line) => sum + Number(line.quantity || 0),
    0,
  );

  return (
    <Box>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th width="40%">{t("common.sale.productName")}</Th>
            <Th>{t("common.sale.quantity")}</Th>
            {showPrice ? <Th>{t("common.sale.price")}</Th> : null}
            {showPrice ? <Th isNumeric>{t("common.sale.amount")}</Th> : null}
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {lines.map((line) => (
            <Tr key={line.key}>
              <Td>
                <Select
                  isDisabled={readOnly}
                  options={options}
                  value={
                    options.find((o) => o.value === line.productId) ?? null
                  }
                  onChange={(picked) => {
                    const productId = picked?.value ?? "";
                    update(line.key, {
                      productId,
                      // Take the list price unless one was typed already.
                      price: line.price || prices[Number(productId)] || "",
                    });
                  }}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </Td>
              <Td>
                <Input
                  size="sm"
                  width="110px"
                  isDisabled={readOnly}
                  value={line.quantity}
                  placeholder="0.000"
                  onChange={(e) =>
                    update(line.key, { quantity: e.target.value })
                  }
                />
              </Td>
              {showPrice ? (
                <Td>
                  <Input
                    size="sm"
                    width="120px"
                    isDisabled={readOnly}
                    value={line.price}
                    placeholder="0.00"
                    onChange={(e) =>
                      update(line.key, { price: e.target.value })
                    }
                  />
                </Td>
              ) : null}
              {showPrice ? (
                <Td isNumeric>
                  {formatMoney(lineAmount(line.quantity, line.price))}
                </Td>
              ) : null}
              <Td>
                {!readOnly ? (
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() =>
                      onChange(lines.filter((l) => l.key !== line.key))
                    }
                  >
                    {t("common.delete")}
                  </Button>
                ) : null}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Flex justify="space-between" mt="8px" align="center">
        {!readOnly ? (
          <Button size="sm" onClick={() => onChange([...lines, emptyLine()])}>
            {t("common.add")}
          </Button>
        ) : (
          <span />
        )}
        <Flex gap="20px">
          <Text fontSize="sm" fontWeight="700">
            {t("common.sale.quantity")}: {totalQuantity.toFixed(3)}
          </Text>
          {showPrice ? (
            <Text fontSize="sm" fontWeight="700">
              {t("common.sale.totalAmount")}: {formatMoney(total)}
            </Text>
          ) : null}
        </Flex>
      </Flex>
    </Box>
  );
}
