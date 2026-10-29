import { Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useGetProductQuery } from "api/product";
import { useGetProductGroupQuery } from "api/productGroup";
import { useGetClientQuery } from "api/client";
import { useGetClientGroupsQuery } from "api/clientGroup";
import { useGetManagersQuery } from "api/manager";
import { useGetSalesZonesQuery } from "api/salesZone";
import { useGetDocumentQuery } from "api/document";
import { OptionSelect } from "components/documents/OptionSelect";
import { PAYMENT_TYPES, SalesReportFilters } from "types";

type Props = {
  value: SalesReportFilters;
  onChange: (value: SalesReportFilters) => void;
};

/** The «Ընդհանուր» tab both sales reports share. Every field takes many. */
export function SalesReportFilterPanel({ value, onChange }: Props) {
  const { t } = useTranslation();
  const { data: productData } = useGetProductQuery(undefined);
  const { data: productGroups = [] } = useGetProductGroupQuery();
  const { data: clients = [] } = useGetClientQuery();
  const { data: clientGroups = [] } = useGetClientGroupsQuery();
  const { data: managers = [] } = useGetManagersQuery();
  const { data: salesZones = [] } = useGetSalesZonesQuery();
  const { data: documents = [] } = useGetDocumentQuery();
  // «Արտադրող» is free text on the product, so the choices are those in use.
  const manufacturerOptions = Array.from(
    new Set(
      (productData?.data ?? [])
        .map((p) => p.manufacturer)
        .filter((m): m is string => Boolean(m)),
    ),
  ).map((m) => ({ label: m, value: m }));

  const ids = (list: number[] | undefined) => (list ?? []).map(String);
  const set = (key: keyof SalesReportFilters) => (picked: string[]) =>
    onChange({ ...value, [key]: picked.map(Number) });

  const managerOptions = managers.map((m) => ({
    label: `${m.code} — ${m.name}`,
    value: String(m.id),
  }));
  const zoneOptions = salesZones.map((z) => ({
    label: z.name,
    value: String(z.id),
  }));

  const fields: Array<{
    key: keyof SalesReportFilters;
    label: string;
    options: { label: string; value: string }[];
  }> = [
    {
      key: "productIds",
      label: t("common.sale.productName"),
      options: (productData?.data ?? []).map((p) => ({
        label: `${p.sku ?? ""} — ${p.name}`,
        value: String(p.id),
      })),
    },
    {
      key: "productGroupIds",
      label: t("common.report.productGroup"),
      options: productGroups.map((g) => ({
        label: g.name,
        value: String(g.id),
      })),
    },
    {
      key: "clientIds",
      label: t("common.sale.client"),
      options: clients.map((c) => ({
        label: `${c.code} — ${c.name}`,
        value: String(c.id),
      })),
    },
    {
      key: "clientGroupIds",
      label: t("common.payment.clientGroup"),
      options: clientGroups.map((g) => ({
        label: g.name,
        value: String(g.id),
      })),
    },
    {
      key: "managerIds",
      label: t("common.sale.manager"),
      options: managerOptions,
    },
    {
      key: "salesZoneIds",
      label: t("common.sale.salesZone"),
      options: zoneOptions,
    },
    {
      key: "clientSalesZoneIds",
      label: t("common.sale.clientSalesZone"),
      options: zoneOptions,
    },
    {
      key: "delivererIds",
      label: t("common.sale.deliverer"),
      options: managerOptions,
    },
    {
      key: "documentIds",
      label: t("common.sale.documentGroup"),
      options: documents.map((d: any) => ({
        label: d.name,
        value: String(d.id),
      })),
    },
  ];

  return (
    <Flex gap="12px" wrap="wrap" align="flex-end">
      {fields.map((field) => (
        <OptionSelect
          key={field.key}
          isMulti
          label={field.label}
          options={field.options}
          value={ids(value[field.key] as number[] | undefined)}
          onChange={set(field.key)}
          width="260px"
        />
      ))}
      <OptionSelect
        isMulti
        label={t("common.sale.paymentType")}
        options={PAYMENT_TYPES.map((type) => ({
          label: t(`common.sale.paymentTypes.${type}`),
          value: type,
        }))}
        value={value.paymentTypes ?? []}
        onChange={(picked: string[]) =>
          onChange({ ...value, paymentTypes: picked })
        }
        width="260px"
      />
      <OptionSelect
        isMulti
        label={t("common.product.manufacturer")}
        options={manufacturerOptions}
        value={value.manufacturers ?? []}
        onChange={(picked: string[]) =>
          onChange({ ...value, manufacturers: picked })
        }
        width="260px"
      />
      <OptionSelect
        isMulti
        label={t("common.report.operation")}
        options={["SALE", "RETURN"].map((op) => ({
          label: t(`common.report.kinds.${op}`),
          value: op,
        }))}
        value={value.operations ?? []}
        onChange={(picked: string[]) =>
          onChange({ ...value, operations: picked })
        }
        width="260px"
      />
      <FormControl width="260px">
        <FormLabel fontSize="sm">{t("common.sale.location")}</FormLabel>
        <Input
          value={value.location ?? ""}
          onChange={(e) => onChange({ ...value, location: e.target.value })}
        />
      </FormControl>
    </Flex>
  );
}
