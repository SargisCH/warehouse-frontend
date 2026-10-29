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

import { MoneyFilters, useGetPaymentsQuery } from "api/payment";
import { useGetManagersQuery } from "api/manager";
import { useGetClientQuery } from "api/client";
import { useGetClientGroupsQuery } from "api/clientGroup";
import { useGetSalesZonesQuery } from "api/salesZone";
import Card from "components/card/Card";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import { DataGrid, GridColumn } from "components/documents/DataGrid";
import { OptionSelect } from "components/documents/OptionSelect";
import { Payment } from "types";
import { links } from "routes";

type Props = { isRefund?: boolean };

function PaymentList({ isRefund = false }: Props) {
  const { t } = useTranslation();
  const history = useHistory();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const [filters, setFilters] = useState<MoneyFilters>({});
  const setFilter = (key: keyof MoneyFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const { data } = useGetPaymentsQuery({
    ...filters,
    kind: isRefund ? "REFUND" : "IN",
  });
  const { data: managers = [] } = useGetManagersQuery();
  const { data: clients = [] } = useGetClientQuery();
  const { data: clientGroups = [] } = useGetClientGroupsQuery();
  const { data: salesZones = [] } = useGetSalesZonesQuery();

  const columns: GridColumn<Payment>[] = [
    { id: "code", label: t("common.sale.code") },
    {
      id: "documentDate",
      label: t("common.sale.documentDate"),
      format: "date",
    },
    { id: "clientName", label: t("common.sale.client") },
    { id: "clientGroupName", label: t("common.payment.clientGroup") },
    { id: "managerName", label: t("common.sale.manager") },
    { id: "salesZoneName", label: t("common.sale.salesZone") },
    {
      id: "paymentType",
      label: t("common.sale.paymentType"),
      render: (row) =>
        row.paymentType
          ? t(`common.sale.paymentTypes.${row.paymentType}`, {
              defaultValue: row.paymentType,
            })
          : "—",
    },
    { id: "amount", label: t("common.sale.amount"), format: "money" },
    { id: "note", label: t("common.sale.note") },
  ];

  return (
    <Card flexDirection="column" w="100%" px="0px" minHeight="500px">
      <Box px="25px" mb="8px">
        <Flex justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {isRefund
              ? t("common.payment.refundList")
              : t("common.payment.paymentList")}
          </Text>
          <TableAddButton
            label={
              isRefund
                ? t("common.payment.addRefund")
                : t("common.payment.addPayment")
            }
            link={isRefund ? links.createRefund : links.createPayment}
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
            placeholder={t("common.sale.manager")}
            options={managers.map((m) => ({
              label: `${m.code} — ${m.name}`,
              value: String(m.id),
            }))}
            value={filters.managerId ?? ""}
            onChange={(v) => setFilter("managerId", v)}
          />
          {!isRefund ? (
            <OptionSelect
              placeholder={t("common.sale.salesZone")}
              options={salesZones.map((z) => ({
                label: z.name,
                value: String(z.id),
              }))}
              value={filters.salesZoneId ?? ""}
              onChange={(v) => setFilter("salesZoneId", v)}
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
          rows={data?.rows ?? []}
          rowKey={(row) => row.id}
          totals={{ amount: data?.totals.amount }}
          onRowClick={(row) =>
            history.push(
              isRefund ? links.refund(row.id) : links.payment(row.id),
            )
          }
        />
      </Box>
    </Card>
  );
}

export default PaymentList;
