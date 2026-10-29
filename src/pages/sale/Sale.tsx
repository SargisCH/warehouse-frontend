import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch, Route } from "react-router-dom";
import SaleList from "./SaleList";
import UpsertSale from "./UpsertSale";

export default function Sale() {
  const match = useRouteMatch();

  return (
    <Box>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <SaleList />
        </Route>
        <Route path={`${match.path}/upsert/:saleId`}>
          <UpsertSale />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertSale />
        </Route>
      </Switch>
    </Box>
  );
}
