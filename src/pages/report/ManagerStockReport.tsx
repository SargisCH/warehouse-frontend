import { Button, Checkbox, Flex, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import {
  ManagerStockReportRow,
  useGetManagerStockReportQuery,
} from "api/report";
import { useGetManagersQuery } from "api/manager";
import { useGetProductGroupQuery } from "api/productGroup";
import { DataGrid, GridColumn } from "components/documents/DataGrid";
import { OptionSelect } from "components/documents/OptionSelect";
import { RootState } from "store/store";
import { Role } from "types";
import { ReportCard } from "./ReportCard";
import { ReturnManagerStockDialog } from "./ReturnManagerStockDialog";

const rowKey = (row: ManagerStockReportRow) =>
  `${row.managerId}-${row.productId}`;

export default function ManagerStockReport() {
  const { t } = useTranslation();
  const toast = useToast();
  const canReturn =
    useSelector((state: RootState) => state.user.role) === Role.ADMIN;
  const [managerId, setManagerId] = useState("");
  const [productGroupId, setProductGroupId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [review, setReview] = useState<ManagerStockReportRow[]>([]);
  const {
    currentData: data,
    isFetching,
    refetch,
  } = useGetManagerStockReportQuery(
    { managerId, productGroupId },
    { refetchOnMountOrArgChange: true },
  );
  const { data: managers = [] } = useGetManagersQuery();
  const { data: productGroups = [] } = useGetProductGroupQuery();

  const rows = data?.rows ?? [];
  const availableRows = rows.filter((row) => Number(row.quantity) > 0);
  const selectedRows = availableRows.filter((row) =>
    selected.includes(rowKey(row)),
  );
  const availableManagers = new Set(availableRows.map((row) => row.managerId));
  const sourceId =
    selectedRows[0]?.managerId ??
    (availableManagers.size === 1 ? availableRows[0]?.managerId : undefined);
  const selectable = availableRows.filter((row) => row.managerId === sourceId);
  const allSelected =
    selectable.length > 0 && selectable.length === selectedRows.length;

  const productColumns: GridColumn<ManagerStockReportRow>[] = [
    { id: "productCode", label: t("common.sale.productCode") },
    { id: "productName", label: t("common.sale.productName") },
    { id: "unitName", label: t("common.unit") },
    {
      id: "quantity",
      label: t("common.report.remaining"),
      format: "quantity",
    },
  ];

  const columns: GridColumn<ManagerStockReportRow>[] = [
    { id: "managerCode", label: t("common.manager.code") },
    { id: "managerName", label: t("common.sale.deliverer") },
    ...productColumns,
  ];
  if (canReturn) {
    columns.unshift({
      id: "selected",
      label: t("common.report.selectReturnProducts"),
      render: (row) => (
        <Checkbox
          aria-label={
            row.productName ?? row.productCode ?? String(row.productId)
          }
          isChecked={selected.includes(rowKey(row)) && Number(row.quantity) > 0}
          isDisabled={
            isFetching ||
            Number(row.quantity) <= 0 ||
            (selectedRows.length > 0 && row.managerId !== sourceId)
          }
          onChange={(event) =>
            setSelected(
              event.target.checked
                ? [...selectedRows.map(rowKey), rowKey(row)]
                : selected.filter((key) => key !== rowKey(row)),
            )
          }
        />
      ),
    });
  }

  return (
    <ReportCard
      title={t("common.report.managerStock")}
      filters={
        <Flex gap="12px" align="flex-end" wrap="wrap">
          <OptionSelect
            label={t("common.sale.deliverer")}
            options={managers.map((m) => ({
              label: `${m.code} — ${m.name}`,
              value: String(m.id),
            }))}
            value={managerId}
            onChange={(value) => {
              setManagerId(value);
              setSelected([]);
            }}
          />
          <OptionSelect
            label={t("common.report.productGroup")}
            options={productGroups.map((g) => ({
              label: g.name,
              value: String(g.id),
            }))}
            value={productGroupId}
            onChange={(value) => {
              setProductGroupId(value);
              setSelected([]);
            }}
          />
          {canReturn && (
            <Flex gap="12px" align="center" wrap="wrap">
              <Checkbox
                isChecked={allSelected}
                isIndeterminate={selectedRows.length > 0 && !allSelected}
                isDisabled={!selectable.length || isFetching}
                onChange={(event) =>
                  setSelected(
                    event.target.checked ? selectable.map(rowKey) : [],
                  )
                }
              >
                {t("common.report.selectAllReturnProducts")}
              </Checkbox>
              <Button
                colorScheme="teal"
                isDisabled={!selectedRows.length || isFetching}
                onClick={() => setReview(selectedRows)}
              >
                {t("common.report.returnProducts")}
              </Button>
            </Flex>
          )}
        </Flex>
      }
    >
      <DataGrid
        columns={columns}
        rows={rows}
        rowKey={rowKey}
        totals={data?.totals}
        emptyText={t("common.report.noData")}
      />
      {review.length > 0 && (
        <ReturnManagerStockDialog
          manager={review[0]}
          rows={review}
          columns={productColumns}
          onClose={() => setReview([])}
          onStockChanged={() => {
            setSelected([]);
            void refetch();
          }}
          onSaved={() => {
            setReview([]);
            setSelected([]);
            toast({
              title: t("common.report.returnProductsSaved"),
              status: "success",
            });
          }}
        />
      )}
    </ReportCard>
  );
}
