import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
} from "@chakra-ui/react";
import { FormEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetManagersQuery } from "api/manager";
import { useGetManagerBalancesQuery } from "api/report";
import {
  useCreateManagerCashEntryMutation,
  useGetManagerCashHistoryQuery,
} from "api/managerCash";
import { DataGrid } from "components/documents/DataGrid";
import { formatMoney, today } from "helpers/money";
import { ReportCard } from "../report/ReportCard";

const cashErrors: Record<string, string> = {
  INSUFFICIENT_MANAGER_CASH: "insufficient",
  INVALID_CASH_AMOUNT: "invalidAmount",
  INVALID_CASH_DATE: "invalidDate",
  OPENING_ALREADY_CLOSED: "openingClosed",
};

export default function ManagerCash() {
  const { t } = useTranslation();
  const [kind, setKind] = useState<"RECEIPT" | "OPENING">("RECEIPT");
  const [managerId, setManagerId] = useState("");
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<{
    key: string;
    success?: boolean;
  }>();
  const request = useRef<{ fingerprint: string; id: string }>();
  const saving = useRef(false);
  const { data: managers = [] } = useGetManagersQuery();
  const { currentData: balances, isFetching: loadingBalance } =
    useGetManagerBalancesQuery(
      { date },
      {
        skip: kind === "OPENING" || !date,
        refetchOnMountOrArgChange: true,
      }
    );
  const { data: history = [], isError: historyError } =
    useGetManagerCashHistoryQuery();
  const [create, { isLoading }] = useCreateManagerCashEntryMutation();
  const balance = balances?.rows.find(
    (row) => String(row.managerId) === managerId
  );

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (saving.current) return;

    const payload = {
      managerId: Number(managerId),
      kind,
      documentDate: kind === "RECEIPT" ? date : undefined,
      amount: amount.trim().replace(",", "."),
      note: note.trim() || undefined,
    };
    if (
      !/^\d{1,12}(\.\d{1,2})?$/.test(payload.amount) ||
      (kind === "RECEIPT" && Number(payload.amount) <= 0)
    ) {
      setFeedback({ key: "invalidAmount" });
      return;
    }

    const fingerprint = JSON.stringify(payload);
    if (request.current?.fingerprint !== fingerprint) {
      request.current = { fingerprint, id: crypto.randomUUID() };
    }
    saving.current = true;
    setFeedback(undefined);
    try {
      const result = await create({ ...payload, id: request.current.id });
      if ("error" in result) {
        const error = result.error;
        const message =
          error && "data" in error
            ? (error.data as { message?: unknown } | undefined)?.message
            : undefined;
        setFeedback({
          key:
            typeof message === "string"
              ? cashErrors[message] ?? "saveError"
              : "saveError",
        });
        return;
      }
      request.current = undefined;
      setAmount("");
      setNote("");
      setFeedback({ key: "saved", success: true });
    } finally {
      saving.current = false;
    }
  };

  return (
    <ReportCard
      title={t("common.managerCash.title")}
      filters={
        <Flex as="form" onSubmit={save} direction="column" gap={3} mb={6}>
          <Flex gap={3} wrap="wrap" align="flex-end">
            <FormControl width="230px">
              <FormLabel>{t("common.managerCash.entryType")}</FormLabel>
              <Select
                value={kind}
                isDisabled={isLoading}
                onChange={(event) => {
                  setKind(
                    event.target.value === "OPENING" ? "OPENING" : "RECEIPT"
                  );
                  setFeedback(undefined);
                }}
              >
                <option value="RECEIPT">
                  {t("common.managerCash.receipt")}
                </option>
                <option value="OPENING">
                  {t("common.managerCash.opening")}
                </option>
              </Select>
            </FormControl>
            <FormControl width="230px" isRequired>
              <FormLabel>{t("common.sale.manager")}</FormLabel>
              <Select
                value={managerId}
                isDisabled={isLoading}
                placeholder={t("common.managerCash.selectManager")}
                onChange={(event) => setManagerId(event.target.value)}
              >
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.code} — {manager.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            {kind === "RECEIPT" ? (
              <FormControl width="175px" isRequired>
                <FormLabel>{t("common.supply.documentDate")}</FormLabel>
                <Input
                  type="date"
                  value={date}
                  max={today()}
                  isDisabled={isLoading}
                  onChange={(event) => setDate(event.target.value)}
                />
              </FormControl>
            ) : null}
            <FormControl width="165px" isRequired>
              <FormLabel>{t("common.managerCash.amount")}</FormLabel>
              <Input
                inputMode="decimal"
                value={amount}
                isDisabled={isLoading}
                onChange={(event) => setAmount(event.target.value)}
              />
            </FormControl>
            <FormControl width="230px">
              <FormLabel>{t("common.sale.note")}</FormLabel>
              <Input
                value={note}
                maxLength={500}
                isDisabled={isLoading}
                onChange={(event) => setNote(event.target.value)}
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="teal"
              isLoading={isLoading}
              isDisabled={!managerId || (kind === "RECEIPT" && !date)}
            >
              {t("common.save")}
            </Button>
          </Flex>
          {kind === "OPENING" ? (
            <Text fontSize="sm">{t("common.managerCash.openingHelp")}</Text>
          ) : managerId && !loadingBalance && balance ? (
            <Text fontWeight="semibold">
              {t("common.managerCash.onHand")}: {formatMoney(balance.balance)}
            </Text>
          ) : null}
          {feedback ? (
            <Alert status={feedback.success ? "success" : "error"}>
              <AlertIcon />
              {t(`common.managerCash.${feedback.key}`)}
            </Alert>
          ) : null}
        </Flex>
      }
    >
      <Text fontWeight="semibold" mb={3}>
        {t("common.managerCash.history")}
      </Text>
      {historyError ? (
        <Alert status="error">
          <AlertIcon />
          {t("common.managerCash.historyError")}
        </Alert>
      ) : (
        <DataGrid
          columns={[
            { id: "documentDate", label: t("common.supply.documentDate") },
            {
              id: "managerName",
              label: t("common.sale.manager"),
              render: (row) => `${row.managerCode} — ${row.managerName}`,
            },
            {
              id: "kind",
              label: t("common.managerCash.entryType"),
              render: (row) =>
                t(
                  row.kind === "OPENING"
                    ? "common.managerCash.opening"
                    : "common.managerCash.receipt"
                ),
            },
            {
              id: "amount",
              label: t("common.managerCash.amount"),
              format: "money",
            },
            { id: "note", label: t("common.sale.note") },
          ]}
          rows={history}
          rowKey={(row) => row.id}
          emptyText={t("common.report.noData")}
        />
      )}
    </ReportCard>
  );
}
