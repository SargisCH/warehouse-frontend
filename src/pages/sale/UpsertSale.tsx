import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import {
  useCreateSaleMutation,
  useDeleteSaleMutation,
  useLazyGetClientSnapshotQuery,
  useLazyGetSaleByIdQuery,
  useLazyGetManagerStockQuery,
  usePaySaleMutation,
} from "api/sale";
import { useGetManagersQuery } from "api/manager";
import { useGetDocumentQuery } from "api/document";
import { useGetClientQuery } from "api/client";
import {
  useGetPriceListsQuery,
  useLazyGetPriceListEntriesQuery,
} from "api/priceList";
import AlertDialog from "components/alertDialog/AlertDialog";
import { DataGrid } from "components/documents/DataGrid";
import {
  Allocation,
  ClientSnapshot,
  PAYMENT_TYPES,
  PriceListEntry,
  Sale,
} from "types";
import { links } from "routes";

type Line = {
  productId: number;
  productCode: string | null;
  productName: string | null;
  unitName: string | null;
  quantity: string;
  price: string;
};

const money = (value?: string | number | null) =>
  value === undefined || value === null || value === ""
    ? "0.00"
    : Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

// Mirrors the server: quantity carries three decimals, money two.
const lineAmount = (line: Line) =>
  Math.round(Number(line.quantity || 0) * Number(line.price || 0) * 100) / 100;

