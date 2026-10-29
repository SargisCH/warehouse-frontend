import { Flex } from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useGetManagerStockReportQuery } from "api/report";
import { useGetManagersQuery } from "api/manager";
import { useGetProductGroupQuery } from "api/productGroup";
import { DataGrid } from "components/documents/DataGrid";
import { OptionSelect } from "components/documents/OptionSelect";
import { ReportCard } from "./ReportCard";

// «Ըստ մենեջերի ապրանքի մնացորդ»: what each deliverer's van holds.
export default function ManagerStockReport() {
  const { t } = useTranslation();
  const [managerId, setManagerId] = useState("");
  const [productGroupId, setProductGroupId] = useState("");
  const { data } = useGetManagerStockReportQuery({ managerId, productGroupId });
  const { data: managers = [] } = useGetManagersQuery();
  const { data: productGroups = [] } = useGetProductGroupQuery();

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
            onChange={setManagerId}
          />
          <OptionSelect
            label={t("common.report.productGroup")}
            options={productGroups.map((g) => ({
              label: g.name,
              value: String(g.id),
            }))}
            value={productGroupId}
            onChange={setProductGroupId}
          />
        </Flex>
      }
    >
      <DataGrid
        columns={[
          { id: "managerCode", label: t("common.manager.code") },
          { id: "managerName", label: t("common.sale.deliverer") },
          { id: "productCode", label: t("common.sale.productCode") },
          { id: "productName", label: t("common.sale.productName") },
          { id: "unitName", label: t("common.unit") },
          {
            id: "quantity",
            label: t("common.report.remaining"),
            format: "quantity",
          },
        ]}
        rows={data?.rows ?? []}
        rowKey={(row: any) => `${row.managerId}-${row.productId}`}
        totals={data?.totals}
        emptyText={t("common.report.noData")}
      />
    </ReportCard>
  );
}
