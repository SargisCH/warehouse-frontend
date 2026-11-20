import {
  Alert,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { FormEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AssetCondition,
  useAddCompanyAssetEntryMutation,
  useCreateCompanyAssetMutation,
  useSetCompanyCashOpeningMutation,
} from "api/companyAssets";
import { today } from "helpers/money";

export type AssetFormMode = "asset" | "repair" | "receipt" | "opening";

const errorKeys: Record<string, string> = {
  ASSET_INVALID_DATE: "invalidDate",
  ASSET_ALREADY_SOLD: "alreadySold",
  ASSET_INVALID_AMOUNT: "invalidAmount",
  ASSET_OPENING_ALREADY_SET: "openingAlreadySet",
};

export function AssetForm({
  mode,
  assetId,
  trackingDate,
  onClose,
  onCreated,
}: {
  mode: AssetFormMode;
  assetId?: string;
  trackingDate?: string;
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [condition, setCondition] = useState<AssetCondition>("NEW");
  const [kind, setKind] = useState<"SALE" | "REFUND">("SALE");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [affectsCash, setAffectsCash] = useState(true);
  const [error, setError] = useState("");
  const request = useRef<{ id: string; fingerprint: string }>();
  const saving = useRef(false);
  const [createAsset, { isLoading: creating }] =
    useCreateCompanyAssetMutation();
  const [addEntry, { isLoading: adding }] = useAddCompanyAssetEntryMutation();
  const [setOpening, { isLoading: opening }] =
    useSetCompanyCashOpeningMutation();
  const isSaving = creating || adding || opening;
  const isAsset = mode === "asset";
  const isOpening = mode === "opening";
  const isReceipt = mode === "receipt";
  const direction = isReceipt ? "cashReceived" : "cashPaid";

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (saving.current) return;
    setError("");

    const money = amount.trim().replace(",", ".");
    if (
      !/^\d{1,12}(\.\d{1,2})?$/.test(money) ||
      (!isAsset && !isOpening && Number(money) === 0)
    ) {
      setError("invalidAmount");
      return;
    }
    if (
      (isAsset && !name.trim()) ||
      (!isAsset && !isOpening && !description.trim())
    ) {
      setError("missingText");
      return;
    }

    saving.current = true;
    try {
      if (isOpening) {
        await setOpening({ amount: money }).unwrap();
      } else {
        const payload = {
          date,
          amount: money,
          affectsCash,
          description: description.trim(),
        };
        const fingerprint = JSON.stringify({
          payload,
          name: name.trim(),
          condition,
          kind,
        });
        if (request.current?.fingerprint !== fingerprint) {
          request.current = { id: crypto.randomUUID(), fingerprint };
        }
        const body = { id: request.current.id, ...payload };
        if (isAsset) {
          const asset = await createAsset({
            ...body,
            name: name.trim(),
            condition,
          }).unwrap();
          onCreated?.(asset.id);
        } else if (assetId) {
          await addEntry({
            assetId,
            body: { ...body, kind: isReceipt ? kind : "REPAIR" },
          }).unwrap();
        }
      }
      onClose();
    } catch (failure) {
      const message = (failure as { data?: { message?: unknown } })?.data
        ?.message;
      setError(
        typeof message === "string"
          ? errorKeys[message] ?? "saveError"
          : "saveError"
      );
    } finally {
      saving.current = false;
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      closeOnOverlayClick={!isSaving}
      closeOnEsc={!isSaving}
      isCentered
    >
      <ModalOverlay />
      <ModalContent as="form" onSubmit={save} mx={3}>
        <ModalHeader>{t(`common.companyAssets.actions.${mode}`)}</ModalHeader>
        <ModalBody>
          <Stack spacing={3}>
            {isOpening ? (
              <Text>
                {t("common.companyAssets.openingHelp", { date: trackingDate })}
              </Text>
            ) : null}
            {isAsset ? (
              <>
                <FormControl isRequired>
                  <FormLabel>{t("common.name")}</FormLabel>
                  <Input
                    value={name}
                    maxLength={200}
                    autoFocus
                    onChange={(event) => setName(event.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>{t("common.companyAssets.condition")}</FormLabel>
                  <Select
                    value={condition}
                    onChange={(event) =>
                      setCondition(
                        event.target.value === "USED" ? "USED" : "NEW"
                      )
                    }
                  >
                    <option value="NEW">
                      {t("common.companyAssets.conditions.NEW")}
                    </option>
                    <option value="USED">
                      {t("common.companyAssets.conditions.USED")}
                    </option>
                  </Select>
                </FormControl>
              </>
            ) : null}
            {isReceipt ? (
              <FormControl>
                <FormLabel>{t("common.companyAssets.reason")}</FormLabel>
                <Select
                  value={kind}
                  onChange={(event) =>
                    setKind(event.target.value === "REFUND" ? "REFUND" : "SALE")
                  }
                >
                  <option value="SALE">
                    {t("common.companyAssets.kinds.SALE")}
                  </option>
                  <option value="REFUND">
                    {t("common.companyAssets.kinds.REFUND")}
                  </option>
                </Select>
              </FormControl>
            ) : null}
            {!isOpening ? (
              <>
                <FormControl isRequired={!isAsset}>
                  <FormLabel>{t("common.companyAssets.description")}</FormLabel>
                  <Textarea
                    value={description}
                    maxLength={2000}
                    rows={2}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>
                    {t(
                      isAsset
                        ? "common.companyAssets.acquiredOn"
                        : "common.supply.documentDate"
                    )}
                  </FormLabel>
                  <Input
                    type="date"
                    value={date}
                    max={today()}
                    min={affectsCash ? trackingDate : undefined}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </FormControl>
              </>
            ) : null}
            <FormControl isRequired>
              <FormLabel>
                {t(
                  isAsset
                    ? "common.companyAssets.purchasePrice"
                    : "common.companyAssets.amount"
                )}
              </FormLabel>
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </FormControl>
            {!isOpening ? (
              <Checkbox
                isChecked={affectsCash}
                onChange={(event) => setAffectsCash(event.target.checked)}
              >
                {t(`common.companyAssets.${direction}`)}
              </Checkbox>
            ) : null}
            {isAsset && affectsCash ? (
              <Text fontSize="sm">
                {t("common.companyAssets.existingHelp")}
              </Text>
            ) : null}
            {error ? (
              <Alert status="error">{t(`common.companyAssets.${error}`)}</Alert>
            ) : null}
          </Stack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose} isDisabled={isSaving}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" colorScheme="teal" isLoading={isSaving}>
            {t("common.save")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
