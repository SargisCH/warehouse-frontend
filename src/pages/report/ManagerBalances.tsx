import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useGetManagerBalancesQuery } from "api/report";
import { DataGrid } from "components/documents/DataGrid";
import { today } from "helpers/money";
import { ReportCard } from "./ReportCard";

// «Ըստ մենեջերի մնացորդներ»: what each agent's buyers owe.
export default function ManagerBalances() {
  const { t } = useTranslation();
  const [date, setDate] = useState(today());
  const { data } = useGetManagerBalancesQuery({ date });

  return (
    <ReportCard
      title={t("common.report.managerBalances")}
      filters={
        <FormControl width="170px">
          <FormLabel fontSize="sm">{t("common.report.asOf")}</FormLabel>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormControl>
      }
    >
      <DataGrid
        columns={[
          { id: "managerCode", label: t("common.manager.code") },
          {
            id: "managerName",
            label: t("common.sale.manager"),
            render: (row: any) =>
              row.managerName ?? t("common.report.noManager"),
          },
          { id: "balance", label: t("common.report.balance"), format: "money" },
        ]}
        rows={data?.rows ?? []}
        rowKey={(row: any, index) => row.managerId ?? `none-${index}`}
        totals={data?.totals}
        emptyText={t("common.report.noData")}
      />
    </ReportCard>
  );
}
