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
    logo: string;
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
  ADMIN = "Admin",
  MANAGER = "MANAGER",
  USER = "USER",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  FAILED = "FAILED",
  FINISHED = "FINISHED",
}

export enum CreditType {
  TO_PAY = "TO_PAY",
  TO_RECEIVE = "TO_RECEIVE",
}

export type OptionType = {
  label: string;
  value: string;
};

export type Supplier = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export type SupplyItem = {
  productId: number;
  amount: number;
};

export type Supply = {
  id: number;
  documentId: number;
  warehouseId: number;
  products: SupplyItem[];
  created_at?: string;
  updated_at?: string;
};

