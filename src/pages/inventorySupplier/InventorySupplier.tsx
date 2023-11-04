import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import InventorySupplierList from "./InventorySupplierList";
import UpsertInventorySupplier from "./UpsertInventorySupplier";

export default function Partner() {
  const match = useRouteMatch();
  return (
    <Box>
      <h1>Inventory Supplier</h1>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <InventorySupplierList />
        </Route>
        <Route path={`${match.path}/upsert/:inventorySupplierId`}>
          <UpsertInventorySupplier create={false} />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertInventorySupplier create={true} />
        </Route>
      </Switch>
    </Box>
  );
}
