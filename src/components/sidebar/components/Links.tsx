/* eslint-disable */

// chakra imports
import { routeAccess } from "helpers/routeAccess";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { RouteTypeExtended } from "types";
import SidebarLink from "./SidebarLink";

export function SidebarLinks(props: {
  routes: Array<RoutesType | Array<RoutesType>>;
}) {
  //   Chakra color mode
  const user = useSelector((state: RootState) => state.user);
  const { routes } = props;
  // verifies if routeName is the one active (in browser input)

  // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createLinks = (routes: RouteTypeExtended[]) => {
    return routes.map((route: RouteTypeExtended, index: number) => {
      if (
        route.path.includes("sign-in") ||
        route.path.includes("verify") ||
        route.path.includes("sign-up")
      )
        return null;
      if (Array.isArray(route.nestedRoutes)) {
        const hasRouteGroupAccess = routeAccess(user, route);
        if (!hasRouteGroupAccess) return null;
        return <SidebarLink isGroup={true} route={route} key={index} />;
      }
      const hasAccess = routeAccess(user, route);
      if (!hasAccess) return null;
      return <SidebarLink route={route} key={route.path} />;
    });
  };
  //  BRAND
  return <>{createLinks(routes as RouteTypeExtended[])}</>;
}

export default SidebarLinks;
