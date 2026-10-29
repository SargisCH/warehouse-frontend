import { api } from "./api";
import { toQueryString } from "helpers/money";
import { ClientOpenItems, MoneyListResponse, Payment, Repayment } from "types";

// «Վճարումներ» / «Մարումներ» list filters.
export type MoneyFilters = {
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  managerId?: string;
  salesZoneId?: string;
  clientId?: string;
  clientGroupId?: string;
  kind?: "IN" | "REFUND";
  source?: string;
};

type AllocationInput = { saleId: number; amount: string };

const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<MoneyListResponse<Payment>, MoneyFilters | void>(
      {
        query: (filters: MoneyFilters = {}) => ({
          url: `payment?${toQueryString(filters)}`,
          method: "GET",
        }),
      },
    ),
    getPaymentById: builder.query<Payment, { paymentId: string | number }>({
      query: (arg) => ({ url: `payment/${arg.paymentId}`, method: "GET" }),
    }),
    // «Վճարում». Without allocations the oldest debts are settled first.
    createPayment: builder.mutation({
      query: (body: {
        documentDate?: string;
        managerId?: number | null;
        salesZoneId?: number | null;
        clientId: number;
        paymentType?: string;
        amount: string;
        note?: string | null;
        allocations?: AllocationInput[];
      }) => ({ url: "payment", method: "POST", body }),
    }),
    // «Վճարում գնորդին»
    createRefund: builder.mutation({
      query: (body: {
        documentDate?: string;
        managerId?: number | null;
        clientId: number;
        paymentType?: string;
        amount: string;
        note?: string | null;
      }) => ({ url: "payment/refund", method: "POST", body }),
    }),
    deletePayment: builder.mutation({
      query: (id: number | string) => ({
        url: `payment/${id}`,
        method: "DELETE",
      }),
    }),
    // Open debts and unused credit, once a buyer is picked.
    getClientOpenItems: builder.query<
      ClientOpenItems,
      { clientId: string | number }
    >({
      query: (arg) => ({
        url: `payment/client/${arg.clientId}/open`,
        method: "GET",
      }),
    }),
    getRepayments: builder.query<
      MoneyListResponse<Repayment>,
      MoneyFilters | void
    >({
      query: (filters: MoneyFilters = {}) => ({
        url: `repayment?${toQueryString(filters)}`,
        method: "GET",
      }),
    }),
    getRepaymentById: builder.query<
      Repayment,
      { repaymentId: string | number }
    >({
      query: (arg) => ({ url: `repayment/${arg.repaymentId}`, method: "GET" }),
    }),
    createRepayment: builder.mutation({
      query: (body: {
        documentDate?: string;
        clientId: number;
        source: string;
        amount?: string;
        note?: string | null;
        allocations?: AllocationInput[];
      }) => ({ url: "repayment", method: "POST", body }),
    }),
    deleteRepayment: builder.mutation({
      query: (id: number | string) => ({
        url: `repayment/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useLazyGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useCreateRefundMutation,
  useDeletePaymentMutation,
  useLazyGetClientOpenItemsQuery,
  useGetRepaymentsQuery,
  useLazyGetRepaymentByIdQuery,
  useCreateRepaymentMutation,
  useDeleteRepaymentMutation,
} = paymentApi;
