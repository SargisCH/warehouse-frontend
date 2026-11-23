import {
  Alert,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import {
  CompanyCashMovement,
  useAddCompanyCashEntryMutation,
} from "api/companyAssets";
import { FormEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export function CashEntryForm({
  original,
  onClose,
}: {
  original?: CompanyCashMovement;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(
    original?.amount.replace(/^-/, "") ?? "",
  );
  const [description, setDescription] = useState(original?.description ?? "");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [addEntry, { isLoading }] = useAddCompanyCashEntryMutation();
  const request = useRef<{ id: string; fingerprint: string }>();
  const saving = useRef(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving.current) return;
    const body = {
      amount: amount.trim().replace(",", "."),
      description: description.trim(),
      comment: comment.trim(),
      returnOf: original?.id,
    };
    if (
      !/^\d{1,12}(\.\d{1,2})?$/.test(body.amount) ||
      Number(body.amount) <= 0
    ) {
      setError("common.companyAssets.invalidAmount");
      return;
    }
    if (!body.description || !body.comment) {
      setError("common.companyCash.missingText");
      return;
    }
    const fingerprint = JSON.stringify(body);
    if (request.current?.fingerprint !== fingerprint) {
      request.current = { fingerprint, id: crypto.randomUUID() };
    }

    setError("");
    saving.current = true;
    try {
      await addEntry({ ...body, id: request.current.id }).unwrap();
      onClose();
    } catch (failure) {
      const message = (failure as { data?: { message?: unknown } }).data
        ?.message;
      const errors: Record<string, string> = {
        COMPANY_CASH_INSUFFICIENT: "insufficient",
        COMPANY_CASH_RETURN_CONFLICT: "returnConflict",
        COMPANY_CASH_WITHDRAWAL_NOT_FOUND: "withdrawalMissing",
      };
      const key = typeof message === "string" ? errors[message] : undefined;
      setError(`common.companyCash.${key ?? "saveError"}`);
    } finally {
      saving.current = false;
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      closeOnOverlayClick={!isLoading}
      closeOnEsc={!isLoading}
    >
      <ModalOverlay />
      <ModalContent as="form" onSubmit={save}>
        <ModalHeader>
          {t(
            original
              ? "common.companyCash.return"
              : "common.companyCash.withdraw",
          )}
        </ModalHeader>
        <ModalCloseButton isDisabled={isLoading} />
        <ModalBody>
          <Stack spacing={4}>
            {error && <Alert status="error">{t(error)}</Alert>}
            <FormControl isRequired isReadOnly={Boolean(original)}>
              <FormLabel>{t("common.companyAssets.amount")} (AMD)</FormLabel>
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>{t("common.companyAssets.description")}</FormLabel>
              <Input
                maxLength={2000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>{t("common.companyCash.comment")}</FormLabel>
              <Textarea
                maxLength={2000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" colorScheme="blue" isLoading={isLoading}>
            {t("common.save")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
