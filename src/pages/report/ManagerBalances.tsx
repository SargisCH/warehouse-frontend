import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useGetManagerBalancesQuery } from "api/report";
import { DataGrid } from "components/documents/DataGrid";
import { today } from "helpers/money";
import { ReportCard } from "./ReportCard";

// Cash collected by each manager and still to be handed over.
export default function ManagerBalances() {
  const { t } = useTranslation();
  const [date, setDate] = useState(today());
  const { currentData: data } = useGetManagerBalancesQuery(
    { date },
    { skip: !date, refetchOnMountOrArgChange: true }
  );

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
          { id: "managerName", label: t("common.sale.manager") },
          {
            id: "balance",
            label: t("common.managerCash.onHand"),
            format: "money",
          },
        ]}
        rows={data?.rows ?? []}
        rowKey={(row) => row.managerId}
        totals={data?.totals}
        emptyText={t("common.report.noData")}
      />
    </ReportCard>
  );
}
