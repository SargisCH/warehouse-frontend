import { api } from "./api";
import { SaleType } from "./client";

export enum TransactionType {
  IN,
  OUT,
}

export type TransactionHistoryItem = {
  id?: number;
  sale?: SaleType;
  saleId?: number;
  client: {
    id: number;
    name: string;
  };
  amount: number;
  transactionType: TransactionType;
  updated_at: string;
  created_at: string;
};

const transactionHistoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTransactionHistory: builder.query<TransactionHistoryItem[], void>({
      query: () => ({
        url: "transactionHistory",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetTransactionHistoryQuery,
  useLazyGetTransactionHistoryQuery,
} = transactionHistoryApi;
