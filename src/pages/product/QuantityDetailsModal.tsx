import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { formatQuantity } from "helpers/money";
import { useTranslation } from "react-i18next";
import { RowObj } from "./column";

type Props = { isOpen: boolean; onClose: () => void; quantityDetails: RowObj };

export default function QuantityDetailsModal({
  isOpen,
  onClose,
  quantityDetails,
}: Props) {
  const { t } = useTranslation();
  const unit = quantityDetails.unit?.name;
  const unitLabel = unit ? t(`common.units.${unit}`, { defaultValue: unit }) : "";
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {t("common.product.quantityDetails")} · {quantityDetails.name}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack>
            {!quantityDetails.inventory?.length && (
              <Text alignSelf="flex-start">{t("common.product.noWarehouseStock")}</Text>
            )}
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
                  {formatQuantity(detail.quantity)} {unitLabel}
                </span>
              </Flex>
            ))}
          </VStack>
          <Box mt={4} textAlign="right">
            {t("common.total")}: {formatQuantity(quantityDetails.totalStock)} {unitLabel}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
