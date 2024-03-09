import { api } from "./api";
import { SaleType } from "./client";

export type CreditItem = {
  id?: number;
  sale?: SaleType;
  saleId?: number;
  client: {
    name: string;
    id: number;
  };
  clientId?: number;
  amount: number;
  date?: Date;
  updated_at: string;
  created_at: string;
};

const creditApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCredit: builder.query<CreditItem[], void>({
      query: () => ({
        url: "credit",
        method: "GET",
      }),
    }),
    getCreditById: builder.query<CreditItem, { creditId: string | number }>({
      query: (arg: { creditId: string | number }) => ({
        url: `credit/${arg.creditId}`,
        method: "GET",
      }),
    }),
    createCredit: builder.mutation({
      query: (newCredit: CreditItem) => ({
        url: "credit/create",
        method: "POST",
        body: newCredit,
      }),
    }),
    deleteCredit: builder.mutation({
      query: (id) => ({
        url: `credit/${id}`,
        method: "DELETE",
      }),
    }),
    updateCredit: builder.mutation({
      query: (newCredit) => {
        const id = newCredit.id;
        const updatedCredit = { ...newCredit };
        delete updatedCredit.id;
        return {
          url: `credit/${id}`,
          method: "PUT",
          body: updatedCredit,
        };
      },
    }),
  }),
});

export const {
  useGetCreditQuery,
  useGetCreditByIdQuery,
  useLazyGetCreditQuery,
  useLazyGetCreditByIdQuery,
  useCreateCreditMutation,
  useUpdateCreditMutation,
} = creditApi;
