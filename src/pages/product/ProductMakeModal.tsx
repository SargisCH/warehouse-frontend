import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
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
import { useMakeProductMutation } from "api/product";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

type Props = { isOpen: boolean; onClose: () => void; productId: number };

export default function ProductMakeModal({
  isOpen,
  onClose,
  productId,
}: Props) {
  const { t } = useTranslation();
  const cancelRef = React.useRef();

  const isMobile = useBreakpointValue({ base: true, md: false });
  const [makeProduct, { isLoading, isSuccess }] = useMakeProductMutation();
  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess, onClose]);
  const { values, setFieldValue, handleSubmit } = useFormik({
    initialValues: {
      amount: 0,
    },
    onSubmit: (values) => {
      makeProduct({ amount: Number(values.amount), id: productId });
    },
  });
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "md"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("common.product.make")}</ModalHeader>
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
                    <NumberInputField placeholder="Amount" />
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
