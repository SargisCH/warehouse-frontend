import { Weekday } from "types";
import { api } from "./api";
import { ProductItem, StockProductItem } from "./product";

export enum PaymentType {
  CASH = "CASH",
  TRANSFER = "TRANSFER",
  CREDIT = "CREDIT",
  PARTIAL_CREDIT = "PARTIAL CREDIT",
}

export type ClientType = {
  id?: number;
  name: string;
  legalName: string;
  taxId?: string;
  accountNumber: string;
  legalAddress: string;
  address: string;
  phoneNumber: string;
  otherPhoneNumber: string;
  email: string;
  managerId?: number;
  manager?: Partial<{ name: string; id: number }>;
  dayPlan?: Weekday[];
  updated_at?: string;
  created_at?: string;
};
export interface SaleType {
  id?: number;
  clientId: number;
  client?: ClientType;
  partialCreditAmount?: number;
  saleItems: Array<{
    stockProductId: number;
    stockProduct?: StockProductItem;
    price: number;
    priceUnit: string;
    amount: number;
    amountUnit: string;
    originalPrice?: number;
  }>;
  paymentType: PaymentType;
  updated_at?: string;
  created_at?: string;
}

interface SaleReturnType extends SaleType {
  id: number;
}

const clientApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createClient: builder.mutation({
      query: (newClient: ClientType) => ({
        url: "client/create",
        method: "POST",
        body: newClient,
      }),
    }),
    deleteClient: builder.mutation({
      query: (id) => ({
        url: `client/${id}`,
        method: "DELETE",
      }),
    }),
    updateClient: builder.mutation({
      query: (newClient) => {
        const id = newClient.id;
        const updatedClient = { ...newClient };
        delete updatedClient.id;
        return {
          url: `product/${id}`,
          method: "PUT",
          body: updatedClient,
        };
      },
    }),
    getClient: builder.query<
      ClientType[],
      {
        weekDay?: string;
        searchTerm?: string;
        managerId?: number;
        sortKey?: string;
        sortOrder?: string;
      } | void
    >({
      query: (
        arg: {
          weekDay?: string;
          searchTerm?: string;
          managerId?: number;
          sortKey?: string;
          sortOrder?: string;
        } = {
          weekDay: "",
          searchTerm: "",
        },
      ) => {
        const queryString = `weekDay=${arg.weekDay ?? ""}&searchTerm=${arg.searchTerm || ""}&managerId=${arg.managerId || ""}&sortKey=${arg.sortKey || ""}&sortOrder=${arg.sortOrder || ""}`;
        return {
          url: `client?${queryString}`,
          method: "GET",
        };
      },
    }),
    getClientById: builder.query<ClientType, { clientId: string | number }>({
      query: (arg: { clientId: string | number }) => ({
        url: `client/${arg.clientId}`,
        method: "GET",
      }),
    }),
    addSale: builder.mutation({
      query: (newSale: SaleType) => ({
        url: "sale/create",
        method: "POST",
        body: newSale,
      }),
    }),
    getSaleById: builder.query<SaleType, { id: string | number }>({
      query: (arg: { id: string | number }) => ({
        url: `sale/${arg.id}`,
        method: "GET",
      }),
    }),
    getSale: builder.query<
      { saleList: SaleReturnType[]; totalPages: number }[],
      { query: string }
    >({
      query: ({ query }: { query: string }) => ({
        url: `sale/${query}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateClientMutation,
  useGetClientQuery,
  useLazyGetClientQuery,
  useGetClientByIdQuery,
  useLazyGetClientByIdQuery,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useAddSaleMutation,
  useLazyGetSaleByIdQuery,
  useGetSaleByIdQuery,
  useGetSaleQuery,
} = clientApi;
