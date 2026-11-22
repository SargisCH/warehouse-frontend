import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {
  StockHistoryKind,
  StockHistoryRow,
  StockHistoryScope,
  useGetStockHistoryQuery,
} from "api/stockHistory";
import { formatQuantity } from "helpers/money";
import { TRANSFER_SETUP } from "pages/stockTransfer/transferKinds";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useParams } from "react-router-dom";
import { links } from "routes";

const kinds: StockHistoryKind[] = [
  "SALE",
  "SALE_RETURN",
  "WAREHOUSE",
  "DELIVERER",
  "ISSUE",
  "RETURN",
  "SUPPLY",
  "ADJUSTMENT",
];

function documentUrl(row: StockHistoryRow): string | undefined {
  if (!row.documentAvailable || !row.documentId) return undefined;
  if (row.kind === "SALE") return links.saleItem(row.documentId);
  if (row.kind === "SALE_RETURN") return links.saleReturn(row.documentId);
  if (row.kind !== "SUPPLY" && row.kind !== "ADJUSTMENT") {
    return `${TRANSFER_SETUP[row.kind].list}/upsert/${row.documentId}`;
  }
}

function Location({
  warehouseId,
  warehouse,
  managerId,
  manager,
}: {
  warehouseId: number | null;
  warehouse: string | null;
  managerId: number | null;
  manager: string | null;
}) {
  const { t } = useTranslation();
  if (warehouseId !== null) {
    return (
      <Link as={RouterLink} to={links.warehouseHistory(warehouseId)}>
        {warehouse || t("common.stockHistory.warehouseId", { id: warehouseId })}
      </Link>
    );
  }
  if (managerId !== null) {
    return (
      <>{manager || t("common.stockHistory.agentId", { id: managerId })}</>
    );
  }
  return <>—</>;
}

export default function StockHistory({ scope }: { scope: StockHistoryScope }) {
  const { id } = useParams<{ id: string }>();
  return <HistoryPage key={id} scope={scope} id={id} />;
}

