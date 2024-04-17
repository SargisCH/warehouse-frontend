import { CreditType, TransactionStatus } from "types";
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
  inventorySupplier: {
    name: string;
    id: number;
  };
  inventorySupplierId?: number;
  amount: number;
  date?: Date;
  status: TransactionStatus;
  type: CreditType;
  updated_at: string;
  created_at: string;
};

const creditApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCredit: builder.query<
      CreditItem[],
      { clientId: number | string; weekDay: string } | void
    >({
      query: (
        arg: { weekDay: string; clientId: number | string } = {
          weekDay: "",
          clientId: "",
        },
      ) => {
        let queryString = "?";
        if (arg.weekDay) {
          queryString += `weekDay=${arg.weekDay}&`;
        }
        if (arg.clientId) {
          queryString += `clientId=${arg.clientId}&`;
        }
        return {
          url: `credit${queryString}`,
          method: "GET",
        };
      },
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
