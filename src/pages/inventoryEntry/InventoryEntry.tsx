import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import InventoryEntryList from "./InventoryEntryList";
import UpsertInventoryEntry from "./UpsertInventoryEntry";

export default function Inventory() {
  const match = useRouteMatch();

  return (
    <Box>
      <h1>Inventory</h1>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <InventoryEntryList />
        </Route>
        <Route path={`${match.path}/upsert/:inventoryId`}>
          <UpsertInventoryEntry create={false} />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertInventoryEntry create={true} />
        </Route>
      </Switch>
    </Box>
  );
}
