import {
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
  Text,
} from "@chakra-ui/react";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePaySaleMutation } from "api/sale";
import { formatMoney } from "helpers/money";
import { Sale } from "types";

export default function SalePaymentDialog({
  sale,
  onClose,
  onPaid,
}: {
  sale: Sale;
  onClose: () => void;
  onPaid: () => void;
}) {
  const { t } = useTranslation();
  const [paymentType, setPaymentType] = useState<"CASH" | "TRANSFER">(
    sale.paymentType === "TRANSFER" ? "TRANSFER" : "CASH"
  );
  const [collected, setCollected] = useState(true);
  const [amount, setAmount] = useState(String(sale.outstanding ?? ""));
  const [error, setError] = useState("");
  const [pay, { isLoading }] = usePaySaleMutation();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    const result = await pay({
      saleId: sale.id,
      amount: amount.trim().replace(",", "."),
      paymentType,
      cashCollectedByManager: paymentType === "CASH" && collected,
    });
    if ("error" in result) {
      setError(t("common.managerCash.paymentError"));
      return;
    }
    onPaid();
  };

  return (
    <Modal isOpen onClose={onClose} closeOnOverlayClick={!isLoading} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={submit}>
        <ModalHeader>{t("common.sale.pay")}</ModalHeader>
        <ModalBody>
          <Text mb={3}>
            {t("common.sale.outstanding")}: {formatMoney(sale.outstanding)}
          </Text>
          <FormControl isRequired mb={3}>
            <FormLabel>{t("common.managerCash.amount")}</FormLabel>
            <Input
              value={amount}
              inputMode="decimal"
              pattern="[0-9]+([.,][0-9]{1,2})?"
              onChange={(event) => setAmount(event.target.value)}
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>{t("common.sale.paymentType")}</FormLabel>
            <Select
              value={paymentType}
              onChange={(event) =>
                setPaymentType(
                  event.target.value === "TRANSFER" ? "TRANSFER" : "CASH"
                )
              }
            >
              <option value="CASH">{t("common.sale.paymentTypes.CASH")}</option>
              <option value="TRANSFER">
                {t("common.sale.paymentTypes.TRANSFER")}
              </option>
            </Select>
          </FormControl>
          {paymentType === "CASH" ? (
            <Checkbox
              isChecked={collected}
              onChange={(event) => setCollected(event.target.checked)}
            >
              {t("common.managerCash.collectedByManager")}
            </Checkbox>
          ) : null}
          {error ? (
            <Text color="red.500" role="alert">
              {error}
            </Text>
          ) : null}
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button colorScheme="teal" type="submit" isLoading={isLoading}>
            {t("common.save")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
