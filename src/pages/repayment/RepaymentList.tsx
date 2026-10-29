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

import { MoneyFilters, useGetRepaymentsQuery } from "api/payment";
import { useGetClientQuery } from "api/client";
import { useGetClientGroupsQuery } from "api/clientGroup";
import Card from "components/card/Card";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import { DataGrid, GridColumn } from "components/documents/DataGrid";
import { OptionSelect } from "components/documents/OptionSelect";
import { Repayment } from "types";
import { links } from "routes";

// «Մարումներ»: filters are the buyer's group, the buyer and the source.
function RepaymentList() {
  const { t } = useTranslation();
  const history = useHistory();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const [filters, setFilters] = useState<MoneyFilters>({});
  const setFilter = (key: keyof MoneyFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const { data } = useGetRepaymentsQuery(filters);
  const { data: clients = [] } = useGetClientQuery();
  const { data: clientGroups = [] } = useGetClientGroupsQuery();

  const sourceOptions = ["PREPAYMENT", "RETURN"].map((source) => ({
    label: t(`common.repayment.sources.${source}`),
    value: source,
  }));

  const columns: GridColumn<Repayment>[] = [
    { id: "code", label: t("common.sale.code") },
    {
      id: "documentDate",
      label: t("common.sale.documentDate"),
      format: "date",
    },
    { id: "clientName", label: t("common.sale.client") },
    { id: "clientGroupName", label: t("common.payment.clientGroup") },
    {
      id: "source",
      label: t("common.repayment.source"),
      render: (row) => t(`common.repayment.sources.${row.source}`),
    },
    { id: "amount", label: t("common.sale.amount"), format: "money" },
    { id: "note", label: t("common.sale.note") },
  ];

  return (
    <Card flexDirection="column" w="100%" px="0px" minHeight="500px">
      <Box px="25px" mb="8px">
        <Flex justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {t("common.repayment.repaymentList")}
          </Text>
          <TableAddButton
            label={t("common.repayment.addRepayment")}
            link={links.createRepayment}
          />
        </Flex>
        <Flex mt="20px" gap="10px" wrap="wrap" align="flex-end">
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
          <OptionSelect
            placeholder={t("common.payment.clientGroup")}
            options={clientGroups.map((g) => ({
              label: g.name,
              value: String(g.id),
            }))}
            value={filters.clientGroupId ?? ""}
            onChange={(v) => setFilter("clientGroupId", v)}
          />
          <OptionSelect
            placeholder={t("common.sale.client")}
            options={clients.map((c) => ({
              label: `${c.code} — ${c.name}`,
              value: String(c.id),
            }))}
            value={filters.clientId ?? ""}
            onChange={(v) => setFilter("clientId", v)}
          />
          <OptionSelect
            placeholder={t("common.repayment.source")}
            options={sourceOptions}
            value={filters.source ?? ""}
            onChange={(v) => setFilter("source", v)}
          />
          <Button size="sm" variant="ghost" onClick={() => setFilters({})}>
            {t("common.sale.clearFilters")}
          </Button>
        </Flex>
      </Box>
      <Box px="12px">
        <DataGrid
          columns={columns}
          rows={data?.rows ?? []}
          rowKey={(row) => row.id}
          totals={{ amount: data?.totals.amount }}
          onRowClick={(row) => history.push(links.repayment(row.id))}
        />
      </Box>
    </Card>
  );
}

export default RepaymentList;
