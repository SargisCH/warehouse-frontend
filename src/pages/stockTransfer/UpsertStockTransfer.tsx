import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import {
  useCreateStockTransferMutation,
  useDeleteStockTransferMutation,
  useLazyGetStockTransferByIdQuery,
} from "api/stockTransfer";
import { useGetManagersQuery } from "api/manager";
import { useGetWarehouseQuery } from "api/warehouse";
import {
  useGetPriceListsQuery,
  useLazyGetPriceListEntriesQuery,
} from "api/priceList";
import AlertDialog from "components/alertDialog/AlertDialog";
import { DataGrid } from "components/documents/DataGrid";
import { OptionSelect } from "components/documents/OptionSelect";
import {
  ProductLine,
  ProductLines,
  emptyLine,
} from "components/documents/ProductLines";
import { today } from "helpers/money";
import { StockTransfer, StockTransferItem, TransferKind } from "types";
import { TRANSFER_SETUP } from "./transferKinds";

function UpsertStockTransfer({ kind }: { kind: TransferKind }) {
  const { t } = useTranslation();
  const history = useHistory();
  const { transferId } = useParams<{ transferId?: string }>();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const setup = TRANSFER_SETUP[kind];

  const [documentDate, setDocumentDate] = useState(today());
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [priceListId, setPriceListId] = useState("");
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<ProductLine[]>([emptyLine()]);
  const [existing, setExisting] = useState<StockTransfer | null>(null);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [createTransfer] = useCreateStockTransferMutation();
  const [deleteTransfer] = useDeleteStockTransferMutation();
  const [getTransfer] = useLazyGetStockTransferByIdQuery();
  const [getEntries] = useLazyGetPriceListEntriesQuery();
  const { data: managers = [] } = useGetManagersQuery();
  const { data: warehouses = [] } = useGetWarehouseQuery();
  const { data: priceLists = [] } = useGetPriceListsQuery();

  useEffect(() => {
    (async () => {
      if (!transferId) return;
      const res = await getTransfer({ transferId });
      if (res.data) setExisting(res.data);
    })();
  }, [transferId, getTransfer]);

  // A price list fills the price of every line that has none yet.
  useEffect(() => {
    (async () => {
      if (!priceListId) {
        setPrices({});
        return;
      }
      const res = await getEntries({ priceListId });
      const byProduct = Object.fromEntries(
        (res.data ?? []).map((entry) => [entry.productId, entry.price]),
      );
      setPrices(byProduct);
      setLines((current) =>
        current.map((line) =>
          line.productId && !line.price
            ? { ...line, price: byProduct[Number(line.productId)] ?? "" }
            : line,
        ),
      );
    })();
  }, [priceListId, getEntries]);

  const optionsFor = (side: "warehouse" | "manager") =>
    side === "warehouse"
      ? warehouses.map((w) => ({ label: w.name, value: String(w.id) }))
      : managers.map((m) => ({
          label: `${m.code} — ${m.name}`,
          value: String(m.id),
        }));

  const submit = async () => {
    const items = lines.filter(
      (line) => line.productId && Number(line.quantity) > 0,
    );
    if (!from || !to || !items.length) {
      setError(t("common.transfer.incomplete"));
      return;
    }
    const endpoint = (
      side: "warehouse" | "manager",
      which: "from" | "to",
      id: string,
    ) =>
      side === "warehouse"
        ? { [`${which}WarehouseId`]: Number(id) }
        : { [`${which}ManagerId`]: Number(id) };
    const res: any = await createTransfer({
      kind,
      documentDate,
      ...endpoint(setup.from, "from", from),
      ...endpoint(setup.to, "to", to),
      sender: sender || undefined,
      receiver: receiver || undefined,
      priceListId: priceListId ? Number(priceListId) : undefined,
      note: note || undefined,
      items: items.map((line) => ({
        productId: Number(line.productId),
        quantity: String(line.quantity),
        price: setup.showPrice && line.price ? String(line.price) : undefined,
      })),
    });
    if (res?.error) {
      setError(res.error?.data?.message || "Request failed");
      return;
    }
    history.push(setup.list);
  };

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

  if (transferId) {
    if (!existing) return null;
    return (
      <Box>
        <Flex direction="column" gap="12px">
          <Text fontSize="22px" fontWeight="700" color={textColor}>
            {t(`common.transfer.kinds.${kind}`)} {existing.code}
          </Text>
          <Flex gap="32px" wrap="wrap">
            <Text>
              {t("common.sale.documentDate")}:{" "}
              {dayjs(existing.documentDate).format("DD/MM/YYYY")}
            </Text>
            <Text>
              {t(`common.transfer.from.${setup.from}`)}:{" "}
              {existing.fromWarehouseName ?? existing.fromManagerName}
            </Text>
            <Text>
              {t(`common.transfer.to.${setup.to}`)}:{" "}
              {existing.toWarehouseName ?? existing.toManagerName}
            </Text>
            {existing.note ? <Text>{existing.note}</Text> : null}
          </Flex>
          <DataGrid<StockTransferItem>
            columns={[
              { id: "productCode", label: t("common.sale.productCode") },
              { id: "productName", label: t("common.sale.productName") },
              { id: "unitName", label: t("common.unit") },
              {
                id: "quantity",
                label: t("common.sale.quantity"),
                format: "quantity",
              },
              ...(setup.showPrice
                ? [
                    {
                      id: "price",
                      label: t("common.sale.price"),
                      format: "money" as const,
                    },
                    {
                      id: "amount",
                      label: t("common.sale.amount"),
                      format: "money" as const,
                    },
                  ]
                : []),
            ]}
            rows={existing.items ?? []}
            rowKey={(row, index) => row.id ?? index}
            totals={
              setup.showPrice ? { amount: existing.totalAmount } : undefined
            }
          />
          <Flex gap="12px" mt="12px">
            <Button onClick={() => history.push(setup.list)}>
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
            headerText={t("common.delete")}
            bodyText={t("common.transfer.deleteConfirmation")}
            handleConfirm={async () => {
              const res: any = await deleteTransfer(existing.id);
              setConfirmDelete(false);
              if (res?.error) {
                setError(res.error?.data?.message || "Request failed");
                return;
              }
              history.push(setup.list);
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
        <Text fontSize="22px" fontWeight="700" color={textColor}>
          {t(`common.transfer.kinds.${kind}`)}
        </Text>
        <Flex gap="20px" wrap="wrap" align="flex-end">
          <FormControl width="180px">
            <FormLabel fontSize="sm">{t("common.sale.documentDate")}</FormLabel>
            <Input
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
            />
          </FormControl>
          {/* «Ելք» / «Մուտք» */}
          <OptionSelect
            label={t(`common.transfer.from.${setup.from}`)}
            options={optionsFor(setup.from)}
            value={from}
            onChange={setFrom}
            width="240px"
          />
          <OptionSelect
            label={t(`common.transfer.to.${setup.to}`)}
            options={optionsFor(setup.to)}
            value={to}
            onChange={setTo}
            width="240px"
          />
          {setup.showPrice ? (
            <OptionSelect
              label={t("common.sale.priceList")}
              options={priceLists.map((p) => ({
                label: `${p.code} — ${p.name}`,
                value: String(p.id),
              }))}
              value={priceListId}
              onChange={setPriceListId}
            />
          ) : null}
        </Flex>
        <Flex gap="20px" wrap="wrap">
          <FormControl width="240px">
            <FormLabel fontSize="sm">{t("common.transfer.sender")}</FormLabel>
            <Input value={sender} onChange={(e) => setSender(e.target.value)} />
          </FormControl>
          <FormControl width="240px">
            <FormLabel fontSize="sm">{t("common.transfer.receiver")}</FormLabel>
            <Input
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
            />
          </FormControl>
          <FormControl width="320px">
            <FormLabel fontSize="sm">{t("common.sale.note")}</FormLabel>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </FormControl>
        </Flex>
        <ProductLines
          lines={lines}
          onChange={setLines}
          prices={prices}
          showPrice={setup.showPrice}
        />
        <Flex gap="12px">
          <Button colorScheme="teal" onClick={submit}>
            {t("common.save")}
          </Button>
          <Button variant="ghost" onClick={() => history.push(setup.list)}>
            {t("common.cancel")}
          </Button>
        </Flex>
      </Flex>
      {errorDialog}
    </Box>
  );
}

export default UpsertStockTransfer;
