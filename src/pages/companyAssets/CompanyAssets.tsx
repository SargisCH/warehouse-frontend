import {
  Alert,
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  Link,
  Route,
  Switch,
  useHistory,
  useParams,
  useRouteMatch,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AssetEntry,
  useGetCompanyAssetQuery,
  useGetCompanyAssetsQuery,
  useGetCompanyCashQuery,
} from "api/companyAssets";
import { DataGrid, GridColumn } from "components/documents/DataGrid";
import { formatMoney } from "helpers/money";
import { ReportCard } from "../report/ReportCard";
import { AssetForm, AssetFormMode } from "./AssetForm";

function AssetList({
  base,
  trackingDate,
}: {
  base: string;
  trackingDate?: string;
}) {
  const { t } = useTranslation();
  const history = useHistory();
  const [adding, setAdding] = useState(false);
  const { data: assets = [], isLoading, isError } = useGetCompanyAssetsQuery();

  return (
    <>
      <Flex mb={4}>
        <Button colorScheme="teal" onClick={() => setAdding(true)}>
          {t("common.companyAssets.actions.asset")}
        </Button>
      </Flex>
      {isError ? (
        <Alert status="error">{t("common.companyAssets.loadError")}</Alert>
      ) : isLoading ? (
        <Spinner />
      ) : (
        <DataGrid
          columns={[
            {
              id: "name",
              label: t("common.name"),
              render: (asset) => (
                <Button as={Link} variant="link" to={`${base}/${asset.id}`}>
                  {asset.name}
                </Button>
              ),
            },
            {
              id: "condition",
              label: t("common.companyAssets.condition"),
              render: (asset) =>
                t(`common.companyAssets.conditions.${asset.condition}`),
            },
            {
              id: "acquiredOn",
              label: t("common.companyAssets.acquiredOn"),
              format: "date",
            },
            {
              id: "purchasePrice",
              label: t("common.companyAssets.purchasePrice"),
              format: "money",
            },
            {
              id: "status",
              label: t("common.companyAssets.status"),
              render: (asset) =>
                t(
                  asset.sold
                    ? "common.companyAssets.sold"
                    : "common.companyAssets.active"
                ),
            },
          ]}
          rows={assets}
          rowKey={(asset) => asset.id}
          emptyText={t("common.report.noData")}
        />
      )}
      {adding ? (
        <AssetForm
          mode="asset"
          trackingDate={trackingDate}
          onClose={() => setAdding(false)}
          onCreated={(id) => history.push(`${base}/${id}`)}
        />
      ) : null}
    </>
  );
}

function AssetDetails({
  base,
  trackingDate,
}: {
  base: string;
  trackingDate?: string;
}) {
  const { t } = useTranslation();
  const { assetId } = useParams<{ assetId: string }>();
  const [form, setForm] = useState<AssetFormMode>();
  const {
    currentData: asset,
    isLoading,
    isError,
  } = useGetCompanyAssetQuery(assetId);

  if (isLoading) return <Spinner />;
  if (isError || !asset) {
    return (
      <>
        <Button as={Link} to={base} mb={3}>
          {t("common.companyAssets.back")}
        </Button>
        <Alert status="error">{t("common.companyAssets.loadError")}</Alert>
      </>
    );
  }

  const repairs = asset.history.filter((entry) => entry.kind === "REPAIR");
  const receipts = asset.history.filter((entry) => entry.kind !== "REPAIR");
  const sold = receipts.some((entry) => entry.kind === "SALE");
  const columns: GridColumn<AssetEntry>[] = [
    {
      id: "documentDate",
      label: t("common.supply.documentDate"),
      format: "date",
    },
    { id: "description", label: t("common.companyAssets.description") },
    { id: "amount", label: t("common.companyAssets.amount"), format: "money" },
    {
      id: "affectsCash",
      label: t("common.companyAssets.cash"),
      render: (entry) =>
        t(
          entry.affectsCash
            ? "common.companyAssets.cashRecorded"
            : "common.companyAssets.noCashMovement"
        ),
    },
  ];

  return (
    <>
      <Button as={Link} variant="outline" to={base} mb={4}>
        {t("common.companyAssets.back")}
      </Button>
      <Heading as="h2" size="md" mb={2}>
        {asset.name}
      </Heading>
      {asset.description ? (
        <Text whiteSpace="pre-wrap" mb={3}>
          {asset.description}
        </Text>
      ) : null}
      <Flex gap={4} wrap="wrap" mb={4}>
        <Text>{t(`common.companyAssets.conditions.${asset.condition}`)}</Text>
        <Text>
          {t(
            sold ? "common.companyAssets.sold" : "common.companyAssets.active"
          )}
        </Text>
        <Text>
          {t("common.companyAssets.acquiredOn")}: {asset.acquiredOn}
        </Text>
        <Text>
          {t("common.companyAssets.purchasePrice")}:{" "}
          {formatMoney(asset.purchasePrice)}
        </Text>
        <Text>
          {t("common.companyAssets.totalSpent")}:{" "}
          {formatMoney(asset.totalSpent)}
        </Text>
      </Flex>
      {!sold ? (
        <Flex gap={3} wrap="wrap" mb={4}>
          <Button onClick={() => setForm("repair")}>
            {t("common.companyAssets.actions.repair")}
          </Button>
          <Button colorScheme="teal" onClick={() => setForm("receipt")}>
            {t("common.companyAssets.actions.receipt")}
          </Button>
        </Flex>
      ) : null}
      <Heading as="h3" size="sm" mb={2}>
        {t("common.companyAssets.repairs")}
      </Heading>
      <DataGrid
        columns={columns}
        rows={repairs}
        rowKey={(entry) => entry.id}
        emptyText={t("common.report.noData")}
      />
      <Heading as="h3" size="sm" mt={6} mb={2}>
        {t("common.companyAssets.receipts")}
      </Heading>
      <DataGrid
        columns={[
          {
            id: "kind",
            label: t("common.companyAssets.reason"),
            render: (entry) => t(`common.companyAssets.kinds.${entry.kind}`),
          },
          ...columns,
        ]}
        rows={receipts}
        rowKey={(entry) => entry.id}
        emptyText={t("common.report.noData")}
      />
      {form ? (
        <AssetForm
          mode={form}
          assetId={assetId}
          trackingDate={trackingDate}
          onClose={() => setForm(undefined)}
        />
      ) : null}
    </>
  );
}

export default function CompanyAssets() {
  const { t } = useTranslation();
  const match = useRouteMatch();
  const [opening, setOpening] = useState(false);
  const { data: cash, isError } = useGetCompanyCashQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  return (
    <ReportCard
      title={t("common.companyAssets.title")}
      filters={
        isError ? (
          <Alert status="error">{t("common.companyAssets.cashError")}</Alert>
        ) : cash ? (
          cash.opening === null ? (
            <Button size="sm" variant="outline" onClick={() => setOpening(true)}>
              {t("common.companyAssets.actions.opening")}
            </Button>
          ) : undefined
        ) : (
          <Spinner />
        )
      }
    >
      <Box px={3} pb={5}>
        <Switch>
          <Route path={`${match.path}/:assetId`}>
            <AssetDetails base={match.url} trackingDate={cash?.trackingDate} />
          </Route>
          <Route exact path={match.path}>
            <AssetList base={match.url} trackingDate={cash?.trackingDate} />
          </Route>
        </Switch>
      </Box>
      {opening && cash ? (
        <AssetForm
          mode="opening"
          trackingDate={cash.trackingDate}
          onClose={() => setOpening(false)}
        />
      ) : null}
    </ReportCard>
  );
}
