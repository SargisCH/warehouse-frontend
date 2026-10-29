import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import * as React from "react";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { SaleFilters, useGetSalesQuery, usePaySaleMutation } from "api/sale";
import { useGetClientQuery } from "api/client";
import { useGetClientGroupsQuery } from "api/clientGroup";
import { useGetDocumentQuery } from "api/document";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useGetManagersQuery, useGetDeliverersQuery } from "api/manager";
import { useGetSalesZonesQuery } from "api/salesZone";
import Card from "components/card/Card";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import {
  ColumnOption,
  ColumnPicker,
  useColumnLayout,
} from "components/table/ColumnPicker";
import { PAYMENT_TYPES, Sale } from "types";
import { links } from "routes";

let searchTimeoutId: ReturnType<typeof setTimeout>;

type Props = {
  // «Վաճառքի վերադարձ» reuses this screen with the same filters.
  isReturn?: boolean;
};

const formatMoney = (value?: string | null) =>
  value === undefined || value === null
    ? "—"
    : Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

function SaleList({ isReturn = false }: Props) {
  const { t } = useTranslation();
  const history = useHistory();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<SaleFilters>({});

  const { data: managers = [] } = useGetManagersQuery();
  const { data: salesZones = [] } = useGetSalesZonesQuery();
  const { data: deliverers = [] } = useGetDeliverersQuery();

  const { data, refetch } = useGetSalesQuery({ ...filters, isReturn });
  const rows = data?.rows ?? [];
  const totals = data?.totals;

  const setFilter = (key: keyof SaleFilters, value: any) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const handleSearchTermChange = (e: any) => {
    setSearchTerm(e.target.value);
    clearTimeout(searchTimeoutId);
    searchTimeoutId = setTimeout(
      () => setFilter("searchTerm", e.target.value),
      500,
    );
  };

  const option = (label: string, value: string) => ({ label, value });
  const managerOptions = managers.map((m) =>
    option(`${m.code} — ${m.name}`, String(m.id)),
  );
  const zoneOptions = salesZones.map((z) =>
    option(`${z.code} — ${z.name}`, String(z.id)),
  );
  const delivererOptions = deliverers.map((d) =>
    option(`${d.code} — ${d.name}`, String(d.id)),
  );
  const paymentOptions = PAYMENT_TYPES.map((type) =>
    option(t(`common.sale.paymentTypes.${type}`), type),
  );

  // Every column the grid can show. The picker decides which of them do.
  const columnOptions: ColumnOption[] = useMemo(
    () => [
      { id: "code", label: t("common.sale.code") },
      { id: "documentDate", label: t("common.sale.documentDate") },
      { id: "clientName", label: t("common.sale.client") },
      { id: "clientCode", label: t("common.sale.clientCode") },
      { id: "managerName", label: t("common.sale.manager") },
      { id: "salesZoneName", label: t("common.sale.salesZone") },
      { id: "clientSalesZoneName", label: t("common.sale.clientSalesZone") },
      { id: "clientAddress", label: t("common.sale.location") },
      { id: "delivererName", label: t("common.sale.deliverer") },
      { id: "priceListName", label: t("common.sale.priceList") },
      { id: "documentName", label: t("common.sale.documentGroup") },
      { id: "clientGroupName", label: t("common.payment.clientGroup") },
      { id: "paymentType", label: t("common.sale.paymentType") },
      { id: "totalAmount", label: t("common.sale.totalAmount") },
      { id: "paidAmount", label: t("common.sale.paidAmount") },
      { id: "outstanding", label: t("common.sale.outstanding") },
      { id: "externalStatus", label: t("common.sale.externalStatus") },
    ],
    [t],
  );

  const layout = useColumnLayout(
    isReturn ? "sale-return-columns" : "sale-columns",
    columnOptions,
  );

  const { data: clients = [] } = useGetClientQuery();
  const { data: clientGroups = [] } = useGetClientGroupsQuery();
  const { data: documents = [] } = useGetDocumentQuery();
  const clientOptions = clients.map((c) =>
    option(`${c.code} — ${c.name}`, String(c.id)),
  );
  const clientGroupOptions = clientGroups.map((g) =>
    option(g.name, String(g.id)),
  );
  const documentOptions = documents.map((d: any) =>
    option(d.name, String(d.id)),
  );

  const [payTarget, setPayTarget] = useState<Sale | null>(null);
  const [error, setError] = useState("");
  const [paySale] = usePaySaleMutation();

  // «Ֆիլտերների սյուներ, ավելացնել ֆիլտերներն կամ հանել» - the filters are
  // chosen and ordered the same way the columns are.
  const filterOptions: ColumnOption[] = useMemo(
    () => [
      { id: "searchTerm", label: t("common.searchTerm") },
      { id: "dateFrom", label: t("common.sale.dateFrom") },
      { id: "dateTo", label: t("common.sale.dateTo") },
      { id: "clientGroupId", label: t("common.payment.clientGroup") },
      { id: "clientId", label: t("common.sale.client") },
      { id: "clientSalesZoneId", label: t("common.sale.clientSalesZone") },
      { id: "managerId", label: t("common.sale.manager") },
      { id: "salesZoneId", label: t("common.sale.salesZone") },
      { id: "location", label: t("common.sale.location") },
      { id: "delivererId", label: t("common.sale.deliverer") },
      { id: "paymentType", label: t("common.sale.paymentType") },
      { id: "documentId", label: t("common.sale.documentGroup") },
      { id: "onlyWithBalance", label: t("common.sale.onlyWithBalance") },
      { id: "externalStatus", label: t("common.sale.externalStatus") },
    ],
    [t],
  );
  const filterLayout = useColumnLayout(
    isReturn ? "sale-return-filters" : "sale-filters",
    filterOptions,
  );

  const selectFilter = (
    key: keyof SaleFilters,
    placeholder: string,
    options: Array<{ label: string; value: string }>,
  ) => (
    <Box width="200px">
      <Select
        isClearable
        placeholder={placeholder}
        options={options}
        value={options.find((o) => o.value === filters[key]) ?? null}
        onChange={(v) => setFilter(key, v?.value ?? "")}
      />
    </Box>
  );

  const filterFor = (filterId: string) => {
    switch (filterId) {
      case "searchTerm":
        return (
          <Box width="180px">
            <Input
              size="sm"
              placeholder={t("common.searchTerm")}
              value={searchTerm}
              onChange={handleSearchTermChange}
            />
          </Box>
        );
      case "dateFrom":
      case "dateTo":
        return (
          <Box width="150px">
            <Input
              size="sm"
              type="date"
              aria-label={t(`common.sale.${filterId}`)}
              value={filters[filterId] ?? ""}
              onChange={(e) => setFilter(filterId, e.target.value)}
            />
          </Box>
        );
      case "clientGroupId":
        return selectFilter(
          "clientGroupId",
          t("common.payment.clientGroup"),
          clientGroupOptions,
        );
      case "clientId":
        return selectFilter("clientId", t("common.sale.client"), clientOptions);
      case "clientSalesZoneId":
        return selectFilter(
          "clientSalesZoneId",
          t("common.sale.clientSalesZone"),
          zoneOptions,
        );
      case "managerId":
        return selectFilter(
          "managerId",
          t("common.sale.manager"),
          managerOptions,
        );
      case "salesZoneId":
        return selectFilter(
          "salesZoneId",
          t("common.sale.salesZone"),
          zoneOptions,
        );
      case "delivererId":
        return selectFilter(
          "delivererId",
          t("common.sale.deliverer"),
          delivererOptions,
        );
      case "paymentType":
        return selectFilter(
          "paymentType",
          t("common.sale.paymentType"),
          paymentOptions,
        );
      case "documentId":
        return selectFilter(
          "documentId",
          t("common.sale.documentGroup"),
          documentOptions,
        );
      case "location":
      case "externalStatus":
        return (
          <Box width="180px">
            <Input
              size="sm"
              placeholder={t(`common.sale.${filterId}`)}
              value={filters[filterId] ?? ""}
              onChange={(e) => setFilter(filterId, e.target.value)}
            />
          </Box>
        );
      case "onlyWithBalance":
        return (
          <Flex align="center">
            <Checkbox
              isChecked={Boolean(filters.onlyWithBalance)}
              onChange={(e) => setFilter("onlyWithBalance", e.target.checked)}
            >
              <Text fontSize="sm">{t("common.sale.onlyWithBalance")}</Text>
            </Checkbox>
          </Flex>
        );
      default:
        return null;
    }
  };

  const cellFor = (sale: Sale, columnId: string) => {
    switch (columnId) {
      case "documentDate":
        return sale.documentDate
          ? dayjs(sale.documentDate).format("DD/MM/YYYY")
          : "—";
      case "paymentType":
        return t(`common.sale.paymentTypes.${sale.paymentType}`, {
          defaultValue: sale.paymentType,
        });
      case "totalAmount":
        return formatMoney(sale.totalAmount);
      case "paidAmount":
        return formatMoney(sale.settledAmount ?? sale.paidAmount);
      case "outstanding":
        return formatMoney(sale.outstanding);
      default:
        return (sale as any)[columnId] || "—";
    }
  };

  return (
    <Card
      flexDirection="column"
      w="100%"
      px="0px"
      overflowX={{ sm: "scroll", lg: "hidden" }}
      minHeight="500px"
      position={"static"}
    >
      <Box px="25px" mb="8px">
        <Flex justifyContent="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            {isReturn ? t("common.sale.returnList") : t("common.sale.saleList")}
          </Text>
          <Flex gap="10px" align="center">
            <ColumnPicker
              options={filterOptions}
              ordered={filterLayout.ordered}
              visible={filterLayout.visible}
              onToggle={filterLayout.toggle}
              onMove={filterLayout.move}
              onReset={filterLayout.reset}
              buttonLabel={t("common.sale.filters")}
              title={t("common.sale.editFilters")}
            />
            <ColumnPicker
              options={columnOptions}
              ordered={layout.ordered}
              visible={layout.visible}
              onToggle={layout.toggle}
              onMove={layout.move}
              onReset={layout.reset}
            />
            <TableAddButton
              label={
                isReturn ? t("common.sale.addReturn") : t("common.sale.addSale")
              }
              link={isReturn ? links.createSaleReturn : links.createSale}
            />
          </Flex>
        </Flex>

        <Flex marginTop="20px" gap="10px" wrap="wrap" align="center">
          {filterLayout.visible.map((filterId) => (
            <React.Fragment key={filterId}>
              {filterFor(filterId)}
            </React.Fragment>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setFilters({});
              setSearchTerm("");
              refetch();
            }}
          >
            {t("common.sale.clearFilters")}
          </Button>
        </Flex>
      </Box>

      <Box>
        <Table variant="simple" color="gray.500" mb="12px" mt="12px">
          <Thead>
            <Tr>
              {layout.visible.map((columnId) => (
                <Th key={columnId} pe="10px" borderColor={borderColor}>
                  <Text fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
                    {columnOptions
                      .find((o) => o.id === columnId)
                      ?.label.toUpperCase()}
                  </Text>
                </Th>
              ))}
              <Th borderColor={borderColor} />
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((sale) => (
              <Tr
                key={sale.id}
                cursor="pointer"
                onClick={() =>
                  history.push(
                    isReturn
                      ? links.saleReturn(sale.id)
                      : links.saleItem(sale.id),
                  )
                }
              >
                {layout.visible.map((columnId) => (
                  <Td
                    key={columnId}
                    fontSize={{ sm: "14px" }}
                    borderColor="transparent"
                  >
                    <Text color={textColor} fontSize="sm" fontWeight="700">
                      {cellFor(sale, columnId)}
                    </Text>
                  </Td>
                ))}
                {/* «Տաբլում կնոպկեք»: Պատճենել, Կատարել վճարում */}
                <Td
                  borderColor="transparent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Flex gap="6px">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() =>
                        history.push(
                          `${
                            isReturn ? links.createSaleReturn : links.createSale
                          }?copyFrom=${sale.id}`,
                        )
                      }
                    >
                      {t("common.sale.copy")}
                    </Button>
                    {!isReturn && Number(sale.outstanding) > 0 ? (
                      <Button
                        size="xs"
                        colorScheme="blue"
                        onClick={() => setPayTarget(sale)}
                      >
                        {t("common.sale.pay")}
                      </Button>
                    ) : null}
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {totals ? (
        <Flex px="25px" gap="24px" pb="16px">
          <Badge colorScheme="gray">
            {t("common.sale.rowCount", { count: totals.count })}
          </Badge>
          <Text fontSize="sm" color={textColor} fontWeight="700">
            {t("common.sale.totalAmount")}: {formatMoney(totals.totalAmount)}
          </Text>
          <Text fontSize="sm" color={textColor} fontWeight="700">
            {t("common.sale.outstanding")}: {formatMoney(totals.outstanding)}
          </Text>
        </Flex>
      ) : null}
      {payTarget ? (
        <AlertDialog
          isOpen={Boolean(payTarget)}
          onClose={() => setPayTarget(null)}
          headerText={t("common.sale.pay")}
          bodyText={t("common.sale.payConfirmation", {
            code: payTarget.code,
            amount: formatMoney(payTarget.outstanding),
          })}
          handleConfirm={async () => {
            const res: any = await paySale({ saleId: payTarget.id });
            setPayTarget(null);
            if (res?.error) {
              setError(res.error?.data?.message || "Request failed");
              return;
            }
            refetch();
          }}
        />
      ) : null}
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
    </Card>
  );
}

export default SaleList;
