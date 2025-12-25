import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import SupplyList from "./SupplyList";
import UpsertSupply from "./UpsertSupply";
import { useTranslation } from "react-i18next";

export default function Supply() {
  const match = useRouteMatch();
  const { t } = useTranslation();

  return (
    <Box>
      <h1>{t("supply.title")}</h1>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <SupplyList />
        </Route>
        <Route path={`${match.path}/create`} exact={true}>
          <UpsertSupply />
        </Route>
        {/* We are not implementing update for now, only create */}
        {/* <Route path={`${match.path}/edit/:supplyId`}>
          <UpsertSupply />
        </Route> */}
      </Switch>
    </Box>
  );
}
