import {
  Alert,
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ManagerStockReportRow } from "api/report";
import { useCreateStockTransferMutation } from "api/stockTransfer";
import { useGetWarehouseQuery } from "api/warehouse";
import { DataGrid, GridColumn } from "components/documents/DataGrid";

export function ReturnManagerStockDialog({
  manager,
  rows,
  columns,
  onClose,
  onStockChanged,
  onSaved,
}: {
  manager: ManagerStockReportRow;
  rows: ManagerStockReportRow[];
  columns: GridColumn<ManagerStockReportRow>[];
  onClose: () => void;
  onStockChanged: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [warehouseId, setWarehouseId] = useState("");
  const [error, setError] = useState("");
  const [stockChanged, setStockChanged] = useState(false);
  const submitting = useRef(false);
  const { data: warehouses = [], isError: warehouseError } =
    useGetWarehouseQuery();
  const [createTransfer, { isLoading }] = useCreateStockTransferMutation();

  const save = async () => {
    if (submitting.current || stockChanged || !warehouseId) return;
    submitting.current = true;
    setError("");
    try {
      const result = await createTransfer({
        kind: "RETURN",
        fromManagerId: manager.managerId,
        toWarehouseId: Number(warehouseId),
        requireAvailableStock: true,
        items: rows.map(({ productId, quantity }) => ({ productId, quantity })),
      });
      if ("error" in result) {
        const data =
          result.error && "data" in result.error
            ? (result.error.data as
                | { code?: string; message?: string }
                | undefined)
            : undefined;
        if (data?.code === "INSUFFICIENT_MANAGER_STOCK") {
          setStockChanged(true);
          onStockChanged();
          setError(t("common.report.returnStockChanged"));
        } else {
          setError(data?.message || t("common.transfer.saveError"));
        }
        return;
      }
      onSaved();
    } finally {
      submitting.current = false;
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="xl"
      scrollBehavior="inside"
      closeOnEsc={!isLoading}
      closeOnOverlayClick={!isLoading}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("common.report.returnProducts")}</ModalHeader>
        <ModalBody>
          <Stack spacing={4}>
            <Text>
              {t("common.sale.deliverer")}: {manager.managerName}
            </Text>
            <FormControl isRequired isDisabled={isLoading}>
              <FormLabel>{t("common.transfer.to.warehouse")}</FormLabel>
              <Select
                value={warehouseId}
                onChange={(event) => setWarehouseId(event.target.value)}
              >
                <option value="" />
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            {warehouseError && (
              <Alert status="error">
                {t("common.report.returnWarehouseError")}
              </Alert>
            )}
            {error && <Alert status="error">{error}</Alert>}
            <DataGrid
              columns={columns}
              rows={rows}
              rowKey={(row) => row.productId}
            />
          </Stack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            colorScheme="teal"
            isLoading={isLoading}
            isDisabled={!warehouseId || stockChanged}
            onClick={save}
          >
            {t("common.save")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
