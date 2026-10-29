import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  StockTransferFilters,
  useGetStockTransfersQuery,
} from "api/stockTransfer";
import { useGetManagersQuery } from "api/manager";
import { useGetWarehouseQuery } from "api/warehouse";
import Card from "components/card/Card";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import { DataGrid, GridColumn } from "components/documents/DataGrid";
import { OptionSelect } from "components/documents/OptionSelect";
import { StockTransfer, TransferKind } from "types";
import { TRANSFER_SETUP } from "./transferKinds";

function StockTransferList({ kind }: { kind: TransferKind }) {
  const { t } = useTranslation();
  const history = useHistory();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const setup = TRANSFER_SETUP[kind];
  const [filters, setFilters] = useState<Omit<StockTransferFilters, "kind">>(
    {},
  );
  const setFilter = (key: keyof StockTransferFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const { data: rows = [] } = useGetStockTransfersQuery({ ...filters, kind });
  const { data: managers = [] } = useGetManagersQuery();
  const { data: warehouses = [] } = useGetWarehouseQuery();

  const endLabel = (row: StockTransfer, side: "from" | "to") =>
    side === "from"
      ? (row.fromWarehouseName ??
        `${row.fromManagerCode ?? ""} ${row.fromManagerName ?? ""}`)
      : (row.toWarehouseName ??
        `${row.toManagerCode ?? ""} ${row.toManagerName ?? ""}`);

  const columns: GridColumn<StockTransfer>[] = [
    { id: "code", label: t("common.sale.code") },
    {
      id: "documentDate",
      label: t("common.sale.documentDate"),
      format: "date",
    },
    {
      id: "from",
      label: t(`common.transfer.from.${setup.from}`),
      render: (row) => endLabel(row, "from"),
    },
    {
      id: "to",
      label: t(`common.transfer.to.${setup.to}`),
      render: (row) => endLabel(row, "to"),
    },
    { id: "note", label: t("common.sale.note") },
    ...(setup.showPrice
      ? [
          {
            id: "totalAmount",
            label: t("common.sale.totalAmount"),
            format: "money" as const,
          },
        ]
      : []),
  ];

  return (
    <Card flexDirection="column" w="100%" px="0px" minHeight="500px">
      <Box px="25px" mb="8px">
        <Flex justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {t(`common.transfer.kinds.${kind}`)}
          </Text>
          <TableAddButton
            label={t("common.add")}
            link={`${setup.list}/upsert`}
          />
        </Flex>
        <Flex mt="20px" gap="10px" wrap="wrap" align="flex-end">
          <Input
            size="sm"
            width="180px"
            placeholder={t("common.searchTerm")}
            value={filters.searchTerm ?? ""}
            onChange={(e) => setFilter("searchTerm", e.target.value)}
          />
          <Input
            size="sm"
            type="date"
            width="150px"
            value={filters.dateFrom ?? ""}
            onChange={(e) => setFilter("dateFrom", e.target.value)}
          />
          <Input
            size="sm"
            type="date"
            width="150px"
            value={filters.dateTo ?? ""}
            onChange={(e) => setFilter("dateTo", e.target.value)}
          />
          {setup.from === "warehouse" || setup.to === "warehouse" ? (
            <OptionSelect
              placeholder={t("common.transfer.warehouse")}
              options={warehouses.map((w) => ({
                label: w.name,
                value: String(w.id),
              }))}
              value={filters.warehouseId ?? ""}
              onChange={(v) => setFilter("warehouseId", v)}
            />
          ) : null}
          {setup.from === "manager" || setup.to === "manager" ? (
            <OptionSelect
              placeholder={t("common.sale.deliverer")}
              options={managers.map((m) => ({
                label: `${m.code} — ${m.name}`,
                value: String(m.id),
              }))}
              value={filters.managerId ?? ""}
              onChange={(v) => setFilter("managerId", v)}
            />
          ) : null}
          <Button size="sm" variant="ghost" onClick={() => setFilters({})}>
            {t("common.sale.clearFilters")}
          </Button>
        </Flex>
      </Box>
      <Box px="12px">
        <DataGrid
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          onRowClick={(row) => history.push(`${setup.list}/upsert/${row.id}`)}
        />
      </Box>
    </Card>
  );
}

export default StockTransferList;
