import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import TransactionHistoryForm from "./TransactionHistoryForm";
import TransactionHistoryList from "./TransactionHistoryList";

export default function TransactionHistory() {
  const match = useRouteMatch();
  return (
    <Box>
      <h1>Credit </h1>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <TransactionHistoryList />
        </Route>
        <Route path={`${match.path}/upsert/:transactionHistoryId`}>
          <TransactionHistoryForm />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <TransactionHistoryForm />
        </Route>
      </Switch>
    </Box>
  );
}