function HistoryPage({ scope, id }: { scope: StockHistoryScope; id: string }) {
  const { t } = useTranslation();
  const isWarehouse = scope === "warehouse";
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [kind, setKind] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const invalidDates = Boolean(dateFrom && dateTo && dateFrom > dateTo);
  const searchPending = search.trim() !== searchTerm;

  useEffect(() => {
    if (!searchPending) return;
    const timeout = window.setTimeout(() => {
      setSearchTerm(search.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [search, searchPending]);

  const { data, currentData, isFetching, isError, refetch } =
    useGetStockHistoryQuery(
      { scope, id, dateFrom, dateTo, kind, searchTerm, page },
      { skip: invalidDates, refetchOnMountOrArgChange: true },
    );
  const applicableKinds = isWarehouse
    ? kinds.filter(
        (item) => !["SALE", "SALE_RETURN", "DELIVERER"].includes(item),
      )
    : kinds;

  return (
    <Flex direction="column" gap="16px" mt="16px">
      <Box>
        <Link
          as={RouterLink}
          to={isWarehouse ? links.warehouses : links.product}
        >
          {t(isWarehouse ? "common.warehouse.warehouse" : "common.products")}
        </Link>
        <Heading as="h2" size="md" mt="8px">
          {data?.entity.name
            ? t("common.stockHistory.titleForEntity", {
                name: data.entity.name,
              })
            : t("common.stockHistory.title")}
        </Heading>
      </Box>

      <Flex gap="12px" wrap="wrap">
        <FormControl width={{ base: "100%", sm: "180px" }}>
          <FormLabel>{t("common.stockHistory.dateFrom")}</FormLabel>
          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              setPage(1);
            }}
          />
        </FormControl>
        <FormControl width={{ base: "100%", sm: "180px" }}>
          <FormLabel>{t("common.stockHistory.dateTo")}</FormLabel>
          <Input
            type="date"
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value);
              setPage(1);
            }}
          />
        </FormControl>
        <FormControl width={{ base: "100%", sm: "220px" }}>
          <FormLabel>{t("common.stockHistory.activity")}</FormLabel>
          <Select
            value={kind}
            onChange={(event) => {
              setKind(event.target.value);
              setPage(1);
            }}
          >
            <option value="">{t("common.stockHistory.allActivity")}</option>
            {applicableKinds.map((item) => (
              <option value={item} key={item}>
                {t(`common.stockHistory.kinds.${item}`)}
              </option>
            ))}
          </Select>
        </FormControl>
        {isWarehouse && (
          <FormControl width={{ base: "100%", sm: "240px" }}>
            <FormLabel>{t("common.stockHistory.product")}</FormLabel>
            <Input
              value={search}
              maxLength={100}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("common.stockHistory.searchProduct")}
            />
          </FormControl>
        )}
      </Flex>

      {invalidDates ? (
        <Alert status="warning">
          <AlertIcon />
          {t("common.stockHistory.invalidDates")}
        </Alert>
      ) : isFetching || searchPending ? (
        <Spinner alignSelf="start" />
      ) : isError ? (
        <Alert status="error">
          <AlertIcon />
          {t("common.stockHistory.loadError")}
          <Button size="sm" ml="auto" onClick={() => refetch()}>
            {t("common.stockHistory.retry")}
          </Button>
        </Alert>
      ) : (
        currentData && (
          <>
            {currentData.summary && (
              <Flex gap="24px" wrap="wrap">
                <Text>
                  {t("common.stockHistory.sold", {
                    quantity: formatQuantity(currentData.summary.sold),
                  })}
                </Text>
                <Text>
                  {t("common.stockHistory.returned", {
                    quantity: formatQuantity(currentData.summary.returned),
                  })}
                </Text>
              </Flex>
            )}
            {currentData.rows.length === 0 ? (
              <Text role="status">{t("common.stockHistory.empty")}</Text>
            ) : (
              <Box overflowX="auto" borderWidth="1px" borderRadius="md">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>{t("common.stockHistory.date")}</Th>
                      <Th>{t("common.stockHistory.activity")}</Th>
                      {isWarehouse && (
                        <Th>{t("common.stockHistory.product")}</Th>
                      )}
                      <Th isNumeric>{t("common.stockHistory.quantity")}</Th>
                      <Th>{t("common.stockHistory.from")}</Th>
                      <Th>{t("common.stockHistory.to")}</Th>
                      <Th>{t("common.stockHistory.document")}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentData.rows.map((row) => {
                      const url = documentUrl(row);
                      const reference = row.documentCode
                        ? `${row.documentCode} (#${row.documentId})`
                        : row.documentId
                        ? `#${row.documentId}`
                        : "—";
                      return (
                        <Tr key={row.id}>
                          <Td whiteSpace="nowrap">{row.date}</Td>
                          <Td>
                            {t(`common.stockHistory.kinds.${row.kind}`)}
                            {row.reversed && (
                              <Text fontSize="xs">
                                {t("common.stockHistory.reversal")}
                              </Text>
                            )}
                          </Td>
                          {isWarehouse && (
                            <Td>
                              <Link
                                as={RouterLink}
                                to={links.productHistory(row.productId)}
                              >
                                {[row.sku, row.product]
                                  .filter(Boolean)
                                  .join(" · ") || `#${row.productId}`}
                              </Link>
                            </Td>
                          )}
                          <Td isNumeric whiteSpace="nowrap">
                            {isWarehouse &&
                              (row.toWarehouseId === Number(id) ? "+" : "−")}
                            {formatQuantity(row.quantity)} {row.unit}
                            {row.beforeQuantity !== null &&
                              row.afterQuantity !== null && (
                                <Text fontSize="xs">
                                  {formatQuantity(row.beforeQuantity)} →{" "}
                                  {formatQuantity(row.afterQuantity)}
                                </Text>
                              )}
                          </Td>
                          <Td>
                            <Location
                              warehouseId={row.fromWarehouseId}
                              warehouse={row.fromWarehouse}
                              managerId={row.fromManagerId}
                              manager={row.fromManager}
                            />
                          </Td>
                          <Td>
                            <Location
                              warehouseId={row.toWarehouseId}
                              warehouse={row.toWarehouse}
                              managerId={row.toManagerId}
                              manager={row.toManager}
                            />
                          </Td>
                          <Td>
                            {url ? (
                              <Link as={RouterLink} to={url}>
                                {reference}
                              </Link>
                            ) : (
                              reference
                            )}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            )}
            {(page > 1 || currentData.hasMore) && (
              <Flex gap="12px" align="center">
                <Button
                  size="sm"
                  isDisabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  {t("common.stockHistory.previous")}
                </Button>
                <Text>{t("common.stockHistory.page", { page })}</Text>
                <Button
                  size="sm"
                  isDisabled={!currentData.hasMore}
                  onClick={() => setPage(page + 1)}
                >
                  {t("common.stockHistory.next")}
                </Button>
              </Flex>
            )}
          </>
        )
      )}
    </Flex>
  );
}
