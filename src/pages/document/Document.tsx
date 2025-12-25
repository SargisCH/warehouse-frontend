import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import DocumentList from "./DocumentList";
import UpsertDocument from "./UpsertDocument";

export default function Document() {
  const match = useRouteMatch();

  return (
    <Box>
      <h1>Document</h1>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <DocumentList />
        </Route>
        <Route path={`${match.path}/upsert/:documentId`}>
          <UpsertDocument />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertDocument />
        </Route>
      </Switch>
    </Box>
  );
}
