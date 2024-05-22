import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useDeleteInventoryMutation } from "api/inventory";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

type Props = { isOpen: boolean; onClose: () => void; inventoryId: number };

export default function InventoryDeleteModal({
  isOpen,
  onClose,
  inventoryId,
}: Props) {
  const { t } = useTranslation();
  const [deleteInventory, { isLoading, isSuccess }] =
    useDeleteInventoryMutation();
  useEffect(() => {
    if (isSuccess && isOpen) {
      onClose();
    }
  }, [isSuccess, onClose, isOpen]);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("common.deleteInventory")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{t("common.sureToDelete")}</ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            colorScheme="blue"
            isDisabled={isLoading}
            isLoading={isLoading}
            onClick={() => {
              deleteInventory(inventoryId);
            }}
          >
            {t("common.yes")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
