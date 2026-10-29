import { Button, Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { useLazyGetSalesAnalysisQuery } from "api/report";
import { DataGrid, GridColumn } from "components/documents/DataGrid";
import {
  ColumnOption,
  ColumnPicker,
  useColumnLayout,
} from "components/table/ColumnPicker";
import { today } from "helpers/money";
import { SalesReportFilters } from "types";
import { ReportCard } from "./ReportCard";
import { SalesReportFilterPanel } from "./SalesReportFilterPanel";

/**
 * «Վաճառքների վերլուծություն» - «Ում ինչքանա տվյալ ապրանքից ծախվել». One
 * row per sold line; returns come through with negative quantities.
 */
export default function SalesAnalysis() {
  const { t } = useTranslation();
  const [dateFrom, setDateFrom] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD"),
  );
  const [dateTo, setDateTo] = useState(today());
  const [filters, setFilters] = useState<SalesReportFilters>({});
  const [run, { data, isFetching }] = useLazyGetSalesAnalysisQuery();

  const allColumns: Array<ColumnOption & Partial<GridColumn<any>>> = useMemo(
    () => [
      {
        id: "documentDate",
        label: t("common.sale.documentDate"),
        format: "date",
      },
      { id: "code", label: t("common.sale.code") },
      { id: "productCode", label: t("common.sale.productCode") },
      { id: "productName", label: t("common.sale.productName") },
      { id: "productGroupName", label: t("common.report.productGroup") },
      { id: "unitName", label: t("common.unit") },
      { id: "quantity", label: t("common.sale.quantity"), format: "quantity" },
      { id: "price", label: t("common.sale.price"), format: "money" },
      { id: "amount", label: t("common.sale.amount"), format: "money" },
      { id: "clientCode", label: t("common.sale.clientCode") },
      { id: "clientName", label: t("common.sale.client") },
      { id: "clientGroupName", label: t("common.payment.clientGroup") },
      { id: "clientAddress", label: t("common.sale.location") },
      { id: "managerName", label: t("common.sale.manager") },
      { id: "delivererName", label: t("common.sale.deliverer") },
      { id: "salesZoneName", label: t("common.sale.salesZone") },
      { id: "manufacturer", label: t("common.product.manufacturer") },
      { id: "documentName", label: t("common.sale.documentGroup") },
    ],
    [t],
  );
  const layout = useColumnLayout("report-sales-analysis-columns", allColumns);
  const columns = layout.visible.map(
    (id) => allColumns.find((column) => column.id === id) as GridColumn<any>,
  );

  return (
    <ReportCard
      title={t("common.report.salesAnalysis")}
      actions={
        <ColumnPicker
          options={allColumns}
          ordered={layout.ordered}
          visible={layout.visible}
          onToggle={layout.toggle}
          onMove={layout.move}
          onReset={layout.reset}
        />
      }
      filters={
        <Flex direction="column" gap="12px">
          <Flex gap="12px" align="flex-end">
            <FormControl width="170px">
              <FormLabel fontSize="sm">{t("common.sale.dateFrom")}</FormLabel>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </FormControl>
            <FormControl width="170px">
              <FormLabel fontSize="sm">{t("common.sale.dateTo")}</FormLabel>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </FormControl>
            <Button
              colorScheme="teal"
              isLoading={isFetching}
              onClick={() => run({ ...filters, dateFrom, dateTo })}
            >
              {t("common.report.run")}
            </Button>
          </Flex>
          <SalesReportFilterPanel value={filters} onChange={setFilters} />
        </Flex>
      }
    >
      <DataGrid
        columns={columns}
        rows={data?.rows ?? []}
        rowKey={(_, index) => index}
        totals={data?.totals}
        emptyText={t("common.report.noData")}
      />
    </ReportCard>
  );
}
