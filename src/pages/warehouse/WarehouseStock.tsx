import {
  Alert,
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useGetWarehouseStockQuery } from "api/warehouse";
import Card from "components/card/Card";
import { formatQuantity } from "helpers/money";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { links } from "routes";

export default function WarehouseStock() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { currentData, isFetching, isError, refetch } = useGetWarehouseStockQuery(
    id,
    { refetchOnMountOrArgChange: true },
  );
  const unitLabel = (name?: string | null) =>
    name
      ? t(`common.units.${name}`, { defaultValue: name })
      : t("common.warehouse.noUnit");

  return (
    <Card flexDirection="column">
      <Flex align="center" justify="space-between" wrap="wrap" gap={3} mb={4}>
        <Heading size="md">
          {currentData?.name
            ? t("common.warehouse.stockForWarehouse", { name: currentData.name })
            : t("common.warehouse.stock")}
        </Heading>
        <Button as={Link} to={links.warehouses} size="sm" variant="outline">
          {t("common.warehouse.list")}
        </Button>
      </Flex>
      {isError && (
        <Alert status="error" justifyContent="space-between" gap={3}>
          {t("common.warehouse.stockLoadError")}
          <Button size="sm" onClick={() => refetch()}>
            {t("common.stockHistory.retry")}
          </Button>
        </Alert>
      )}
      {!currentData && isFetching && (
        <Spinner alignSelf="flex-start" label={t("common.warehouse.stock")} />
      )}
      {currentData?.products.length === 0 && (
        <Text>{t("common.warehouse.emptyStock")}</Text>
      )}
      {currentData && currentData.products.length > 0 && (
        <Box overflowX="auto">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th scope="col">{t("common.stockHistory.product")}</Th>
                <Th scope="col">SKU</Th>
                <Th scope="col" isNumeric>
                  {t("common.stockHistory.quantity")}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentData.products.map((product) => (
                <Tr key={product.id}>
                  <Td>{product.name || product.sku || product.id}</Td>
                  <Td>{product.sku || "—"}</Td>
                  <Td isNumeric>
                    {formatQuantity(product.quantity)} {unitLabel(product.unit?.name)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
            <Tfoot>
              {currentData.totals.map(({ unit, quantity }) => (
                <Tr key={unit?.id ?? "no-unit"}>
                  <Th scope="row" colSpan={2}>
                    {t("common.warehouse.totalByUnit", { unit: unitLabel(unit?.name) })}
                  </Th>
                  <Td isNumeric fontWeight="bold">
                    {formatQuantity(quantity)}
                  </Td>
                </Tr>
              ))}
            </Tfoot>
          </Table>
        </Box>
      )}
    </Card>
  );
}
