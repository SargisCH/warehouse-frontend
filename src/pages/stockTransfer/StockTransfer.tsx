import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch, Route } from "react-router-dom";
import { TransferKind } from "types";
import StockTransferList from "./StockTransferList";
import UpsertStockTransfer from "./UpsertStockTransfer";

// One set of screens for the four stock documents; only the ends differ.
function StockTransfer({ kind }: { kind: TransferKind }) {
  const match = useRouteMatch();
  return (
    <Box>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <StockTransferList kind={kind} />
        </Route>
        <Route path={`${match.path}/upsert/:transferId`}>
          <UpsertStockTransfer kind={kind} />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertStockTransfer kind={kind} />
        </Route>
      </Switch>
    </Box>
  );
}

export const WarehouseTransfer = () => <StockTransfer kind="WAREHOUSE" />;
export const DelivererTransfer = () => <StockTransfer kind="DELIVERER" />;
export const DelivererIssue = () => <StockTransfer kind="ISSUE" />;
export const DelivererReturn = () => <StockTransfer kind="RETURN" />;
