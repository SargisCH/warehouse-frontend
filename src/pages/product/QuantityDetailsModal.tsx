import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { RowObj } from "./column";

type Props = { isOpen: boolean; onClose: () => void; quantityDetails: RowObj };

export default function QuantityDetailsModal({
  isOpen,
  onClose,
  quantityDetails,
}: Props) {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader>{t("common.product.quantityDetails")}</ModalHeader>
      <ModalOverlay />
      <ModalContent>
        <>
          <ModalCloseButton />
          <ModalBody p={12}>
            <VStack>
              {quantityDetails.inventory?.map((detail) => (
                <Flex
                  key={detail.warehouseId}
                  justifyContent={"space-between"}
                  alignItems="center"
                  w="full"
                  borderBottomColor={"black"}
                  borderBottomWidth={"1px"}
                >
                  <span>{detail.warehouseName}</span>
                  <span>
                    {detail.quantity}{" "}
                    {t(`common.units.${quantityDetails.unit.name}`)}
                  </span>
                </Flex>
              ))}
            </VStack>
            <Box mt={4} textAlign="right">
              {t("common.total")}: {quantityDetails.totalStock}{" "}
              {t(`common.units.${quantityDetails.unit.name}`)}
            </Box>
          </ModalBody>
        </>
      </ModalContent>
    </Modal>
  );
}
