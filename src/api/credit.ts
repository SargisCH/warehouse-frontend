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
  }),
});

export const {
  useGetCreditQuery,
  useGetCreditByIdQuery,
  useLazyGetCreditQuery,
  useLazyGetCreditByIdQuery,
} = creditApi;
