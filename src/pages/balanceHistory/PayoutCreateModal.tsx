import { useForm } from "@aws-amplify/ui-react-core";
import {
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { useCreatePayoutMutation, useGetPayoutTypesQuery } from "api/payout";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";

type Props = { isOpen: boolean; onClose: (isCreated?: boolean) => void };

export default function PayoutCreateModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const { data: payoutTypes = [] } = useGetPayoutTypesQuery();
  const [createPayout, { isLoading, isSuccess }] = useCreatePayoutMutation();
  const formik = useFormik({
    initialValues: {
      amount: 0,
      payoutType: {
        label: "",
        value: null,
      },
      otherType: "",
    },
    onSubmit: (values) => {
      createPayout({
        amount: Number(values.amount),
        otherPayoutType: values.otherType,
        type: values.payoutType.value,
      });
    },
  });
  useEffect(() => {
    if (isOpen && isSuccess) onClose(true);
  }, [isSuccess, onClose, isOpen]);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("common.makeNewPayout")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={formik.handleSubmit}>
            <Box>
              <NumberInput
                name="amount"
                value={formik.values.amount}
                onChange={(v) => {
                  formik.setFieldValue("amount", v);
                }}
              >
                <NumberInputField placeholder="Amount" />
              </NumberInput>
            </Box>
            <Box mt={2}>
              <Select
                options={payoutTypes.map(({ name, id }) => ({
                  label: name,
                  value: id,
                }))}
                onChange={(op) => formik.setFieldValue("payoutType", op)}
              />
            </Box>
            {formik.values.payoutType.label === "other" ? (
              <Box mt={2}>
                <Input
                  name="otherTypr"
                  value={formik.values.otherType}
                  onChange={(e) => {
                    formik.setFieldValue("otherType", e.target.value);
                  }}
                />
              </Box>
            ) : null}
            <Box mt={2}>
              <Button
                type="submit"
                isLoading={isLoading}
                isDisabled={isLoading}
                colorScheme="green"
              >
                {t("common.save")}
              </Button>
            </Box>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={() => onClose()}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
