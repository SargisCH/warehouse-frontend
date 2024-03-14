import { api } from "./api";

export type InventoryItem = {
  amount: number;
  amountUnit: string;
  created_at: string;
  id: number;
  name: string;
  price: number;
  currency?: string;
  product_id?: string;
  updated_at: string;
};
export const inventoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createInventory: builder.mutation({
      query: (newInventory) => ({
        url: "inventory/create",
        method: "POST",
        body: newInventory,
      }),
    }),
    deleteInventory: builder.mutation({
      query: (id) => ({
        url: `inventory/${id}`,
        method: "DELETE",
      }),
    }),
    updateInventory: builder.mutation({
      query: (newInventory) => {
        const id = newInventory.id;
        const updatedInventory = { ...newInventory };
        delete updatedInventory.id;
        return {
          url: `inventory/${id}`,
          method: "PUT",
          body: updatedInventory,
        };
      },
    }),
    getInventory: builder.query<
      { inventories: InventoryItem[]; totalWorth: number },
      void
    >({
      query: () => ({
        url: "inventory",
        method: "GET",
      }),
    }),
    getInventoryById: builder.query<
      InventoryItem,
      { inventoryId: string | number }
    >({
      query: (arg: { inventoryId: string | number }) => ({
        url: `inventory/${arg.inventoryId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateInventoryMutation,
  useGetInventoryQuery,
  useGetInventoryByIdQuery,
  useLazyGetInventoryByIdQuery,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
} = inventoryApi;
