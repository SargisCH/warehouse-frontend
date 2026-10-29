import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import ClientList from "./ClientList";
import UpsertClient from "./UpsertClient";

export default function Client() {
  const match = useRouteMatch();

  return (
    <Box>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <ClientList />
        </Route>
        <Route path={`${match.path}/upsert/:clientId`}>
          <UpsertClient />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertClient />
        </Route>
      </Switch>
    </Box>
  );
}
