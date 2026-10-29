import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch, Route } from "react-router-dom";
import RepaymentList from "./RepaymentList";
import UpsertRepayment from "./UpsertRepayment";

export default function Repayment() {
  const match = useRouteMatch();
  return (
    <Box>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <RepaymentList />
        </Route>
        <Route path={`${match.path}/upsert/:repaymentId`}>
          <UpsertRepayment />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertRepayment />
        </Route>
      </Switch>
    </Box>
  );
}
