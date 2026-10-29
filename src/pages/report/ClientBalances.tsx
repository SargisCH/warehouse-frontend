import { Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useGetClientBalancesQuery } from "api/report";
import { useGetClientGroupsQuery } from "api/clientGroup";
import { useGetManagersQuery } from "api/manager";
import { useGetSalesZonesQuery } from "api/salesZone";
import { DataGrid } from "components/documents/DataGrid";
import { OptionSelect } from "components/documents/OptionSelect";
import { today } from "helpers/money";
import { ReportCard } from "./ReportCard";

// «Ըստ գնորդի մնացորդներ» as of a date.
export default function ClientBalances() {
  const { t } = useTranslation();
  const [date, setDate] = useState(today());
  const [clientGroupId, setClientGroupId] = useState("");
  const [managerId, setManagerId] = useState("");
  const [salesZoneId, setSalesZoneId] = useState("");
  const { data } = useGetClientBalancesQuery({
    date,
    clientGroupId,
    managerId,
    salesZoneId,
  });
  const { data: clientGroups = [] } = useGetClientGroupsQuery();
  const { data: managers = [] } = useGetManagersQuery();
  const { data: salesZones = [] } = useGetSalesZonesQuery();

  return (
    <ReportCard
      title={t("common.report.clientBalances")}
      filters={
        <Flex gap="12px" align="flex-end" wrap="wrap">
          <FormControl width="170px">
            <FormLabel fontSize="sm">{t("common.report.asOf")}</FormLabel>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormControl>
          <OptionSelect
            label={t("common.payment.clientGroup")}
            options={clientGroups.map((g) => ({
              label: g.name,
              value: String(g.id),
            }))}
            value={clientGroupId}
            onChange={setClientGroupId}
          />
          <OptionSelect
            label={t("common.sale.manager")}
            options={managers.map((m) => ({
              label: `${m.code} — ${m.name}`,
              value: String(m.id),
            }))}
            value={managerId}
            onChange={setManagerId}
          />
          <OptionSelect
            label={t("common.sale.salesZone")}
            options={salesZones.map((z) => ({
              label: z.name,
              value: String(z.id),
            }))}
            value={salesZoneId}
            onChange={setSalesZoneId}
          />
        </Flex>
      }
    >
      <DataGrid
        columns={[
          { id: "clientCode", label: t("common.sale.clientCode") },
          { id: "clientName", label: t("common.sale.client") },
          { id: "clientGroupName", label: t("common.payment.clientGroup") },
          { id: "managerName", label: t("common.sale.manager") },
          { id: "salesZoneName", label: t("common.sale.salesZone") },
          { id: "debt", label: t("common.sale.debt"), format: "money" },
          {
            id: "prepayment",
            label: t("common.sale.prepaid"),
            format: "money",
          },
          { id: "balance", label: t("common.report.balance"), format: "money" },
        ]}
        rows={data?.rows ?? []}
        rowKey={(row: any) => row.clientId}
        totals={data?.totals}
        emptyText={t("common.report.noData")}
      />
    </ReportCard>
  );
}
