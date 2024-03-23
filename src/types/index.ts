export interface RouteTypeExtended extends RoutesType {
  exact?: boolean;
  group?: boolean;
  groupName?: string;
  nestedRoutes?: Array<RouteTypeExtended>;
  role: Role[];
}

export interface User {
  email: string;
  id: number;
  tenant: {
    id: number;
    name: string;
  };
  role: Role;
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
