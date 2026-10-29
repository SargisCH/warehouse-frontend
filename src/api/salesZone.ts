import { api } from "./api";
import { SalesZone } from "types";

type ListArgs = {
  searchTerm?: string;
  sortKey?: string;
  sortOrder?: string;
};

const salesZoneApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createSalesZone: builder.mutation({
      query: (newSalesZone: Partial<SalesZone>) => ({
        url: "sales-zone",
        method: "POST",
        body: newSalesZone,
      }),
    }),
    deleteSalesZone: builder.mutation({
      query: (id) => ({
        url: `sales-zone/${id}`,
        method: "DELETE",
      }),
    }),
    updateSalesZone: builder.mutation({
      query: (newSalesZone: Partial<SalesZone>) => {
        // «Կոդ» and the joined-in labels are server-owned, so they never go back.
        const { id, code, managerName, parentName, ...updatedSalesZone } =
          newSalesZone;
        return {
          url: `sales-zone/${id}`,
          method: "PATCH",
          body: updatedSalesZone,
        };
      },
    }),
    getSalesZones: builder.query<SalesZone[], ListArgs | void>({
      query: (arg: ListArgs = {}) => {
        const queryString = `searchTerm=${arg.searchTerm || ""}&sortKey=${
          arg.sortKey || ""
        }&sortOrder=${arg.sortOrder || ""}`;
        return {
          url: `sales-zone?${queryString}`,
          method: "GET",
        };
      },
    }),
    getSalesZoneById: builder.query<
      SalesZone,
      { salesZoneId: string | number }
    >({
      query: (arg: { salesZoneId: string | number }) => ({
        url: `sales-zone/${arg.salesZoneId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateSalesZoneMutation,
  useGetSalesZonesQuery,
  useLazyGetSalesZonesQuery,
  useGetSalesZoneByIdQuery,
  useLazyGetSalesZoneByIdQuery,
  useUpdateSalesZoneMutation,
  useDeleteSalesZoneMutation,
} = salesZoneApi;
