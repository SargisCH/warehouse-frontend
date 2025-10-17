import { Box } from "@chakra-ui/react";
import { t } from "i18next";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import ProductGroupList from "./ProductGroupList";
import UpsertProductGroup from "./UpsertProductGroup";

export default function ProductGroup() {
  const match = useRouteMatch();
  return (
    <Box>
      <h1>{t("common.productGroups.productGroups")}</h1>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <ProductGroupList />
        </Route>
        <Route path={`${match.path}/upsert/:productGroupId`}>
          <UpsertProductGroup create={false} />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertProductGroup create={true} />
        </Route>
      </Switch>
    </Box>
  );
}
