import { Role, RouteTypeExtended, User } from "../types/index";

export const routeAccess = (user: User, route: RouteTypeExtended) => {
  if (route.group) {
    return route.nestedRoutes.some((r) => r.role.includes(user.role));
  }
  return route.role.includes(user.role);
};
