import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { Role } from "types";
import ManagerList from "pages/manager/ManagerList";
import CreateDeliverer from "./CreateDeliverer";

export default function Deliverer() {
  const { path } = useRouteMatch();
  const role = useSelector((state: RootState) => state.user.role);
  if (role !== Role.ADMIN) return <Redirect to="/admin/default" />;
  return (
    <Switch>
      <Route path={path} exact>
        <ManagerList deliverer />
      </Route>
      <Route path={`${path}/create`} exact>
        <CreateDeliverer />
      </Route>
      <Route path={`${path}/upsert/:managerId`} exact>
        <CreateDeliverer />
      </Route>
      <Redirect to={path} />
    </Switch>
  );
}
