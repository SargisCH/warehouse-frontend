import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch, Route } from "react-router-dom";
import SaleList from "./SaleList";
import UpsertSale from "./UpsertSale";

// «Վաճառքի վերադարձ» reuses the sale screens; only the isReturn flag differs.
export default function SaleReturn() {
  const match = useRouteMatch();

  return (
    <Box>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <SaleList isReturn={true} />
        </Route>
        <Route path={`${match.path}/upsert/:saleId`}>
          <UpsertSale />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertSale />
        </Route>
      </Switch>
    </Box>
  );
}
