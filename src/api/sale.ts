import { api } from "./api";
import {
  BalanceEntry,
  ClientSnapshot,
  ManagerStockRow,
  Sale,
  SaleListResponse,
} from "types";

// Every «Վաճառք» list filter. Blank values are dropped rather than sent empty.
export type SaleFilters = {
  searchTerm?: string;
  sortKey?: string;
  sortOrder?: string;
  // «Ժամանակահատված»
  dateFrom?: string;
  dateTo?: string;
  // «Առևտրային գործակալ (մենեջեր)»
  managerId?: string;
  // «Վաճառքի գոտի»
  salesZoneId?: string;
  // «Գնորդի վաճառքի գոտի»
  clientSalesZoneId?: string;
  clientId?: string;
  // «Գնորդների խումբ»
  clientGroupId?: string;
  // «Փաստաթղթի խումբ»
  documentId?: string;
  // «Առաքիչ»
  delivererId?: string;
  // «Վճարման տեսակ»
  paymentType?: string;
  // «Գտնվելու վայր»
  location?: string;
  // «Այլ համակարգ ուղարկման վիճակ»
  externalStatus?: string;
  // «Միայն մնացորդ ունեցողները»
  onlyWithBalance?: boolean;
  isReturn?: boolean;
};

const toQueryString = (filters: SaleFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (typeof value === "boolean") {
      if (value) params.set(key, "true");
      return;
    }
    params.set(key, String(value));
  });
  return params.toString();
};

const saleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query<SaleListResponse, SaleFilters | void>({
      providesTags: ["ClientBalance"],
      query: (filters: SaleFilters = {}) => ({
        url: `sale?${toQueryString(filters)}`,
        method: "GET",
      }),
    }),
    getSaleDetails: builder.query<Sale, { saleId: string | number }>({
      providesTags: ["ClientBalance"],
      query: (arg: { saleId: string | number }) => ({
        url: `sale/${arg.saleId}`,
        method: "GET",
      }),
    }),
    createSale: builder.mutation({
      invalidatesTags: (_result, error) => error ? [] : ["ManagerCash", "CompanyCash", "ClientBalance"],
      query: (newSale: Partial<Sale> & { items: unknown[]; cashCollectedByManager?: boolean }) => ({
        url: "sale",
        method: "POST",
        body: newSale,
      }),
    }),
    deleteSale: builder.mutation({
      invalidatesTags: (_result, error) => error ? [] : ["ManagerCash", "CompanyCash", "ClientBalance"],
      query: (id) => ({
        url: `sale/${id}`,
        method: "DELETE",
      }),
    }),
    // «Պատճենել» - the lines of an existing document, ready to re-post.
    copySale: builder.query<
      Partial<Sale> & {
        items: Array<{ productId: number; quantity: string; price: string }>;
      },
      { saleId: string | number }
    >({
      query: (arg: { saleId: string | number }) => ({
        url: `sale/${arg.saleId}/copy`,
        method: "GET",
      }),
    }),
    // «Կատարել վճարում» - omit the amount to settle the whole remainder.
    paySale: builder.mutation({
      invalidatesTags: (_result, error) => error ? [] : ["ManagerCash", "CompanyCash", "ClientBalance"],
      query: (arg: {
        saleId: string | number;
        amount?: string;
        note?: string;
        paymentType?: "CASH" | "TRANSFER";
        cashCollectedByManager?: boolean;
      }) => ({
        url: `sale/${arg.saleId}/pay`,
        method: "POST",
        body: {
          amount: arg.amount,
          note: arg.note,
          paymentType: arg.paymentType,
          cashCollectedByManager: arg.cashCollectedByManager,
        },
      }),
    }),
    // «Կատարել մարում» - settles debt on the account, never adds to it.
    settleClient: builder.mutation({
      invalidatesTags: (_result, error) => error ? [] : ["ClientBalance"],
      query: (arg: { clientId: number; amount: string; note?: string }) => ({
        url: "sale/settle",
        method: "POST",
        body: arg,
      }),
    }),
    getClientSnapshot: builder.query<
      ClientSnapshot,
      { clientId: string | number }
    >({
      providesTags: ["ClientBalance"],
      query: (arg: { clientId: string | number }) => ({
        url: `sale/client/${arg.clientId}/snapshot`,
        method: "GET",
      }),
    }),
    getClientBalance: builder.query<
      BalanceEntry[],
      { clientId: string | number }
    >({
      providesTags: ["ClientBalance"],
      query: (arg: { clientId: string | number }) => ({
        url: `sale/client/${arg.clientId}/balance`,
        method: "GET",
      }),
    }),
    getManagerStock: builder.query<
      ManagerStockRow[],
      { managerId: string | number }
    >({
      query: (arg: { managerId: string | number }) => ({
        url: `sale/manager/${arg.managerId}/stock`,
        method: "GET",
      }),
    }),
    loadManagerStock: builder.mutation({
      query: (arg: {
        managerId: string | number;
        items: Array<{ productId: number; quantity: string }>;
      }) => ({
        url: `sale/manager/${arg.managerId}/stock`,
        method: "POST",
        body: { items: arg.items },
      }),
    }),
  }),
});

export const {
  useGetSalesQuery,
  useLazyGetSalesQuery,
  useGetSaleDetailsQuery,
  useLazyGetSaleDetailsQuery,
  useCreateSaleMutation,
  useDeleteSaleMutation,
  useLazyCopySaleQuery,
  usePaySaleMutation,
  useSettleClientMutation,
  useGetClientSnapshotQuery,
  useLazyGetClientSnapshotQuery,
  useGetClientBalanceQuery,
  useGetManagerStockQuery,
  useLazyGetManagerStockQuery,
  useLoadManagerStockMutation,
} = saleApi;
