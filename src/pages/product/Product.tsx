import { Box } from "@chakra-ui/react";
import { Switch, useRouteMatch } from "react-router-dom";
import { Route } from "react-router-dom";
import ProductList from "./ProductList";
import UpsertProduct from "./UpsertProduct";

export default function Product() {
  const match = useRouteMatch();
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
        <Route path={`${match.path}/upsert`} exact={true}>
          <UpsertProduct create={true} />
        </Route>
        {/*<Route path={`${match.path}/addInStock`}>
          <StockProductForm />
        </Route>
        <Route path={`${match.path}/stockProduct/:stockProductId`}>
          <StockProductForm />
        </Route>
        <Route path={`${match.path}/stockProducts`} exact={true}>
          <StockProductList />
        </Route>*/}
      </Switch>
    </Box>
  );
}
