import { api } from "./api";

export type InventorySupplier = {
  id: number;
  name: string;
  updated_at: string;
  created_at: string;
};

const inventorySupplierApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createInventorySupplier: builder.mutation({
      query: (newInventorySupplier) => ({
        url: "inventorySupplier/create",
        method: "POST",
        body: newInventorySupplier,
      }),
    }),
    deleteInventorySupplier: builder.mutation({
      query: (id) => ({
        url: `inventorySupplier/${id}`,
        method: "DELETE",
      }),
    }),
    updateInventorySupplier: builder.mutation({
      query: (newInventorySupplier) => {
        const id = newInventorySupplier.id;
        const updatedInventorySupplier = { ...newInventorySupplier };
        delete updatedInventorySupplier.id;
        return {
          url: `inventorySupplier/${id}`,
          method: "PUT",
          body: updatedInventorySupplier,
        };
      },
    }),
    getInventorySupplier: builder.query<InventorySupplier[], void>({
      query: () => ({
        url: "inventorySupplier",
        method: "GET",
      }),
    }),
    getInventorySupplierById: builder.query<
      InventorySupplier,
      { inventorySupplierId: string | number }
    >({
      query: (arg: { inventorySupplierId: string | number }) => ({
        url: `inventorySupplier/${arg.inventorySupplierId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateInventorySupplierMutation,
  useGetInventorySupplierQuery,
  useGetInventorySupplierByIdQuery,
  useLazyGetInventorySupplierByIdQuery,
  useUpdateInventorySupplierMutation,
  useDeleteInventorySupplierMutation,
} = inventorySupplierApi;
