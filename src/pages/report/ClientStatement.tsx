import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { useLazyGetClientStatementQuery } from "api/report";
import { useGetClientQuery } from "api/client";
import { DataGrid } from "components/documents/DataGrid";
import { OptionSelect } from "components/documents/OptionSelect";
import { formatMoney, today } from "helpers/money";
import { ReportCard } from "./ReportCard";

// «Ըստ գնորդի քաղվածք»: opening balance, each movement, closing balance.
export default function ClientStatement() {
  const { t } = useTranslation();
  const [clientId, setClientId] = useState("");
  const [dateFrom, setDateFrom] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD"),
  );
  const [dateTo, setDateTo] = useState(today());
  const [run, { data, isFetching }] = useLazyGetClientStatementQuery();
  const { data: clients = [] } = useGetClientQuery();

  const documentLabel = (row: any) =>
    row.saleCode ?? row.paymentCode ?? row.note ?? "—";

  return (
    <ReportCard
      title={t("common.report.clientStatement")}
      filters={
        <Flex gap="12px" align="flex-end" wrap="wrap">
          <OptionSelect
            label={t("common.sale.client")}
            options={clients.map((c) => ({
              label: `${c.code} — ${c.name}`,
              value: String(c.id),
            }))}
            value={clientId}
            onChange={setClientId}
            width="280px"
          />
          <FormControl width="170px">
            <FormLabel fontSize="sm">{t("common.sale.dateFrom")}</FormLabel>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </FormControl>
          <FormControl width="170px">
            <FormLabel fontSize="sm">{t("common.sale.dateTo")}</FormLabel>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </FormControl>
          <Button
            colorScheme="teal"
            isDisabled={!clientId}
            isLoading={isFetching}
            onClick={() => run({ clientId, dateFrom, dateTo })}
          >
            {t("common.report.run")}
          </Button>
        </Flex>
      }
    >
      {data ? (
        <Flex gap="24px" px="12px" mb="8px">
          <Text fontWeight="700">
            {t("common.report.opening")}: {formatMoney(data.opening)}
          </Text>
          <Text fontWeight="700">
            {t("common.report.closing")}: {formatMoney(data.closing)}
          </Text>
        </Flex>
      ) : null}
      <DataGrid
        columns={[
          {
            id: "entryDate",
            label: t("common.sale.documentDate"),
            format: "date",
          },
          {
            id: "document",
            label: t("common.sale.code"),
            render: documentLabel,
          },
          {
            id: "kind",
            label: t("common.report.movement"),
            render: (row: any) =>
              t(`common.report.kinds.${row.kind}`, { defaultValue: row.kind }),
          },
          { id: "debit", label: t("common.report.debit"), format: "money" },
          { id: "credit", label: t("common.report.credit"), format: "money" },
          { id: "balance", label: t("common.report.balance"), format: "money" },
        ]}
        rows={data?.rows ?? []}
        rowKey={(row: any) => row.id}
        totals={data?.totals}
        emptyText={t("common.report.noData")}
      />
    </ReportCard>
  );
}
