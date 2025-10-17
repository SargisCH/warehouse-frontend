import { Box } from "@chakra-ui/react";
import { t } from "i18next";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import WarehouseList from "./WarehouseList";
import UpsertWarehouse from "./UpsertWarehouse";

export default function Warehouse() {
  const match = useRouteMatch();
  return (
    <Box>
      <h1>{t("common.warehouse.warehouse")}</h1>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <WarehouseList />
        </Route>
        <Route path={`${match.path}/upsert/:warehouseId`}>
          <UpsertWarehouse create={false} />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertWarehouse create={true} />
        </Route>
      </Switch>
    </Box>
  );
}
