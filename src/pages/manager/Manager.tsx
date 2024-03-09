import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import ManagerList from "./ManagerList";
import UpsertManager from "./UpsertManager";

export default function Manager() {
  const match = useRouteMatch();

  return (
    <Box>
      <h1>Manager</h1>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <ManagerList />
        </Route>
        <Route path={`${match.path}/upsert/:managerId`}>
          <UpsertManager />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertManager />
        </Route>
      </Switch>
    </Box>
  );
}
