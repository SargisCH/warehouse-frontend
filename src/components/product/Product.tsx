import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import ProductList from "./ProductList";
import UpsertProduct from "./UpsertProduct";

export default function Product() {
  const match = useRouteMatch();
  console.log("match", match.path);
  return (
    <Box>
      <h1>Product</h1>
      <Switch>
        <Route path={`${match.path}`} exact={true}>
          <ProductList />
        </Route>
        <Route path={`${match.path}/upsert/:productId`}>
          <UpsertProduct create={false} />
        </Route>
        <Route path={`${match.path}/upsert`}>
          <UpsertProduct create={true} />
        </Route>
      </Switch>
    </Box>
  );
}
