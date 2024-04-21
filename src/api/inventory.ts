import { api } from "./api";

export type InventoryItem = {
  amount: number;
  amountUnit: string;
  created_at: string;
  id: number;
  name: string;
  price: number;
  avg?: number;
  currency?: string;
  product_id?: string;
  updated_at: string;
};

export type InventoryEntry = {
  id?: number;
  date?: Date;
  inventorySupplierId: number;
  inventorySupplier?: {
    name: string;
    id: number;
  };
  inventoryEntryItems: InventoryEntryItem[];
};

export type InventoryEntryItem = {
  amount: number;
  amountUnit: string;
  id?: number;
  price: number;
  inventoryId: number;
  inventory?: {
    name: string;
    id: number;
  };
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
    getInventoryEntries: builder.query<
      { inventoryEntries: InventoryEntry[]; totalWorth: number },
      void
    >({
      query: () => ({
        url: "inventory/entry",
        method: "GET",
      }),
    }),
    createInventoryEntry: builder.mutation({
      query: (newInventoryEntry) => ({
        url: "inventory/entry/create",
        method: "POST",
        body: newInventoryEntry,
      }),
    }),
    updateInventoryEntry: builder.mutation({
      query: (newInventoryEntry) => {
        const id = newInventoryEntry.id;
        const updatedInventoryEntry = { ...newInventoryEntry };
        delete updatedInventoryEntry.id;
        return {
          url: `inventory/entry/${id}`,
          method: "PUT",
          body: updatedInventoryEntry,
        };
      },
    }),
    getInventoryEntryById: builder.query<
      InventoryEntry,
      { inventoryEntryId: string | number }
    >({
      query: (arg: { inventoryEntryId: string | number }) => ({
        url: `inventoryEntry/${arg.inventoryEntryId}`,
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
  useGetInventoryEntriesQuery,
  useCreateInventoryEntryMutation,
  useUpdateInventoryEntryMutation,
  useLazyGetInventoryEntryByIdQuery,
  useGetInventoryEntryByIdQuery,
  useLazyGetInventoryEntriesQuery,
} = inventoryApi;
