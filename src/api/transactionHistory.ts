import { TransactionStatus } from "types";
import { api } from "./api";
import { SaleType } from "./client";

export enum TransactionType {
  IN = "IN",
  OUT = "OUT",
}

export type TransactionHistoryItem = {
  id?: number;
  sale?: SaleType;
  saleId?: number;
  client?: {
    id: number;
    name: string;
  };
  clientId?: number;
  inventorySupplier?: { id: number; name: string };
  inventorySupplierId?: number;
  amount: number;
  transactionType: TransactionType;
  date?: Date;
  status: TransactionStatus;
  updated_at?: string;
  created_at?: string;
};

const transactionHistoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTransactionHistory: builder.query<TransactionHistoryItem[], void>({
      query: () => ({
        url: "transactionHistory",
        method: "GET",
      }),
    }),
    getTransactionHistoryById: builder.query<
      TransactionHistoryItem,
      { transactionHistoryId: string | number }
    >({
      query: (arg: { transactionHistoryId: string | number }) => ({
        url: `transactionHistory/${arg.transactionHistoryId}`,
        method: "GET",
      }),
    }),
    createTransactionHistory: builder.mutation({
      query: (newTransactionHistory: TransactionHistoryItem) => ({
        url: "transactionHistory/create",
        method: "POST",
        body: newTransactionHistory,
      }),
    }),
    updateTransactionHistory: builder.mutation({
      query: (newTransactionHistory: TransactionHistoryItem) => {
        const id = newTransactionHistory.id;
        const updatedTransactionHistory = { ...newTransactionHistory };
        delete updatedTransactionHistory.id;
        return {
          url: `transactionHistory/${id}`,
          method: "PUT",
          body: updatedTransactionHistory,
        };
      },
    }),
  }),
});

export const {
  useGetTransactionHistoryQuery,
  useLazyGetTransactionHistoryQuery,
  useLazyGetTransactionHistoryByIdQuery,
  useCreateTransactionHistoryMutation,
  useUpdateTransactionHistoryMutation,
} = transactionHistoryApi;
