import {
  Button,
  Checkbox,
  Flex,
  Input,
  Radio,
  RadioGroup,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { useGetSalesComparisonMutation } from "api/report";
import AlertDialog from "components/alertDialog/AlertDialog";
import { DataGrid, GridColumn } from "components/documents/DataGrid";
import { today } from "helpers/money";
import {
  GROUP_DIMENSIONS,
  GroupDimension,
  Measure,
  SalesReportFilters,
} from "types";
import { ReportCard } from "./ReportCard";
import { SalesReportFilterPanel } from "./SalesReportFilterPanel";

type Period = { from: string; to: string };

const MEASURES: Measure[] = ["quantity", "amount"];

/**
 * «Վաճառքների համեմատական»: sales broken down by the chosen dimensions, side
 * by side for up to three periods. Returns count against the sales.
 */
export default function SalesComparison() {
  const { t } = useTranslation();
  const [periods, setPeriods] = useState<Period[]>([
    { from: dayjs().startOf("month").format("YYYY-MM-DD"), to: today() },
    { from: "", to: "" },
    { from: "", to: "" },
  ]);
  const [filters, setFilters] = useState<SalesReportFilters>({});
  const [groupBy, setGroupBy] = useState<GroupDimension[]>([
    "product",
    "manager",
  ]);
  const [measures, setMeasures] = useState<Measure[]>(["amount"]);
  const [includeZeroRows, setIncludeZeroRows] = useState(false);
  // «Տողել ըստ» and «Կոմպլեկտներն ըստ բաղադրիչների»
  const [sortBy, setSortBy] = useState<"label" | "value">("label");
  const [explodeKits, setExplodeKits] = useState(false);
  const [error, setError] = useState("");
  const [run, { data, isLoading }] = useGetSalesComparisonMutation();

  const toggle = <T,>(list: T[], item: T) =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const submit = async () => {
    const chosen = periods.filter((p) => p.from && p.to);
    if (!chosen.length || !groupBy.length || !measures.length) {
      setError(t("common.report.comparisonIncomplete"));
      return;
    }
    const res: any = await run({
      ...filters,
      periods: chosen,
      groupBy,
      measures,
      includeZeroRows,
      sortBy,
      explodeKits,
    });
    if (res?.error)
      setError(res.error?.data?.message?.toString() || "Request failed");
  };

  // One label column per dimension, then a value column per period × measure.
  const columns: GridColumn<any>[] = data
    ? [
        ...data.groupBy.map((dimension) => ({
          id: `${dimension}Name`,
          label: t(`common.report.dimensions.${dimension}`),
        })),
        ...data.periods.flatMap((period, index) =>
          data.measures.map((measure) => ({
            id: `${measure}${index + 1}`,
            label: `${dayjs(period.from).format("DD/MM/YY")}–${dayjs(
              period.to,
            ).format("DD/MM/YY")} ${t(`common.report.measures.${measure}`)}`,
            format:
              measure === "quantity"
                ? ("quantity" as const)
                : ("money" as const),
          })),
        ),
      ]
    : [];

  return (
    <ReportCard
      title={t("common.report.salesComparison")}
      actions={
        <Button colorScheme="teal" isLoading={isLoading} onClick={submit}>
          {t("common.report.run")}
        </Button>
      }
      filters={
        <Tabs size="sm" variant="enclosed">
          <TabList>
            <Tab>{t("common.report.general")}</Tab>
            <Tab>{t("common.report.groupAndShow")}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px="0">
              <Flex direction="column" gap="8px" mb="12px">
                {periods.map((period, index) => (
                  <Flex key={index} gap="10px" align="center">
                    <Text fontSize="sm" width="130px">
                      {t("common.report.period", { n: index + 1 })}
                    </Text>
                    <Input
                      size="sm"
                      type="date"
                      width="160px"
                      value={period.from}
                      onChange={(e) =>
                        setPeriods((current) =>
                          current.map((p, i) =>
                            i === index ? { ...p, from: e.target.value } : p,
                          ),
                        )
                      }
                    />
                    <Input
                      size="sm"
                      type="date"
                      width="160px"
                      value={period.to}
                      onChange={(e) =>
                        setPeriods((current) =>
                          current.map((p, i) =>
                            i === index ? { ...p, to: e.target.value } : p,
                          ),
                        )
                      }
                    />
                  </Flex>
                ))}
              </Flex>
              <SalesReportFilterPanel value={filters} onChange={setFilters} />
            </TabPanel>
            <TabPanel px="0">
              <Flex gap="48px" wrap="wrap">
                <Flex direction="column" gap="6px">
                  <Text fontWeight="700" fontSize="sm">
                    {t("common.report.groupBy")}
                  </Text>
                  {GROUP_DIMENSIONS.map((dimension) => (
                    <Checkbox
                      key={dimension}
                      isChecked={groupBy.includes(dimension)}
                      onChange={() =>
                        setGroupBy((current) => toggle(current, dimension))
                      }
                    >
                      {t(`common.report.dimensions.${dimension}`)}
                    </Checkbox>
                  ))}
                </Flex>
                <Flex direction="column" gap="6px">
                  <Text fontWeight="700" fontSize="sm">
                    {t("common.report.show")}
                  </Text>
                  {MEASURES.map((measure) => (
                    <Checkbox
                      key={measure}
                      isChecked={measures.includes(measure)}
                      onChange={() =>
                        setMeasures((current) => toggle(current, measure))
                      }
                    >
                      {t(`common.report.measures.${measure}`)}
                    </Checkbox>
                  ))}
                  <Checkbox
                    mt="12px"
                    isChecked={includeZeroRows}
                    onChange={(e) => setIncludeZeroRows(e.target.checked)}
                  >
                    {t("common.report.includeZeroRows")}
                  </Checkbox>
                  <Checkbox
                    isChecked={explodeKits}
                    onChange={(e) => setExplodeKits(e.target.checked)}
                  >
                    {t("common.report.explodeKits")}
                  </Checkbox>
                  <Text fontWeight="700" fontSize="sm" mt="12px">
                    {t("common.report.sortBy")}
                  </Text>
                  <RadioGroup
                    value={sortBy}
                    onChange={(v) => setSortBy(v as "label" | "value")}
                  >
                    <Flex direction="column" gap="4px">
                      <Radio value="label">
                        {t("common.report.sortByLabel")}
                      </Radio>
                      <Radio value="value">
                        {t("common.report.sortByValue")}
                      </Radio>
                    </Flex>
                  </RadioGroup>
                </Flex>
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      }
    >
      <DataGrid
        columns={columns}
        rows={data?.rows ?? []}
        rowKey={(_, index) => index}
        totals={data?.totals}
        emptyText={t("common.report.noData")}
      />
      {error ? (
        <AlertDialog
          oneButton
          isOpen={Boolean(error)}
          onClose={() => setError("")}
          handleConfirm={() => setError("")}
          headerText="Warning"
          bodyText={error}
          confirmText="OK"
        />
      ) : null}
    </ReportCard>
  );
}
