import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import SaleList from "./SaleList";
import UpsertSale from "./UpsertSale";
import SaleInfo from "./SaleInfo";
import ReturnSale from "./ReturnSale";
import ReturnSaleList from "./ReturnSaleList";

export default function Sale() {
  const match = useRouteMatch();
  return (
    <Box>
      <h1>Sale</h1>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <SaleList />
        </Route>
        <Route exact path={`${match.path}/create/:clientId`}>
          <UpsertSale />
        </Route>
        <Route exact path={`${match.path}/return`}>
          <ReturnSaleList />
        </Route>
        <Route exact path={`${match.path}/return/:saleId`}>
          <ReturnSale />
        </Route>
        <Route path={`${match.path}/info/:saleId`}>
          <SaleInfo />
        </Route>
      </Switch>
    </Box>
  );
}