const UpsertSale = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useParams() as any;
  const textColor = useColorModeValue("secondaryGray.900", "white");

  // An existing document is shown read-only; this screen creates new ones.
  const saleId = params.saleId;
  const isReturn =
    Boolean(params.isReturn) || history.location.pathname.includes("return");

  const [error, setError] = useState("");
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [savedNotice, setSavedNotice] = useState<{
    code: string;
    total: string;
    paid: string;
  } | null>(null);

  const [managerId, setManagerId] = useState("");
  // «Առաքիչ»: another manager; empty means the agent delivers himself.
  const [delivererId, setDelivererId] = useState("");
  const [loaded, setLoaded] = useState<Sale | null>(null);
  const [clientId, setClientId] = useState("");
  const [priceListId, setPriceListId] = useState("");
  const [paymentType, setPaymentType] = useState("CASH");
  // Set once the user picks a payment type, so the buyer's default stops
  // overriding it.
  const [paymentTypeTouched, setPaymentTypeTouched] = useState(false);
  const [documentId, setDocumentId] = useState("");
  // «Սեյվ տալուց բերել պատուհան որ վճարվածա արդեն»: the save waits here for
  // the amount actually paid.
  const [paidPrompt, setPaidPrompt] = useState<{
    keepHeader: boolean;
    amount: string;
  } | null>(null);
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [snapshot, setSnapshot] = useState<ClientSnapshot | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerRows, setPickerRows] = useState<PriceListEntry[]>([]);
  const [stock, setStock] = useState<Record<number, string>>({});

  const [createSale] = useCreateSaleMutation();
  const [deleteSale] = useDeleteSaleMutation();
  const [paySale] = usePaySaleMutation();
  const [getSnapshot] = useLazyGetClientSnapshotQuery();
  const [getEntries] = useLazyGetPriceListEntriesQuery();
  const [getManagerStock] = useLazyGetManagerStockQuery();
  const [getSaleById] = useLazyGetSaleByIdQuery();

  const { data: managers = [] } = useGetManagersQuery();
  const { data: clients = [] } = useGetClientQuery();
  const { data: priceLists = [] } = useGetPriceListsQuery();
  const { data: documents = [] } = useGetDocumentQuery();
  const documentOptions = documents.map((d: any) => ({
    label: d.name,
    value: String(d.id),
  }));
  // «Պատճենել» opens a new document filled from an existing one.
  const copyFrom = new URLSearchParams(history.location.search).get("copyFrom");

  const manager = managers.find((m) => String(m.id) === managerId);

  const managerOptions = managers.map((m) => ({
    label: `${m.code} — ${m.name}`,
    value: String(m.id),
  }));

  // A new agent brings his own deliverer.
  useEffect(() => {
    if (saleId) return;
    setDelivererId(manager?.delivererId ? String(manager.delivererId) : "");
  }, [manager, saleId]);
  const clientOptions = clients.map((c) => ({
    label: `${c.code} — ${c.name}`,
    value: String(c.id),
  }));
  const priceListOptions = priceLists.map((p) => ({
    label: `${p.code} — ${p.name}`,
    value: String(p.id),
  }));
  const paymentOptions = PAYMENT_TYPES.map((type) => ({
    label: t(`common.sale.paymentTypes.${type}`),
    value: type,
  }));

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + lineAmount(line), 0),
    [lines],
  );

  // Load an existing document when the route carries one, or the document
  // being copied - editable then, since it becomes a new one.
  useEffect(() => {
    (async () => {
      const sourceId = saleId || copyFrom;
      if (!sourceId) return;
      const res = await getSaleById({ saleId: sourceId });
      if (!res.data) return;
      const sale = res.data;
      if (saleId) setLoaded(sale);
      else setPaymentTypeTouched(true);
      setDocumentId(sale.documentId ? String(sale.documentId) : "");
      setManagerId(String(sale.managerId));
      setDelivererId(sale.delivererId ? String(sale.delivererId) : "");
      setClientId(String(sale.clientId));
      setPriceListId(sale.priceListId ? String(sale.priceListId) : "");
      setPaymentType(sale.paymentType);
      setNote(sale.note ?? "");
      setLines(
        (sale.items ?? []).map((item) => ({
          productId: item.productId,
          productCode: item.productCode ?? null,
          productName: item.productName ?? null,
          unitName: item.unitName ?? null,
          quantity: item.quantity,
          price: item.price,
        })),
      );
    })();
  }, [saleId, copyFrom, getSaleById]);

  // «Գնորդ նշելուց բերել ինչքան պարտք ունի» and the last purchase date.
  useEffect(() => {
    (async () => {
      if (!clientId) {
        setSnapshot(null);
        return;
      }
      const res = await getSnapshot({ clientId });
      if (res.data) {
        setSnapshot(res.data);
        // The buyer's own «Վճարման տեսակ» until the user picks one.
        if (res.data.paymentType && !paymentTypeTouched && !saleId) {
          setPaymentType(res.data.paymentType);
        }
        // The buyer's own «Գնացուցակ» wins until the user picks another.
        if (res.data.priceListId && !priceListId) {
          setPriceListId(String(res.data.priceListId));
        }
      }
    })();
    // priceListId is deliberately not a dependency: re-running on every price
    // list change would fight the user's own selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, getSnapshot]);

  // What the agent is carrying, so the picker can show it beside each product.
  useEffect(() => {
    (async () => {
      if (!managerId) {
        setStock({});
        return;
      }
      const res = await getManagerStock({ managerId });
      setStock(
        Object.fromEntries(
          (res.data ?? []).map((row) => [row.productId, row.quantity]),
        ),
      );
    })();
  }, [managerId, getManagerStock]);

  const openPicker = useCallback(async () => {
    const listId = priceListId || snapshot?.priceListId;
    if (!listId) {
      setError(t("common.sale.pickPriceListFirst"));
      return;
    }
    const res = await getEntries({
      priceListId: listId,
      searchTerm: pickerSearch,
    });
    setPickerRows(res.data ?? []);
    setPickerOpen(true);
  }, [priceListId, snapshot, pickerSearch, getEntries, t]);

  const addLine = (entry: PriceListEntry) => {
    setLines((current) =>
      current.some((line) => line.productId === entry.productId)
        ? current
        : [
            ...current,
            {
              productId: entry.productId,
              productCode: entry.productCode,
              productName: entry.productName,
              unitName: entry.unitName,
              quantity: "1",
              price: entry.price,
            },
          ],
    );
  };

  const updateLine = (productId: number, patch: Partial<Line>) =>
    setLines((current) =>
      current.map((line) =>
        line.productId === productId ? { ...line, ...patch } : line,
      ),
    );

  const removeLine = (productId: number) =>
    setLines((current) =>
      current.filter((line) => line.productId !== productId),
    );

  /**
   * «Հիշել և նոր» keeps the agent, the date and the zone and clears the rest,
   * so a round of visits is entered without re-picking the same header.
   */
  /** Save first asks what was paid; a return has nothing to ask. */
  const askPaid = (keepHeader: boolean) => {
    if (!managerId || !clientId || !lines.length) {
      setError(t("common.sale.incompleteSale"));
      return;
    }
    if (isReturn) {
      submit(keepHeader);
      return;
    }
    setPaidPrompt({
      keepHeader,
      amount: paymentType === "CASH" ? total.toFixed(2) : "0.00",
    });
  };

  const submit = async (keepHeader: boolean, paidAmount?: string) => {
    const body: any = {
      managerId: Number(managerId),
      clientId: Number(clientId),
      delivererId: delivererId ? Number(delivererId) : null,
      priceListId: priceListId ? Number(priceListId) : null,
      documentId: documentId ? Number(documentId) : null,
      paymentType,
      note: note || null,
      isReturn,
      items: lines.map((line) => ({
        productId: line.productId,
        quantity: String(line.quantity),
        price: String(line.price),
      })),
    };
    if (paidAmount !== undefined && paidAmount !== "") {
      body.paidAmount = String(paidAmount);
    }

    const res: any = await createSale(body);
    if (res?.error) {
      setError(res.error?.data?.message || "Request failed");
      return;
    }

    // «Սեյվ տալուց բերել պատուհան որ վճարվածա արդեն».
    setSavedNotice({
      code: res.data.code,
      total: res.data.totalAmount,
      paid: res.data.paidAmount,
    });

    if (keepHeader) {
      setClientId("");
      setSnapshot(null);
      setLines([]);
      setNote("");
    } else {
      setManagerId("");
      setClientId("");
      setSnapshot(null);
      setLines([]);
      setNote("");
      setPriceListId("");
      setDocumentId("");
    }
    setPaymentTypeTouched(false);
  };

  const readOnly = Boolean(saleId);

  return (
    <Box>
      <Flex direction="column" gap="16px">
        <Flex gap="20px" wrap="wrap">
          <FormControl width="220px">
            <FormLabel>{t("common.sale.documentDate")}</FormLabel>
            {/* «Ամիս ամսաթիվ - էսօրվան, մենեջեռը չի կարա փոխի» */}
            <Input value={dayjs().format("DD/MM/YYYY")} isReadOnly isDisabled />
          </FormControl>
          <FormControl width="260px">
            <FormLabel>{t("common.sale.manager")}</FormLabel>
            <Select
              isDisabled={readOnly}
              placeholder={t("common.sale.selectManager")}
              options={managerOptions}
              value={managerOptions.find((o) => o.value === managerId) ?? null}
              onChange={(v) => setManagerId(v?.value ?? "")}
            />
          </FormControl>
          <FormControl width="260px">
            <FormLabel>{t("common.sale.salesZone")}</FormLabel>
            {/* «Բերել ավտոմատ մենեջեռի կպած գոտուց, ի սկզբանե դիսաբլեդ» */}
            <Input
              value={manager?.salesZoneName ?? ""}
              placeholder={t("common.sale.zoneFromManager")}
              isReadOnly
              isDisabled
            />
          </FormControl>
          <FormControl width="260px">
            <FormLabel>{t("common.sale.deliverer")}</FormLabel>
            <Select
              isDisabled={readOnly}
              isClearable
              placeholder={t("common.sale.selectDeliverer")}
              options={managerOptions}
              value={
                managerOptions.find((o) => o.value === delivererId) ?? null
              }
              onChange={(v) => setDelivererId(v?.value ?? "")}
            />
          </FormControl>
        </Flex>

        <Flex gap="20px" wrap="wrap">
          <FormControl width="300px">
            <FormLabel>{t("common.sale.client")}</FormLabel>
            <Select
              isDisabled={readOnly}
              placeholder={t("common.sale.selectClient")}
              options={clientOptions}
              value={clientOptions.find((o) => o.value === clientId) ?? null}
              onChange={(v) => setClientId(v?.value ?? "")}
            />
          </FormControl>
          <FormControl width="260px">
            <FormLabel>{t("common.sale.priceList")}</FormLabel>
            <Select
              isDisabled={readOnly}
              isClearable
              placeholder={t("common.sale.selectPriceList")}
              options={priceListOptions}
              value={
                priceListOptions.find((o) => o.value === priceListId) ?? null
              }
              onChange={(v) => setPriceListId(v?.value ?? "")}
            />
          </FormControl>
        </Flex>

        {/* «Գնորդի մնացորդներ» */}
        {snapshot ? (
          <Flex gap="24px" wrap="wrap" bg="blackAlpha.50" p="12px" rounded="md">
            <Text fontSize="sm" fontWeight="700" color={textColor}>
              {t("common.sale.debt")}: {money(snapshot.debt)}
            </Text>
            <Text fontSize="sm" fontWeight="700" color={textColor}>
              {t("common.sale.prepaid")}: {money(snapshot.prepaid)}
            </Text>
            <Text fontSize="sm" color={textColor}>
              {t("common.sale.unusedPrepayment")}:{" "}
              {money(snapshot.unusedPrepayment)}
            </Text>
            <Text fontSize="sm" color={textColor}>
              {t("common.sale.unusedReturns")}: {money(snapshot.unusedReturns)}
            </Text>
            <Text
              fontSize="sm"
              fontWeight="700"
              color={Number(snapshot.overdueDebt) > 0 ? "red.500" : textColor}
            >
              {t("common.sale.overdueDebt")}: {money(snapshot.overdueDebt)}
            </Text>
            {Number(snapshot.debtLimit) > 0 ? (
              <Text fontSize="sm" color="gray.500">
                {t("common.client.debtLimit")}: {money(snapshot.debtLimit)}
              </Text>
            ) : null}
            <Text fontSize="sm" color="gray.500">
              {t("common.sale.lastPurchase")}:{" "}
              {snapshot.lastPurchaseDate
                ? `${dayjs(snapshot.lastPurchaseDate).format("DD/MM/YYYY")} — ${money(
                    snapshot.lastPurchaseAmount,
                  )}`
                : t("common.sale.noPurchases")}
            </Text>
          </Flex>
        ) : null}

        {/* «Ապրանքներ» */}
        <Box>
          <Flex justify="space-between" align="center" mb="8px">
            <Text fontSize="18px" fontWeight="700" color={textColor}>
              {t("common.sale.products")}
            </Text>
            {!readOnly ? (
              <Flex gap="8px">
                <Input
                  size="sm"
                  width="200px"
                  placeholder={t("common.searchTerm")}
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                />
                <Button size="sm" colorScheme="teal" onClick={openPicker}>
                  {t("common.sale.addFromPriceList")}
                </Button>
              </Flex>
            ) : null}
          </Flex>

          {pickerOpen ? (
            <Box
              borderWidth="1px"
              rounded="md"
              p="8px"
              mb="12px"
              maxHeight="300px"
              overflowY="auto"
            >
              <Flex justify="space-between" mb="8px">
                <Text fontWeight="700">
                  {t("common.sale.priceListProducts")}
                </Text>
                <Button size="xs" onClick={() => setPickerOpen(false)}>
                  {t("common.close")}
                </Button>
              </Flex>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>{t("common.sale.productCode")}</Th>
                    <Th>{t("common.sale.productName")}</Th>
                    <Th>{t("common.sale.inStock")}</Th>
                    <Th>{t("common.sale.price")}</Th>
                    <Th />
                  </Tr>
                </Thead>
                <Tbody>
                  {pickerRows.map((entry) => (
                    <Tr key={entry.productId}>
                      <Td>{entry.productCode}</Td>
                      <Td>{entry.productName}</Td>
                      <Td>{stock[entry.productId] ?? "0.000"}</Td>
                      <Td>{money(entry.price)}</Td>
                      <Td>
                        <Button size="xs" onClick={() => addLine(entry)}>
                          {t("common.add")}
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : null}

          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>{t("common.sale.productCode")}</Th>
                <Th>{t("common.sale.productName")}</Th>
                <Th>{t("common.unit")}</Th>
                <Th>{t("common.sale.quantity")}</Th>
                <Th>{t("common.sale.price")}</Th>
                <Th>{t("common.sale.amount")}</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {lines.map((line) => (
                <Tr key={line.productId}>
                  <Td>{line.productCode}</Td>
                  <Td>{line.productName}</Td>
                  <Td>{line.unitName}</Td>
                  <Td>
                    <Input
                      size="sm"
                      width="90px"
                      isDisabled={readOnly}
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(line.productId, { quantity: e.target.value })
                      }
                    />
                  </Td>
                  <Td>
                    <Input
                      size="sm"
                      width="110px"
                      isDisabled={readOnly}
                      value={line.price}
                      onChange={(e) =>
                        updateLine(line.productId, { price: e.target.value })
                      }
                    />
                  </Td>
                  <Td>{money(lineAmount(line))}</Td>
                  <Td>
                    {!readOnly ? (
                      <Button
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeLine(line.productId)}
                      >
                        {t("common.delete")}
                      </Button>
                    ) : null}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Flex justify="flex-end" mt="8px" gap="16px">
            <Text fontWeight="700" color={textColor}>
              {t("common.sale.totalAmount")}: {money(total)}
            </Text>
          </Flex>
        </Box>

        {/* What settled this document since it was saved. */}
        {readOnly && loaded ? (
          <Box>
            <Flex gap="24px" mb="8px">
              <Text fontWeight="700" color={textColor}>
                {t("common.sale.paidAmount")}: {money(loaded.settledAmount)}
              </Text>
              <Text fontWeight="700" color={textColor}>
                {t("common.sale.outstanding")}: {money(loaded.outstanding)}
              </Text>
            </Flex>
            {loaded.allocations?.length ? (
              <DataGrid<Allocation>
                columns={
                  loaded.isReturn
                    ? [
                        { id: "saleCode", label: t("common.sale.code") },
                        {
                          id: "saleDate",
                          label: t("common.sale.documentDate"),
                          format: "date",
                        },
                        {
                          id: "amount",
                          label: t("common.payment.settled"),
                          format: "money",
                        },
                      ]
                    : [
                        { id: "sourceCode", label: t("common.sale.settledBy") },
                        {
                          id: "sourceDate",
                          label: t("common.sale.documentDate"),
                          format: "date",
                        },
                        {
                          id: "amount",
                          label: t("common.payment.settled"),
                          format: "money",
                        },
                      ]
                }
                rows={loaded.allocations}
                rowKey={(row) => row.id}
              />
            ) : null}
          </Box>
        ) : null}

        {/* «Լրացուցիչ» */}
        <Flex gap="20px" wrap="wrap">
          <FormControl width="220px">
            <FormLabel>{t("common.sale.paymentType")}</FormLabel>
            <Select
              isDisabled={readOnly}
              options={paymentOptions}
              value={
                paymentOptions.find((o) => o.value === paymentType) ?? null
              }
              onChange={(v) => {
                setPaymentType(v?.value ?? "CASH");
                setPaymentTypeTouched(true);
              }}
            />
          </FormControl>
          <FormControl width="220px">
            <FormLabel>{t("common.sale.documentGroup")}</FormLabel>
            <Select
              isDisabled={readOnly}
              isClearable
              placeholder={t("common.sale.documentGroup")}
              options={documentOptions}
              value={
                documentOptions.find((o) => o.value === documentId) ?? null
              }
              onChange={(v) => setDocumentId(v?.value ?? "")}
            />
          </FormControl>
          <FormControl width="300px">
            <FormLabel>{t("common.sale.note")}</FormLabel>
            <Input
              isDisabled={readOnly}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </FormControl>
        </Flex>

        <Flex gap="12px">
          {!readOnly ? (
            <>
              <Button colorScheme="teal" onClick={() => askPaid(false)}>
                {t("common.save")}
              </Button>
              {/* «Հիշել և նոր» - keeps date, agent and zone. */}
              <Button variant="outline" onClick={() => askPaid(true)}>
                {t("common.sale.saveAndNew")}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => window.print()}>
                {t("common.sale.print")}
              </Button>
              <Button
                colorScheme="blue"
                isDisabled={
                  isReturn || !loaded || Number(loaded.outstanding) <= 0
                }
                onClick={async () => {
                  const res: any = await paySale({ saleId });
                  if (res?.error) {
                    setError(res.error?.data?.message || "Request failed");
                    return;
                  }
                  history.push(isReturn ? links.saleReturns : links.sales);
                }}
              >
                {t("common.sale.pay")}
              </Button>
              <Button
                colorScheme="red"
                onClick={() => setIsDeleteDialogOpened(true)}
              >
                {t("common.delete")}
              </Button>
            </>
          )}
        </Flex>
      </Flex>

      {paidPrompt ? (
        <Modal isOpen onClose={() => setPaidPrompt(null)} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t("common.sale.paidPromptTitle")}</ModalHeader>
            <ModalBody>
              <Text mb="8px">
                {t("common.sale.paidPromptBody", { total: money(total) })}
              </Text>
              <Input
                autoFocus
                value={paidPrompt.amount}
                onChange={(e) =>
                  setPaidPrompt({ ...paidPrompt, amount: e.target.value })
                }
              />
              <Text fontSize="sm" color="gray.500" mt="8px">
                {t("common.sale.outstanding")}:{" "}
                {money(total - Number(paidPrompt.amount || 0))}
              </Text>
            </ModalBody>
            <ModalFooter gap="8px">
              <Button variant="ghost" onClick={() => setPaidPrompt(null)}>
                {t("common.cancel")}
              </Button>
              <Button
                colorScheme="teal"
                onClick={() => {
                  const { keepHeader, amount } = paidPrompt;
                  setPaidPrompt(null);
                  submit(keepHeader, amount);
                }}
              >
                {t("common.save")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : null}

      {savedNotice ? (
        <AlertDialog
          handleConfirm={() => setSavedNotice(null)}
          oneButton
          isOpen={Boolean(savedNotice)}
          onClose={() => setSavedNotice(null)}
          bodyText={t("common.sale.savedNotice", {
            code: savedNotice.code,
            total: money(savedNotice.total),
            paid: money(savedNotice.paid),
            outstanding: money(
              Number(savedNotice.total) - Number(savedNotice.paid),
            ),
          })}
          headerText={t("common.sale.saved")}
          confirmText="OK"
        />
      ) : null}

      {isDeleteDialogOpened ? (
        <AlertDialog
          handleConfirm={async () => {
            const res: any = await deleteSale(saleId);
            setIsDeleteDialogOpened(false);
            if (res?.error) {
              setError(res.error?.data?.message || "Request failed");
              return;
            }
            history.push(isReturn ? links.saleReturns : links.sales);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={t("common.sale.deleteConfirmation")}
          headerText={t("common.sale.deleteSale")}
        />
      ) : null}

      {error ? (
        <AlertDialog
          handleConfirm={() => setError("")}
          oneButton
          isOpen={Boolean(error)}
          onClose={() => setError("")}
          bodyText={error}
          headerText={"Warning"}
          confirmText="OK"
        />
      ) : null}
    </Box>
  );
};

export default UpsertSale;
