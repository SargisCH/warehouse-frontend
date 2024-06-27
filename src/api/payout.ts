import { api } from "./api";

export type PayoutType = {
  type: { name: string; id: number };
  amount: number;
  id?: number;
  created_at?: Date;
  otherPayoutType?: string;
};

const PayoutApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPayout: builder.mutation({
      query: (payout: PayoutType) => ({
        url: "payout/create",
        method: "POST",
        body: payout,
      }),
    }),
    createPayoutType: builder.mutation({
      query: (payoutType: { name: string }) => ({
        url: "payout/createPayoutType",
        method: "POST",
        body: payoutType,
      }),
    }),
    deletePayout: builder.mutation({
      query: (id) => ({
        url: `payout/${id}`,
        method: "DELETE",
      }),
    }),
    getPayout: builder.query<PayoutType[], void>({
      query: () => ({
        url: "payout",
        method: "GET",
      }),
    }),
    getPayoutTypes: builder.query<{ name: string; id: number }[], void>({
      query: () => ({
        url: "payout/payoutType",
        method: "GET",
      }),
    }),
    getPayoutById: builder.query<PayoutType, { payoutId: number }>({
      query: (arg: { payoutId: number }) => ({
        url: `payoutId/${arg.payoutId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetPayoutQuery,
  useLazyGetPayoutQuery,
  useGetPayoutByIdQuery,
  useLazyGetPayoutByIdQuery,
  useCreatePayoutMutation,
  useDeletePayoutMutation,
  useCreatePayoutTypeMutation,
  useGetPayoutTypesQuery,
} = PayoutApi;
