import { api } from "./api";
import { Client } from "types";
import { ProductItem } from "./product";

export enum PaymentType {
  CASH = "CASH",
  TRANSFER = "TRANSFER",
  CREDIT = "CREDIT",
  PARTIAL_CREDIT = "PARTIAL CREDIT",
}

interface SaleItem {
  id?: number;
  stockProductId: number;
  // stockProduct?: StockProductItem;
  price: number;
  priceUnit: string;
  amount: number;
  amountUnit: string;
  originalPrice?: number;
}
export interface SaleType {
  id?: number;
  clientId: number;
  client?: Client;
  partialCreditAmount?: number;
  canceled?: boolean;
  saleItems: Array<SaleItem>;
  paymentType: PaymentType;
  updated_at?: string;
  created_at?: string;
}

export interface SaleReturnType {
  id: number;
  saleId: number;
  returnItems: Array<{
    id: number;
    amount: number;
    // stockProduct: StockProductItem;
    stockProductId: number;
    confirmed?: Boolean;
    disposed?: Boolean;
    sale: SaleType;
  }>;
}

type ClientListArgs = {
  searchTerm?: string;
  sortKey?: string;
  sortOrder?: string;
  managerId?: number;
};

const clientApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createClient: builder.mutation({
      query: (newClient: Partial<Client>) => ({
        url: "client",
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
      query: (newClient: Partial<Client>) => {
        // «Կոդ» and the joined-in labels are server-owned, so they never go back.
        const {
          id,
          code,
          clientGroupName,
          salesZoneName,
          managerName,
          ...updatedClient
        } = newClient;
        return {
          url: `client/${id}`,
          method: "PATCH",
          body: updatedClient,
        };
      },
    }),
    getClient: builder.query<Client[], ClientListArgs | void>({
      query: (arg: ClientListArgs = {}) => {
        const queryString = `searchTerm=${arg.searchTerm || ""}&managerId=${
          arg.managerId || ""
        }&sortKey=${arg.sortKey || ""}&sortOrder=${arg.sortOrder || ""}`;
        return {
          url: `client?${queryString}`,
          method: "GET",
        };
      },
    }),
    getClientById: builder.query<Client, { clientId: string | number }>({
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
    returnSale: builder.mutation({
      query: (args: {
        saleId: number;
        returnData: Array<{ stockProductId: number; amount: number }>;
      }) => ({
        url: `sale/${args.saleId}/return`,
        method: "POST",
        body: args.returnData,
      }),
    }),
    confirmReturn: builder.mutation({
      query: (args: { saleId: number }) => ({
        url: `sale/${args.saleId}/return/confirm`,
        method: "POST",
        body: {},
      }),
    }),
    confirmReturnById: builder.mutation({
      query: (args: { saleId: number; returnId: number }) => ({
        url: `sale/return/confirm/${args.returnId}`,
        method: "POST",
        body: {},
      }),
    }),
    disposeReturnById: builder.mutation({
      query: (args: { saleId: number; returnId: number }) => ({
        url: `sale/${args.saleId}/return/dispose/${args.returnId}`,
        method: "POST",
        body: {},
      }),
    }),
    disposeReturn: builder.mutation({
      query: (args: { saleId: number }) => ({
        url: `sale/${args.saleId}/return/dispose`,
        method: "POST",
        body: {},
      }),
    }),
    cancelSale: builder.mutation({
      query: (args: { saleId: number }) => ({
        url: `sale/${args.saleId}/cancel`,
        method: "POST",
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
    getReturnSale: builder.query<
      {
        returnDaleList: {
          stockProduct: { product: { name: string; id: number }; id: number };
        }[];
      },
      { query: string }
    >({
      query: ({ query }: { query: string }) => ({
        url: `sale/return${query}`,
        method: "GET",
      }),
    }),
    getLatestSaleForProduct: builder.query<
      { saleItem: SaleItem | undefined },
      { stockProductId: number }
    >({
      query: (arg: { stockProductId: number }) => ({
        url: `sale/latest/${arg.stockProductId}`,
        method: "GET",
      }),
    }),
    getReturnedSaleBySaleId: builder.query<SaleReturnType, { saleId: number }>({
      query: (arg: { saleId: number }) => ({
        url: `sale/return/${arg.saleId}`,
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
  useGetReturnSaleQuery,
  useReturnSaleMutation,
  useCancelSaleMutation,
  useLazyGetLatestSaleForProductQuery,
  useGetReturnedSaleBySaleIdQuery,
  useConfirmReturnMutation,
  useConfirmReturnByIdMutation,
  useDisposeReturnMutation,
  useDisposeReturnByIdMutation,
} = clientApi;
