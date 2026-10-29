import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch, Route } from "react-router-dom";
import PriceListList from "./PriceListList";
import UpsertPriceList from "./UpsertPriceList";

export default function PriceList() {
  const match = useRouteMatch();

  return (
    <Box>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <PriceListList />
        </Route>
        <Route path={`${match.path}/upsert/:priceListId`}>
          <UpsertPriceList />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertPriceList />
        </Route>
      </Switch>
    </Box>
  );
}
