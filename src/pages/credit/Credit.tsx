import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import CreditForm from "./CreditForm";
import CreditList from "./CreditList";

export default function ProductCategory() {
  const match = useRouteMatch();
  return (
    <Box>
      <h1>Credit </h1>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <CreditList />
        </Route>
        <Route path={`${match.path}/upsert/:creditId`}>
          <CreditForm />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <CreditForm />
        </Route>
      </Switch>
    </Box>
  );
}
