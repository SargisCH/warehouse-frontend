import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import SupplierList from "./SupplierList";
import UpsertSupplier from "./UpsertSupplier";
import { useTranslation } from "react-i18next";

export default function Supplier() {
  const match = useRouteMatch();
  const { t } = useTranslation();

  return (
    <Box>
      <h1>{t("supplier.title")}</h1>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <SupplierList />
        </Route>
        <Route path={`${match.path}/upsert/:supplierId`}>
          <UpsertSupplier />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertSupplier />
        </Route>
      </Switch>
    </Box>
  );
}
