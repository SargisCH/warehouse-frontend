import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Spinner,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useUpdateProductAmountMutation } from "api/product";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ReactSelect from "react-select";

type Props = { isOpen: boolean; onClose: () => void; productId: number };

export default function ProductAmountModal({
  isOpen,
  onClose,
  productId,
}: Props) {
  const { t } = useTranslation();
  const unitOptions = [
    { label: "KG", value: "kg" },
    { label: "G", value: "g" },
    { label: t("common.piece"), value: "piece" },
  ];
  const [updateAmount, { isSuccess, isLoading }] =
    useUpdateProductAmountMutation();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { values, setFieldValue, handleSubmit } = useFormik({
    initialValues: {
      amount: 0,
      costPrice: 0,
      amountUnit: "kg",
    },
    onSubmit: (values) => {
      updateAmount({
        amount: Number(values.amount),
        id: productId,
        costPrice: Number(values.costPrice),
        amountUnit: values.amountUnit,
      });
    },
  });
  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess, onClose]);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "md"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("common.declareAmount")}</ModalHeader>
        {isLoading ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Spinner size={"sm"} />
          </Flex>
        ) : (
          <>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleSubmit}>
                <FormControl>
                  <FormLabel>{t("common.amount")}</FormLabel>
                  <NumberInput
                    precision={2}
                    value={values.amount}
                    onChange={(v) => setFieldValue("amount", v)}
                  >
                    <NumberInputField placeholder="Amount" />
                  </NumberInput>
                </FormControl>
                <FormControl mt={"20px"}>
                  <FormLabel>{t("common.product.costPrice")}</FormLabel>
                  <NumberInput
                    value={values.costPrice}
                    onChange={(v) => setFieldValue("costPrice", v)}
                  >
                    <NumberInputField placeholder="Amount" />
                  </NumberInput>
                </FormControl>
                <FormControl mt={"20px"}>
                  <FormLabel>{t("common.unit")}</FormLabel>
                  <ReactSelect
                    options={unitOptions}
                    value={unitOptions.find(
                      (op) => op.value === values.amountUnit,
                    )}
                    onChange={(op) => {
                      setFieldValue("amountUnit", op.value);
                    }}
                  />
                </FormControl>
                <Button mt={"20px"} colorScheme={"teal"} type="submit">
                  {t("common.save")}
                </Button>
              </form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
