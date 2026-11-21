import { Alert, Button, FormControl, FormLabel, Input, Spinner } from "@chakra-ui/react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetManagerBalancesQuery } from "api/report";
import { DataGrid } from "components/documents/DataGrid";
import { links } from "routes";
import type { ManagerCashPrefill } from "../managerCash/ManagerCash";
import { today } from "helpers/money";
import { ReportCard } from "./ReportCard";

// Cash collected by each manager and still to be handed over.
export default function ManagerBalances() {
  const { t } = useTranslation();
  const history = useHistory<ManagerCashPrefill>();
  const [date, setDate] = useState(today());
  const { currentData: data, isFetching, isError } = useGetManagerBalancesQuery(
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
      {isError ? (
        <Alert status="error">{t("common.managerCash.balanceError")}</Alert>
      ) : isFetching && !data ? (
        <Spinner size="sm" label={t("common.managerCash.loadingBalances")} />
      ) : (
        <DataGrid
          columns={[
            { id: "managerCode", label: t("common.manager.code") },
            { id: "managerName", label: t("common.sale.manager") },
            {
              id: "balance",
              label: t("common.managerCash.onHand"),
              format: "money",
            },
            {
              id: "receiveCash",
              label: "",
              render: (row) =>
                date <= today() && Number(row.balance) > 0 ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      history.push(links.managerCash, {
                        managerId: row.managerId,
                        date,
                        amount: row.balance,
                      })
                    }
                  >
                    {t("common.managerCash.receiveCash")}
                  </Button>
                ) : null,
            },
          ]}
          rows={data?.rows ?? []}
          rowKey={(row) => row.managerId}
          totals={data?.totals}
          emptyText={t("common.report.noData")}
        />
      )}
    </ReportCard>
  );
}
