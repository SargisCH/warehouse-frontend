import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import {
  useCreatePaymentMutation,
  useCreateRefundMutation,
  useDeletePaymentMutation,
  useLazyGetClientOpenItemsQuery,
  useLazyGetPaymentByIdQuery,
} from "api/payment";
import { useGetManagersQuery } from "api/manager";
import { useGetClientQuery } from "api/client";
import { useGetSalesZonesQuery } from "api/salesZone";
import AlertDialog from "components/alertDialog/AlertDialog";
import { DataGrid } from "components/documents/DataGrid";
import { OptionSelect } from "components/documents/OptionSelect";
import { formatMoney, today } from "helpers/money";
import { Allocation, ClientOpenItems, PAYMENT_TYPES, Payment } from "types";
import { links } from "routes";

type Props = { isRefund?: boolean };

const toCents = (value: string | number) =>
  Math.round(Number(value || 0) * 100);
const fromCents = (cents: number) => (cents / 100).toFixed(2);

/**
 * «Վճարում» and «Վճարում գնորդին». A new payment lists the buyer's open
 * sales and, as the amount is typed, fills them oldest first - «ցույց տալ
 * պատմությունը թե ինչպես է կուտակվել». Whatever is left is «կանխավճար».
 */
const UpsertPayment = ({ isRefund = false }: Props) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { paymentId } = useParams<{ paymentId?: string }>();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const listLink = isRefund ? links.refunds : links.payments;

  const [documentDate, setDocumentDate] = useState(today());
  const [managerId, setManagerId] = useState("");
  const [salesZoneId, setSalesZoneId] = useState("");
  const [clientId, setClientId] = useState("");
  const [paymentType, setPaymentType] = useState("CASH");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [openItems, setOpenItems] = useState<ClientOpenItems | null>(null);
  // Amount per open sale id, as the «Մարված փաստաթղթեր» grid shows it.
  const [allocations, setAllocations] = useState<Record<number, string>>({});
  const [existing, setExisting] = useState<Payment | null>(null);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [createPayment] = useCreatePaymentMutation();
  const [createRefund] = useCreateRefundMutation();
  const [deletePayment] = useDeletePaymentMutation();
  const [getOpenItems] = useLazyGetClientOpenItemsQuery();
  const [getPayment] = useLazyGetPaymentByIdQuery();
  const { data: managers = [] } = useGetManagersQuery();
  const { data: clients = [] } = useGetClientQuery();
  const { data: salesZones = [] } = useGetSalesZonesQuery();

  const readOnly = Boolean(paymentId);

  useEffect(() => {
    (async () => {
      if (!paymentId) return;
      const res = await getPayment({ paymentId });
      if (res.data) setExisting(res.data);
    })();
  }, [paymentId, getPayment]);

  useEffect(() => {
    (async () => {
      setAllocations({});
      if (!clientId) {
        setOpenItems(null);
        return;
      }
      const res = await getOpenItems({ clientId });
      setOpenItems(res.data ?? null);
    })();
  }, [clientId, getOpenItems]);

  // The agent brings his zone; it can still be changed by hand.
  useEffect(() => {
    const manager = managers.find((m) => String(m.id) === managerId);
    if (manager?.salesZoneId) setSalesZoneId(String(manager.salesZoneId));
  }, [managerId, managers]);

  /** Oldest debts first, until the money runs out. */
  const fillOldestFirst = (value: string) => {
    let left = toCents(value);
    const next: Record<number, string> = {};
    for (const sale of openItems?.openSales ?? []) {
      if (left <= 0) break;
      const take = Math.min(left, toCents(sale.outstanding));
      next[sale.id] = fromCents(take);
      left -= take;
    }
    setAllocations(next);
  };

  const allocatedCents = useMemo(
    () =>
      Object.values(allocations).reduce(
        (sum, value) => sum + toCents(value),
        0,
      ),
    [allocations],
  );
  const toPrepayment = toCents(amount) - allocatedCents;

  const submit = async () => {
    if (!clientId || toCents(amount) <= 0) {
      setError(t("common.payment.incomplete"));
      return;
    }
    const common = {
      documentDate,
      managerId: managerId ? Number(managerId) : null,
      clientId: Number(clientId),
      paymentType,
      amount: fromCents(toCents(amount)),
      note: note || null,
    };
    const res: any = isRefund
      ? await createRefund(common)
      : await createPayment({
          ...common,
          salesZoneId: salesZoneId ? Number(salesZoneId) : null,
          allocations: Object.entries(allocations)
            .filter(([, value]) => toCents(value) > 0)
            .map(([saleId, value]) => ({
              saleId: Number(saleId),
              amount: fromCents(toCents(value)),
            })),
        });
    if (res?.error) {
      setError(res.error?.data?.message || "Request failed");
      return;
    }
    history.push(listLink);
  };

  const managerOptions = managers.map((m) => ({
    label: `${m.code} — ${m.name}`,
    value: String(m.id),
  }));
  const clientOptions = clients.map((c) => ({
    label: `${c.code} — ${c.name}`,
    value: String(c.id),
  }));
  const zoneOptions = salesZones.map((z) => ({
    label: z.name,
    value: String(z.id),
  }));
  const paymentOptions = PAYMENT_TYPES.filter(
    (type) => type === "CASH" || type === "TRANSFER",
  ).map((type) => ({
    label: t(`common.sale.paymentTypes.${type}`),
    value: type,
  }));

  if (readOnly) {
    if (!existing) return null;
    return (
      <Box>
        <Flex direction="column" gap="12px">
          <Text fontSize="22px" fontWeight="700" color={textColor}>
            {isRefund
              ? t("common.payment.refund")
              : t("common.payment.payment")}{" "}
            {existing.code}
          </Text>
          <Flex gap="32px" wrap="wrap">
            <Text>
              {t("common.sale.documentDate")}:{" "}
              {dayjs(existing.documentDate).format("DD/MM/YYYY")}
            </Text>
            <Text>
              {t("common.sale.client")}: {existing.clientCode} —{" "}
              {existing.clientName}
            </Text>
            <Text>
              {t("common.sale.manager")}: {existing.managerName ?? "—"}
            </Text>
            <Text fontWeight="700">
              {t("common.sale.amount")}: {formatMoney(existing.amount)}
            </Text>
            {!isRefund ? (
              <Text fontWeight="700">
                {t("common.payment.toPrepayment")}:{" "}
                {formatMoney(existing.unallocated)}
              </Text>
            ) : null}
          </Flex>
          <Text fontWeight="700" mt="12px">
            {isRefund
              ? t("common.payment.creditUsed")
              : t("common.payment.settledDocuments")}
          </Text>
          <DataGrid<Allocation>
            columns={
              isRefund
                ? [
                    { id: "sourceCode", label: t("common.sale.code") },
                    {
                      id: "sourceDate",
                      label: t("common.sale.documentDate"),
                      format: "date",
                    },
                    {
                      id: "amount",
                      label: t("common.sale.amount"),
                      format: "money",
                    },
                  ]
                : [
                    { id: "saleCode", label: t("common.sale.code") },
                    {
                      id: "saleDate",
                      label: t("common.sale.documentDate"),
                      format: "date",
                    },
                    {
                      id: "saleTotal",
                      label: t("common.sale.totalAmount"),
                      format: "money",
                    },
                    {
                      id: "amount",
                      label: t("common.payment.settled"),
                      format: "money",
                    },
                  ]
            }
            rows={existing.allocations ?? []}
            rowKey={(row) => row.id}
            totals={{ amount: existing.allocated }}
          />
          <Flex gap="12px" mt="12px">
            <Button onClick={() => history.push(listLink)}>
              {t("common.close")}
            </Button>
            <Button colorScheme="red" onClick={() => setConfirmDelete(true)}>
              {t("common.delete")}
            </Button>
          </Flex>
        </Flex>
        {confirmDelete ? (
          <AlertDialog
            isOpen={confirmDelete}
            onClose={() => setConfirmDelete(false)}
            headerText={t("common.payment.deletePayment")}
            bodyText={t("common.payment.deleteConfirmation")}
            handleConfirm={async () => {
              const res: any = await deletePayment(existing.id);
              setConfirmDelete(false);
              if (res?.error) {
                setError(res.error?.data?.message || "Request failed");
                return;
              }
              history.push(listLink);
            }}
          />
        ) : null}
        {error ? (
          <AlertDialog
            oneButton
            isOpen={Boolean(error)}
            onClose={() => setError("")}
            handleConfirm={() => setError("")}
            headerText="Warning"
            bodyText={error}
            confirmText="OK"
          />
        ) : null}
      </Box>
    );
  }

  return (
    <Box>
      <Flex direction="column" gap="16px">
        <Flex gap="20px" wrap="wrap" align="flex-end">
          <FormControl width="180px">
            <FormLabel fontSize="sm">{t("common.sale.documentDate")}</FormLabel>
            <Input
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
            />
          </FormControl>
          {/* «Մենեջերը պարտադիր չի» - money may reach the card directly. */}
          <OptionSelect
            label={t("common.sale.manager")}
            options={managerOptions}
            value={managerId}
            onChange={setManagerId}
            width="240px"
          />
          {!isRefund ? (
            <OptionSelect
              label={t("common.sale.salesZone")}
              options={zoneOptions}
              value={salesZoneId}
              onChange={setSalesZoneId}
            />
          ) : null}
          <OptionSelect
            label={t("common.sale.client")}
            options={clientOptions}
            value={clientId}
            onChange={setClientId}
            width="280px"
          />
        </Flex>
        <Flex gap="20px" wrap="wrap" align="flex-end">
          <OptionSelect
            label={t("common.sale.paymentType")}
            options={paymentOptions}
            value={paymentType}
            onChange={(v) => setPaymentType(v || "CASH")}
            width="180px"
          />
          <FormControl width="180px">
            <FormLabel fontSize="sm">
              {isRefund
                ? t("common.payment.refundAmount")
                : t("common.payment.paidAmount")}
            </FormLabel>
            <Input
              value={amount}
              placeholder="0.00"
              onChange={(e) => {
                setAmount(e.target.value);
                if (!isRefund) fillOldestFirst(e.target.value);
              }}
            />
          </FormControl>
          <FormControl width="320px">
            <FormLabel fontSize="sm">{t("common.sale.note")}</FormLabel>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </FormControl>
        </Flex>

        {/* «Գնորդի մնացորդներ» */}
        {openItems ? (
          <Flex gap="24px" wrap="wrap" bg="blackAlpha.50" p="12px" rounded="md">
            <Text fontSize="sm" fontWeight="700">
              {t("common.sale.debt")}: {formatMoney(openItems.debt)}
            </Text>
            <Text
              fontSize="sm"
              fontWeight="700"
              color={Number(openItems.overdue) > 0 ? "red.500" : undefined}
            >
              {t("common.sale.overdueDebt")}: {formatMoney(openItems.overdue)}
            </Text>
            <Text fontSize="sm" fontWeight="700">
              {t("common.sale.prepaid")}: {formatMoney(openItems.prepayment)}
            </Text>
            <Text fontSize="sm" fontWeight="700">
              {t("common.payment.unusedReturns")}:{" "}
              {formatMoney(openItems.returns)}
            </Text>
          </Flex>
        ) : null}

        {/* «Մարված փաստաթղթեր» */}
        {!isRefund && openItems ? (
          <Box>
            <Text fontWeight="700" mb="8px" color={textColor}>
              {t("common.payment.settledDocuments")}
            </Text>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th />
                  <Th>{t("common.sale.code")}</Th>
                  <Th>{t("common.sale.documentDate")}</Th>
                  <Th isNumeric>{t("common.sale.totalAmount")}</Th>
                  <Th isNumeric>{t("common.sale.outstanding")}</Th>
                  <Th>{t("common.payment.settled")}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {openItems.openSales.map((sale) => {
                  const checked = sale.id in allocations;
                  return (
                    <Tr
                      key={sale.id}
                      color={sale.isOverdue ? "red.500" : undefined}
                    >
                      <Td>
                        <Checkbox
                          isChecked={checked}
                          onChange={(e) =>
                            setAllocations((current) => {
                              const next = { ...current };
                              if (e.target.checked)
                                next[sale.id] = sale.outstanding;
                              else delete next[sale.id];
                              return next;
                            })
                          }
                        />
                      </Td>
                      <Td>{sale.code}</Td>
                      <Td>{dayjs(sale.documentDate).format("DD/MM/YYYY")}</Td>
                      <Td isNumeric>{formatMoney(sale.totalAmount)}</Td>
                      <Td isNumeric>{formatMoney(sale.outstanding)}</Td>
                      <Td>
                        <Input
                          size="sm"
                          width="120px"
                          isDisabled={!checked}
                          value={allocations[sale.id] ?? ""}
                          onChange={(e) =>
                            setAllocations((current) => ({
                              ...current,
                              [sale.id]: e.target.value,
                            }))
                          }
                        />
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
            {!openItems.openSales.length ? (
              <Text fontSize="sm" color="gray.400" p="12px">
                {t("common.payment.noOpenDocuments")}
              </Text>
            ) : null}
            <Flex justify="flex-end" gap="24px" mt="8px">
              <Text fontSize="sm" fontWeight="700">
                {t("common.payment.settled")}:{" "}
                {formatMoney(fromCents(allocatedCents))}
              </Text>
              {/* «Վճարված գումարի և պարտքի տարբերությունը գնումա կանխավճար» */}
              <Text
                fontSize="sm"
                fontWeight="700"
                color={toPrepayment < 0 ? "red.500" : undefined}
              >
                {t("common.payment.toPrepayment")}:{" "}
                {formatMoney(fromCents(toPrepayment))}
              </Text>
            </Flex>
          </Box>
        ) : null}

        <Flex gap="12px">
          <Button colorScheme="teal" onClick={submit}>
            {t("common.save")}
          </Button>
          <Button variant="ghost" onClick={() => history.push(listLink)}>
            {t("common.cancel")}
          </Button>
        </Flex>
      </Flex>
      {error ? (
        <AlertDialog
          oneButton
          isOpen={Boolean(error)}
          onClose={() => setError("")}
          handleConfirm={() => setError("")}
          headerText="Warning"
          bodyText={error}
          confirmText="OK"
        />
      ) : null}
    </Box>
  );
};

export default UpsertPayment;
