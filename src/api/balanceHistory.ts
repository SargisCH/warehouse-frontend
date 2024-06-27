import { TransactionStatus } from "types";
import { api } from "./api";
import { SaleType } from "./client";

export enum TransactionType {
  IN = "IN",
  OUT = "OUT",
}

export type BalanceHistoryItem = {
  id?: number;
  sale?: SaleType;
  saleId?: number;
  orderId?: number;
  client?: {
    id: number;
    name: string;
  };
  clientId?: number;
  inventorySupplier?: { id: number; name: string };
  inventorySupplierId?: number;
  payoutId?: number;
  amount: number;
  direction: TransactionType;
  date?: Date;
  status: TransactionStatus;
  before: number;
  result: number;
  updated_at?: string;
  created_at?: string;
};

const balanceHistoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBalanceHistory: builder.query<BalanceHistoryItem[], void>({
      query: () => ({
        url: "balanceHistory",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetBalanceHistoryQuery } = balanceHistoryApi;
