import { api } from "./api";
import { Supplier } from "types";

const supplierApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createSupplier: builder.mutation({
      query: (newSupplier: Partial<Supplier>) => ({
        url: "supplier",
        method: "POST",
        body: newSupplier,
      }),
    }),
    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `supplier/${id}`,
        method: "DELETE",
      }),
    }),
    updateSupplier: builder.mutation({
      query: (newSupplier: Partial<Supplier>) => {
        const id = newSupplier.id;
        const updatedSupplier = { ...newSupplier };
        delete updatedSupplier.id;
        return {
          url: `supplier/${id}`,
          method: "PUT",
          body: updatedSupplier,
        };
      },
    }),
    getSuppliers: builder.query<
      Supplier[],
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
          url: `supplier?${queryString}`,
          method: "GET",
        };
      },
    }),
    getSupplierById: builder.query<Supplier, { supplierId: string | number }>({
      query: (arg: { supplierId: string | number }) => ({
        url: `supplier/${arg.supplierId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateSupplierMutation,
  useGetSuppliersQuery,
  useLazyGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useLazyGetSupplierByIdQuery,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApi;
