import { api } from "./api";
import { Supply } from "types";

const supplyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createSupply: builder.mutation({
      query: (newSupply: Partial<Supply>) => ({
        url: "supplies",
        method: "POST",
        body: newSupply,
      }),
    }),
    getSupplies: builder.query<
      Supply[],
      {
        searchTerm?: string;
        sortKey?: string;
        sortOrder?: string;
      } | void
    >({
      query: (
        arg: {
          searchTerm?: string;
          sortKey?: string;
          sortOrder?: string;
        } = {
          searchTerm: "",
        },
      ) => {
        const queryString = `searchTerm=${arg.searchTerm || ""}&sortKey=${
          arg.sortKey || ""
        }&sortOrder=${arg.sortOrder || ""}`;
        return {
          url: `supplies?${queryString}`,
          method: "GET",
        };
      },
    }),
    getSupplyById: builder.query<Supply, { supplyId: string | number }>({
      query: (arg: { supplyId: string | number }) => ({
        url: `supplies/${arg.supplyId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateSupplyMutation,
  useGetSuppliesQuery,
  useLazyGetSuppliesQuery,
  useGetSupplyByIdQuery,
  useLazyGetSupplyByIdQuery,
} = supplyApi;
