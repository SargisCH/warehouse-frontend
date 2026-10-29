import { api } from "./api";
import { PriceList, PriceListEntry } from "types";
import { ProductItem } from "./product";

type ListArgs = {
  searchTerm?: string;
  sortKey?: string;
  sortOrder?: string;
};

const priceListApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPriceList: builder.mutation({
      query: (newPriceList: Partial<PriceList>) => ({
        url: "price-list",
        method: "POST",
        body: newPriceList,
      }),
    }),
    deletePriceList: builder.mutation({
      query: (id) => ({
        url: `price-list/${id}`,
        method: "DELETE",
      }),
    }),
    updatePriceList: builder.mutation({
      query: (newPriceList: Partial<PriceList>) => {
        // «Կոդ» is server-owned, so it never goes back.
        const { id, code, ...updated } = newPriceList;
        return {
          url: `price-list/${id}`,
          method: "PATCH",
          body: updated,
        };
      },
    }),
    getPriceLists: builder.query<PriceList[], ListArgs | void>({
      query: (arg: ListArgs = {}) => {
        const queryString = `searchTerm=${arg.searchTerm || ""}&sortKey=${
          arg.sortKey || ""
        }&sortOrder=${arg.sortOrder || ""}`;
        return {
          url: `price-list?${queryString}`,
          method: "GET",
        };
      },
    }),
    getPriceListById: builder.query<
      PriceList,
      { priceListId: string | number }
    >({
      query: (arg: { priceListId: string | number }) => ({
        url: `price-list/${arg.priceListId}`,
        method: "GET",
      }),
    }),
    // «Ավելացնել ապրանքները գնացուցակից» - the picker's rows.
    getPriceListEntries: builder.query<
      PriceListEntry[],
      { priceListId: string | number; searchTerm?: string }
    >({
      query: (arg: { priceListId: string | number; searchTerm?: string }) => ({
        url: `price-list/${arg.priceListId}/entries?searchTerm=${
          arg.searchTerm || ""
        }`,
        method: "GET",
      }),
    }),
    getPriceListProducts: builder.query<
      ProductItem[],
      { searchTerm?: string } | void
    >({
      query: (arg: { searchTerm?: string } = {}) => ({
        url: `price-list/products?searchTerm=${arg.searchTerm || ""}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreatePriceListMutation,
  useGetPriceListsQuery,
  useLazyGetPriceListsQuery,
  useGetPriceListByIdQuery,
  useLazyGetPriceListByIdQuery,
  useUpdatePriceListMutation,
  useDeletePriceListMutation,
  useGetPriceListEntriesQuery,
  useLazyGetPriceListEntriesQuery,
  useGetPriceListProductsQuery,
} = priceListApi;
