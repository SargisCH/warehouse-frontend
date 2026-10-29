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
    balance?: number;
    currency?: string;
  };
  role: Role;
  assistantAccess?: "NONE" | "CONTRIBUTOR" | "DEVELOPER";
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

export type SalesZone = {
  id: number;
  // Sequential per tenant, assigned by the server: 000001, …
  code: string;
  name: string;
  // «Մենեջեր»: the agent responsible for the zone.
  managerId: number | null;
  // «Փակվել է»
  isClosed: boolean;
  // «Կուտակիչ»: the zone this one nests under - itself a sales zone.
  parentId: number | null;
  // Joined in by the list/detail endpoints, not stored columns.
  managerName?: string | null;
  parentName?: string | null;
  tenantId?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ClientGroup = {
  id: number;
  name: string;
  // «Կուտակիչ»: the group this one rolls up into - itself a client group.
  parentId: number | null;
  parentName?: string | null;
  salesZoneId: number | null;
  // Joined in by the list/detail endpoints, not a stored column.
  salesZoneName?: string | null;
  tenantId?: number;
  createdAt?: string;
  updatedAt?: string;
};

// «Առևտրային գործակալ»
export type Manager = {
  id: number;
  // «Կոդ»: M001, M002, … assigned by the server, never edited here.
  code: string;
  name: string;
  email: string;
  // «Սարքի նույնականացման համար»
  deviceId: string | null;
  salesZoneId: number | null;
  // «Առաքիչ»: another manager whose van supplies this one. Empty means the
  // agent delivers his own goods.
  delivererId: number | null;
  // Joined in by the list/detail endpoints, not stored columns.
  salesZoneName?: string | null;
  delivererCode?: string | null;
  delivererName?: string | null;
  tenantId?: number;
  createdAt?: string;
  updatedAt?: string;
};

// «Գնորդ»
export type Client = {
  id: number;
  // Sequential per tenant, assigned by the server: 000001, …
  code: string;
  name: string;
  // «Լրիվ անվանում»
  legalName: string | null;
  // «ՀՎՀՀ»
  taxId: string | null;
  // «Իրավաբանական հասցե»
  legalAddress: string | null;
  // «Գործունեության հասցե»
  address: string | null;
  phoneNumber: string | null;
  otherPhoneNumber: string | null;
  email: string | null;
  // «Խումբ»
  clientGroupId: number | null;
  salesZoneId: number | null;
  managerId: number | null;
  // «Գնացուցակ» and the credit terms.
  priceListId?: number | null;
  paymentType?: string | null;
  // «Վճարման ուշացման օրեր»
  paymentTermDays?: number;
  // «Պարտքի սահմանաչափ» / «Ժամկետանց պարտքի սահմանաչափ»; zero means none.
  debtLimit?: string;
  overdueDebtLimit?: string;
  // Joined in by the list/detail endpoints, not stored columns.
  clientGroupName?: string | null;
  salesZoneName?: string | null;
  managerName?: string | null;
  tenantId?: number;
  createdAt?: string;
  updatedAt?: string;
};

// «Գնացուցակ»
export type PriceList = {
  id: number;
  code: string;
  name: string;
  isDefault: boolean;
  isClosed: boolean;
  items?: PriceListEntry[];
  tenantId?: number;
  createdAt?: string;
  updatedAt?: string;
};

// A priced product, as the «Ավելացնել ապրանքներ» picker shows it.
export type PriceListEntry = {
  productId: number;
  productCode: string | null;
  productName: string | null;
  unitName: string | null;
  price: string;
};

// «Ապրանքները մենեջերի մոտ»
export type ManagerStockRow = {
  productId: number;
  productCode: string | null;
  productName: string | null;
  unitName: string | null;
  quantity: string;
};

export type SaleItem = {
  id?: number;
  productId: number;
  productCode?: string | null;
  productName?: string | null;
  unitName?: string | null;
  // Decimals travel as strings so nothing is rounded in transit.
  quantity: string;
  price: string;
  amount?: string;
};

// «Վաճառք». `isReturn` marks «Վաճառքի վերադարձ».
export type Sale = {
  id: number;
  code: string;
  documentDate: string;
  managerId: number;
  salesZoneId: number | null;
  clientId: number;
  // «Առաքիչ» - a manager.
  delivererId: number | null;
  priceListId: number | null;
  // «Փաստաթղթի խումբ»
  documentId?: number | null;
  paymentType: string;
  note: string | null;
  totalAmount: string;
  paidAmount: string;
  isReturn: boolean;
  externalStatus: string | null;
  // Joined in by the list/detail endpoints, not stored columns.
  managerCode?: string | null;
  managerName?: string | null;
  clientCode?: string | null;
  clientName?: string | null;
  clientAddress?: string | null;
  salesZoneName?: string | null;
  clientSalesZoneName?: string | null;
  delivererCode?: string | null;
  delivererName?: string | null;
  priceListName?: string | null;
  documentName?: string | null;
  clientGroupName?: string | null;
  // Paid at the counter plus everything settled since; for a return, how much
  // of it has gone against the buyer's debts.
  settledAmount?: string;
  outstanding?: string;
  items?: SaleItem[];
  allocations?: Allocation[];
  tenantId?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SaleListResponse = {
  rows: Sale[];
  totals: {
    totalAmount: string;
    paidAmount: string;
    outstanding: string;
    count: number;
  };
};

// One slice of credit landing on a debt: a payment or return settling a sale.
export type Allocation = {
  id: number;
  amount: string;
  repaymentId: number | null;
  sourcePaymentId: number | null;
  sourceReturnId: number | null;
  targetSaleId: number | null;
  targetRefundId: number | null;
  saleCode: string | null;
  saleDate: string | null;
  saleTotal: string | null;
  sourceCode: string | null;
  sourceDate: string | null;
};

// What the add-sale form needs the moment a buyer is picked.
export type ClientSnapshot = {
  clientId: number;
  clientName: string;
  priceListId: number | null;
  // «Պարտք» and «Կանխավճար», split out of the signed balance.
  debt: string;
  prepaid: string;
  balance: string;
  // «Գնորդի ժամկետանց պարտք»: open sales past the payment term.
  overdueDebt: string;
  paymentType: string | null;
  debtLimit: string;
  overdueDebtLimit: string;
  // Credit not yet spent on a sale: «Կանխավճար» and «Վերադարձ».
  unusedPrepayment: string;
  unusedReturns: string;
  lastPurchaseDate: string | null;
  lastPurchaseAmount: string | null;
};

export type BalanceEntry = {
  id: number;
  clientId: number;
  kind: "SALE" | "PAYMENT" | "RETURN" | "REFUND" | "ADJUSTMENT";
  amount: string;
  before: string;
  result: string;
  saleId: number | null;
  note: string | null;
  createdAt: string;
};

export const PAYMENT_TYPES = [
  "CASH",
  "TRANSFER",
  "CREDIT",
  "PARTIAL_CREDIT",
] as const;

export type SupplyItem = {
  productId: number;
  // The quantity received, as a decimal string.
  amount: string;
  price?: string;
};

// «Ապրանքների մուտք»
export type Supply = {
  id: number;
  code?: string | null;
  documentDate?: string;
  documentId: number;
  warehouseId: number;
  // «Ընդունող»
  receiver?: string | null;
  note?: string | null;
  priceListId?: number | null;
  totalAmount?: string;
  products: SupplyItem[];
  created_at?: string;
  updated_at?: string;
};

// «Վճարում» (IN) and «Վճարում գնորդին» (REFUND).
export type Payment = {
  id: number;
  code: string;
  kind: "IN" | "REFUND";
  documentDate: string;
  managerId: number | null;
  salesZoneId: number | null;
  clientId: number;
  paymentType: string | null;
  amount: string;
  note: string | null;
  managerCode?: string | null;
  managerName?: string | null;
  clientCode?: string | null;
  clientName?: string | null;
  clientGroupName?: string | null;
  salesZoneName?: string | null;
  // Detail only.
  allocations?: Allocation[];
  allocated?: string;
  unallocated?: string;
};

// «Մարում»
export type Repayment = {
  id: number;
  code: string;
  documentDate: string;
  clientId: number;
  source: "PREPAYMENT" | "RETURN";
  amount: string;
  note: string | null;
  clientCode?: string | null;
  clientName?: string | null;
  clientGroupName?: string | null;
  allocations?: Allocation[];
};

export type MoneyListResponse<T> = {
  rows: T[];
  totals: { amount: string; count: number };
};

// «Մարման ենթակա փաստաթղթեր»
export type OpenSale = {
  id: number;
  code: string;
  documentDate: string;
  dueDate: string;
  isOverdue: boolean;
  totalAmount: string;
  outstanding: string;
};

export type ClientOpenItems = {
  balance: string;
  overdue: string;
  openSales: OpenSale[];
  debt: string;
  prepayment: string;
  returns: string;
};

export const TRANSFER_KINDS = [
  "WAREHOUSE",
  "DELIVERER",
  "ISSUE",
  "RETURN",
] as const;
export type TransferKind = (typeof TRANSFER_KINDS)[number];

export type StockTransferItem = {
  id?: number;
  productId: number;
  productCode?: string | null;
  productName?: string | null;
  unitName?: string | null;
  quantity: string;
  price?: string;
  amount?: string;
};

export type StockTransfer = {
  id: number;
  code: string;
  kind: TransferKind;
  documentDate: string;
  fromWarehouseId: number | null;
  toWarehouseId: number | null;
  fromManagerId: number | null;
  toManagerId: number | null;
  sender: string | null;
  receiver: string | null;
  priceListId: number | null;
  note: string | null;
  totalAmount: string;
  fromWarehouseName?: string | null;
  toWarehouseName?: string | null;
  fromManagerCode?: string | null;
  fromManagerName?: string | null;
  toManagerCode?: string | null;
  toManagerName?: string | null;
  items?: StockTransferItem[];
};

// The filter panel shared by the two sales reports.
export type SalesReportFilters = {
  productIds?: number[];
  productGroupIds?: number[];
  clientIds?: number[];
  clientGroupIds?: number[];
  managerIds?: number[];
  salesZoneIds?: number[];
  clientSalesZoneIds?: number[];
  delivererIds?: number[];
  paymentTypes?: string[];
  location?: string;
  // «Արտադրող»
  manufacturers?: string[];
  // «Գործողություն»: SALE and/or RETURN.
  operations?: string[];
  // «Փաստաթղթի խումբ»
  documentIds?: number[];
};

export const GROUP_DIMENSIONS = [
  "product",
  "productGroup",
  "client",
  "clientGroup",
  "manager",
  "deliverer",
  "salesZone",
  "location",
  "manufacturer",
  "documentGroup",
] as const;
export type GroupDimension = (typeof GROUP_DIMENSIONS)[number];
export type Measure = "quantity" | "amount";

export type ReportResponse<T = Record<string, any>> = {
  rows: T[];
  totals: Record<string, string>;
};
