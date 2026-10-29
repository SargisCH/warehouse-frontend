import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import SalesZoneList from "./SalesZoneList";
import UpsertSalesZone from "./UpsertSalesZone";

export default function SalesZone() {
  const match = useRouteMatch();

  return (
    <Box>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <SalesZoneList />
        </Route>
        <Route path={`${match.path}/upsert/:salesZoneId`}>
          <UpsertSalesZone />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertSalesZone />
        </Route>
      </Switch>
    </Box>
  );
}
