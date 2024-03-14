export interface RouteTypeExtended extends RoutesType {
  exact?: boolean;
  group?: boolean;
  groupName?: string;
  nestedRoutes?: Array<RouteTypeExtended>;
}

export enum Weekday {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  USER = "USER",
}
