export interface RouteTypeExtended extends RoutesType {
  exact?: boolean;
  group?: boolean;
  groupName?: string;
  nestedRoutes?: Array<RouteTypeExtended>;
}
