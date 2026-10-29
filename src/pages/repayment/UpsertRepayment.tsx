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
  useCreateRepaymentMutation,
  useDeleteRepaymentMutation,
  useLazyGetClientOpenItemsQuery,
  useLazyGetRepaymentByIdQuery,
} from "api/payment";
import { useGetClientQuery } from "api/client";
import AlertDialog from "components/alertDialog/AlertDialog";
import { DataGrid } from "components/documents/DataGrid";
import { OptionSelect } from "components/documents/OptionSelect";
import { formatMoney, today } from "helpers/money";
import { Allocation, ClientOpenItems, Repayment } from "types";
import { links } from "routes";

const toCents = (value: string | number) =>
  Math.round(Number(value || 0) * 100);
const fromCents = (cents: number) => (cents / 100).toFixed(2);

/**
 * «Ավելացնել մարում»: spends the buyer's «կանխավճար» or «վերադարձ» on the
 * documents picked from «Մարման ենթակա փաստաթղթեր». The amount is the sum of
 * what is picked, so it is not typed.
 */
const UpsertRepayment = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { repaymentId } = useParams<{ repaymentId?: string }>();
  const textColor = useColorModeValue("secondaryGray.900", "white");

  const [documentDate, setDocumentDate] = useState(today());
  const [clientId, setClientId] = useState("");
  const [source, setSource] = useState("PREPAYMENT");
  const [note, setNote] = useState("");
  const [openItems, setOpenItems] = useState<ClientOpenItems | null>(null);
  const [allocations, setAllocations] = useState<Record<number, string>>({});
  const [existing, setExisting] = useState<Repayment | null>(null);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [createRepayment] = useCreateRepaymentMutation();
  const [deleteRepayment] = useDeleteRepaymentMutation();
  const [getOpenItems] = useLazyGetClientOpenItemsQuery();
  const [getRepayment] = useLazyGetRepaymentByIdQuery();
  const { data: clients = [] } = useGetClientQuery();

  useEffect(() => {
    (async () => {
      if (!repaymentId) return;
      const res = await getRepayment({ repaymentId });
      if (res.data) setExisting(res.data);
    })();
  }, [repaymentId, getRepayment]);

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

  const available = openItems
    ? source === "PREPAYMENT"
      ? openItems.prepayment
      : openItems.returns
    : "0";
  const totalCents = useMemo(
    () =>
      Object.values(allocations).reduce(
        (sum, value) => sum + toCents(value),
        0,
      ),
    [allocations],
  );

  /** Pick the oldest documents until the chosen source is spent. */
  const fillOldestFirst = () => {
    let left = toCents(available);
    const next: Record<number, string> = {};
    for (const sale of openItems?.openSales ?? []) {
      if (left <= 0) break;
      const take = Math.min(left, toCents(sale.outstanding));
      next[sale.id] = fromCents(take);
      left -= take;
    }
    setAllocations(next);
  };

  const submit = async () => {
    const picked = Object.entries(allocations).filter(
      ([, value]) => toCents(value) > 0,
    );
    if (!clientId || !picked.length) {
      setError(t("common.repayment.incomplete"));
      return;
    }
    const res: any = await createRepayment({
      documentDate,
      clientId: Number(clientId),
      source,
      note: note || null,
      allocations: picked.map(([saleId, value]) => ({
        saleId: Number(saleId),
        amount: fromCents(toCents(value)),
      })),
    });
    if (res?.error) {
      setError(res.error?.data?.message || "Request failed");
      return;
    }
    history.push(links.repayments);
  };

  const sourceOptions = ["PREPAYMENT", "RETURN"].map((value) => ({
    label: t(`common.repayment.sources.${value}`),
    value,
  }));

  const errorDialog = error ? (
    <AlertDialog
      oneButton
      isOpen={Boolean(error)}
      onClose={() => setError("")}
      handleConfirm={() => setError("")}
      headerText="Warning"
      bodyText={error}
      confirmText="OK"
    />
  ) : null;

  if (repaymentId) {
    if (!existing) return null;
    return (
      <Box>
        <Flex direction="column" gap="12px">
          <Text fontSize="22px" fontWeight="700" color={textColor}>
            {t("common.repayment.repayment")} {existing.code}
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
              {t("common.repayment.source")}:{" "}
              {t(`common.repayment.sources.${existing.source}`)}
            </Text>
            <Text fontWeight="700">
              {t("common.sale.amount")}: {formatMoney(existing.amount)}
            </Text>
          </Flex>
          <DataGrid<Allocation>
            columns={[
              { id: "saleCode", label: t("common.sale.code") },
              {
                id: "saleDate",
                label: t("common.sale.documentDate"),
                format: "date",
              },
              { id: "sourceCode", label: t("common.repayment.sourceDocument") },
              {
                id: "amount",
                label: t("common.payment.settled"),
                format: "money",
              },
            ]}
            rows={existing.allocations ?? []}
            rowKey={(row) => row.id}
            totals={{ amount: existing.amount }}
          />
          <Flex gap="12px" mt="12px">
            <Button onClick={() => history.push(links.repayments)}>
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
            headerText={t("common.repayment.deleteRepayment")}
            bodyText={t("common.repayment.deleteConfirmation")}
            handleConfirm={async () => {
              const res: any = await deleteRepayment(existing.id);
              setConfirmDelete(false);
              if (res?.error) {
                setError(res.error?.data?.message || "Request failed");
                return;
              }
              history.push(links.repayments);
            }}
          />
        ) : null}
        {errorDialog}
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
          <OptionSelect
            label={t("common.repayment.source")}
            options={sourceOptions}
            value={source}
            onChange={(v) => {
              setSource(v || "PREPAYMENT");
              setAllocations({});
            }}
          />
          <FormControl width="180px">
            <FormLabel fontSize="sm">{t("common.repayment.amount")}</FormLabel>
            <Input
              value={formatMoney(fromCents(totalCents))}
              isReadOnly
              isDisabled
            />
          </FormControl>
          <FormControl width="300px">
            <FormLabel fontSize="sm">{t("common.sale.note")}</FormLabel>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </FormControl>
        </Flex>

        {openItems ? (
          <Box>
            <Flex justify="space-between" align="center" mb="8px">
              <Text fontWeight="700" color={textColor}>
                {t("common.repayment.availableFromSource")}:{" "}
                {formatMoney(available)}
              </Text>
              <Button size="sm" onClick={fillOldestFirst}>
                {t("common.repayment.fillOldestFirst")}
              </Button>
            </Flex>
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
          </Box>
        ) : null}

        <Flex gap="12px">
          <Button colorScheme="teal" onClick={submit}>
            {t("common.save")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => history.push(links.repayments)}
          >
            {t("common.cancel")}
          </Button>
        </Flex>
      </Flex>
      {errorDialog}
    </Box>
  );
};

export default UpsertRepayment;
