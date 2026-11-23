import { Alert, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import {
  CompanyCashMovement,
  useGetCompanyCashHistoryQuery,
  useGetCompanyCashQuery,
} from "api/companyAssets";
import { DataGrid, GridColumn } from "components/documents/DataGrid";
import { formatMoney } from "helpers/money";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AssetForm } from "../companyAssets/AssetForm";
import { ReportCard } from "../report/ReportCard";
import { CashEntryForm } from "./CashEntryForm";

export default function BalanceHistory() {
  const { t } = useTranslation();
  const { data: cash, isError: cashError } = useGetCompanyCashQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: history, isError: historyError } =
    useGetCompanyCashHistoryQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });
  const [opening, setOpening] = useState(false);
  const [entry, setEntry] = useState<CompanyCashMovement | "withdrawal">();

  const columns: GridColumn<CompanyCashMovement>[] = [
    { id: "documentDate", label: t("common.companyCash.date"), format: "date" },
    {
      id: "kind",
      label: t("common.companyCash.kind"),
      render: (row) => t(`common.companyCash.kinds.${row.kind}`),
    },
    { id: "amount", label: t("common.companyAssets.amount"), format: "money" },
    { id: "description", label: t("common.companyAssets.description") },
    { id: "comment", label: t("common.companyCash.comment") },
    {
      id: "action",
      label: t("common.companyCash.action"),
      render: (row) =>
        row.kind === "WITHDRAWAL" &&
        (row.returned ? (
          t("common.companyCash.returned")
        ) : (
          <Button size="xs" variant="outline" onClick={() => setEntry(row)}>
            {t("common.companyCash.return")}
          </Button>
        )),
    },
  ];

  return (
    <ReportCard
      title={t("common.balanceHistory")}
      filters={
        cashError ? (
          <Alert status="error">{t("common.companyAssets.cashError")}</Alert>
        ) : cash ? (
          <Flex align="center" wrap="wrap" gap={3}>
            <Text fontWeight="semibold">
              {t("common.companyAssets.balance")}: {formatMoney(cash.balance)}{" "}
              AMD
            </Text>
            {cash.opening === null && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setOpening(true)}
              >
                {t("common.companyAssets.actions.opening")}
              </Button>
            )}
            <Button
              size="sm"
              colorScheme="blue"
              isDisabled={Number(cash.balance) <= 0}
              onClick={() => setEntry("withdrawal")}
            >
              {t("common.companyCash.withdraw")}
            </Button>
          </Flex>
        ) : (
          <Spinner />
        )
      }
    >
      {historyError ? (
        <Alert status="error">{t("common.companyCash.historyError")}</Alert>
      ) : history ? (
        <DataGrid
          columns={columns}
          rows={history}
          rowKey={(row) => `${row.kind}:${row.id}`}
          emptyText={t("common.companyCash.empty")}
        />
      ) : (
        <Spinner />
      )}
      {opening && (
        <AssetForm mode="opening" onClose={() => setOpening(false)} />
      )}
      {entry && (
        <CashEntryForm
          original={entry === "withdrawal" ? undefined : entry}
          onClose={() => setEntry(undefined)}
        />
      )}
    </ReportCard>
  );
}
