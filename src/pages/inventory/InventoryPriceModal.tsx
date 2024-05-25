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
import { useUpdateAmountMutation } from "api/inventory";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

type Props = { isOpen: boolean; onClose: () => void; inventoryId: number };

export default function InventoryAmountModal({
  isOpen,
  onClose,
  inventoryId,
}: Props) {
  const { t } = useTranslation();
  const [updateAmount, { isSuccess, isLoading }] = useUpdateAmountMutation();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { values, setFieldValue, handleSubmit } = useFormik({
    initialValues: {
      amount: 0,
      avg: 0,
    },
    onSubmit: (values) => {
      updateAmount({
        amount: Number(values.amount),
        id: inventoryId,
        avg: Number(values.avg),
      });
    },
  });
  useEffect(() => {
    if (isSuccess && isOpen) {
      onClose();
    }
  }, [isSuccess, onClose, isOpen]);
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
                    onChange={(v) => {
                      setFieldValue("amount", v);
                    }}
                  >
                    <NumberInputField placeholder="Price" />
                  </NumberInput>
                </FormControl>
                <FormControl mt={"20px"}>
                  <FormLabel>{t("common.average")}</FormLabel>
                  <NumberInput
                    precision={2}
                    value={values.avg}
                    onChange={(v) => {
                      setFieldValue("avg", v);
                    }}
                  >
                    <NumberInputField placeholder="Price" />
                  </NumberInput>
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
