import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import SupplyOrderList from "./SupplyOrderList";
import UpsertSupplyOrder from "./UpsertSupplyOrder";

export default function SupplyOrder() {
  const match = useRouteMatch();

  return (
    <Box>
      <h1>Inventory</h1>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <SupplyOrderList />
        </Route>
        <Route
          path={`${match.path}/upsert/:inventorySupplierId/order`}
          exact={true}
        >
          <UpsertSupplyOrder create={true} />
        </Route>
        {/* same component with specifying the supplier durin creating */}
        <Route path={`${match.path}/create-order`} exact={true}>
          <UpsertSupplyOrder create={true} />
        </Route>
        <Route
          path={`${match.path}/upsert/:inventorySupplierId/order/:inventorySupplierOrderId`}
          exact={true}
        >
          <UpsertSupplyOrder create={false} />
        </Route>
      </Switch>
    </Box>
  );
}
