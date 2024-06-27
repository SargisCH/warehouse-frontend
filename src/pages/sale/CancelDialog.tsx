import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useCancelSaleMutation } from "api/client";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

type Props = { isOpen: boolean; onClose: () => void; saleCancelId: number };

export default function CancelDialog({ isOpen, onClose, saleCancelId }: Props) {
  const cancelRef = React.useRef();
  const { t } = useTranslation();
  const [cancelSale, { isLoading, isSuccess }] = useCancelSaleMutation();
  useEffect(() => {
    if (isOpen && isSuccess) {
      onClose();
    }
  }, [onClose, isOpen, isSuccess]);
  return (
    <>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t("common.saleCancelation")}
            </AlertDialogHeader>

            <AlertDialogBody>{t("common.sureToCancelSale")}</AlertDialogBody>

            <AlertDialogFooter>
              <Button isDisabled={isLoading} ref={cancelRef} onClick={onClose}>
                {t("common.close")}
              </Button>
              <Button
                isDisabled={isLoading}
                isLoading={isLoading}
                colorScheme="red"
                onClick={() => {
                  cancelSale({ saleId: saleCancelId });
                }}
                ml={3}
              >
                {t("common.confirm")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
