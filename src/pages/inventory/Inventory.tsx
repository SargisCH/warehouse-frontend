import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import InventoryList from "./InventoryList";
import UpsertInventory from "./UpsertInventory";

export default function Inventory() {
  const match = useRouteMatch();

  return (
    <Box>
      <h1>Inventory</h1>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <InventoryList />
        </Route>
        <Route path={`${match.path}/upsert/:inventoryId`}>
          <UpsertInventory create={false} />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertInventory create={true} />
        </Route>
      </Switch>
    </Box>
  );
}
