import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import ProductCategoryList from "./ProductCategoryList";
import UpsertProductCategory from "./UpsertProductCategory";

export default function ProductCategory() {
  const match = useRouteMatch();
  return (
    <Box>
      <h1>Inventory Supplier</h1>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <ProductCategoryList />
        </Route>
        <Route path={`${match.path}/upsert/:productCategoryId`}>
          <UpsertProductCategory create={false} />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertProductCategory create={true} />
        </Route>
      </Switch>
    </Box>
  );
}
