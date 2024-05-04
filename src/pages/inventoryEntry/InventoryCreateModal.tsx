import {
  Box,
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
} from "@chakra-ui/react";
import { useCreateInventoryMutation } from "api/inventory";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  setInventoryId: (index: number, id: number) => void;
  index: number;
};

export default function InventoryCreateModal({
  isOpen,
  onClose,
  setInventoryId,
  index,
}: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const [createInventory, { isLoading, data: dataRes }] =
    useCreateInventoryMutation();
  const saveInventory = async () => {
    const data = {
      name,
      price: Number(price),
    };
    await createInventory(data);
  };
  useEffect(() => {
    if (dataRes?.id && isOpen) {
      onClose();
      setInventoryId(index, dataRes.id);
    }
  }, [dataRes?.id, index, setInventoryId, onClose, isOpen]);
  return (
    <div>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("common.inventory.createNewInventory")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoading ? (
              <Spinner size={"sm"} />
            ) : (
              <Flex direction="column">
                <Flex gap="20px">
                  <Flex direction={"column"} gap="20px">
                    <FormControl>
                      <FormLabel>{t("common.name")}</FormLabel>
                      <Input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </FormControl>
                  </Flex>
                  <Flex gap="20px" direction={"column"}>
                    <FormControl>
                      <FormLabel>{t("common.price")}</FormLabel>
                      <NumberInput value={price} onChange={setPrice}>
                        <NumberInputField placeholder="Price" />
                      </NumberInput>
                    </FormControl>
                  </Flex>
                </Flex>
                <Box mt={5}>
                  <Button colorScheme="teal" onClick={() => saveInventory()}>
                    {t("common.saveAndSelect")}
                  </Button>
                </Box>
              </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
