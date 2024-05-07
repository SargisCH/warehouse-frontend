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
  Spinner,
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
  const { values, setFieldValue, handleSubmit } = useFormik({
    initialValues: {
      amount: 0,
      avg: 0,
    },
    onSubmit: (values) => {
      updateAmount({ amount: values.amount, id: inventoryId, avg: values.avg });
    },
  });
  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess, onClose]);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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
                  <Input
                    value={values.amount}
                    onChange={(e) => {
                      setFieldValue("amount", Number(e.target.value));
                    }}
                  />
                </FormControl>
                <FormControl mt={"20px"}>
                  <FormLabel>{t("common.average")}</FormLabel>
                  <Input
                    value={values.avg}
                    onChange={(e) => {
                      setFieldValue("avg", Number(e.target.value));
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
