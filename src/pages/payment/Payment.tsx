import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch, Route } from "react-router-dom";
import PaymentList from "./PaymentList";
import UpsertPayment from "./UpsertPayment";

type Props = {
  // «Վճարում գնորդին» reuses these screens for money paid back out.
  isRefund?: boolean;
};

export default function Payment({ isRefund = false }: Props) {
  const match = useRouteMatch();
  return (
    <Box>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <PaymentList isRefund={isRefund} />
        </Route>
        <Route path={`${match.path}/upsert/:paymentId`}>
          <UpsertPayment isRefund={isRefund} />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertPayment isRefund={isRefund} />
        </Route>
      </Switch>
    </Box>
  );
}

export const Payments = () => <Payment />;
export const Refund = () => <Payment isRefund />;
