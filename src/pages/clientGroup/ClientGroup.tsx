import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import ClientGroupList from "./ClientGroupList";
import UpsertClientGroup from "./UpsertClientGroup";

export default function ClientGroup() {
  const match = useRouteMatch();

  return (
    <Box>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <ClientGroupList />
        </Route>
        <Route path={`${match.path}/upsert/:clientGroupId`}>
          <UpsertClientGroup />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertClientGroup />
        </Route>
      </Switch>
    </Box>
  );
}
