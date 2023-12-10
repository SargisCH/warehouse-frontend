import { api } from "./api";

export type InventorySupplier = {
  id: number;
  name: string;
  updated_at: string;
  created_at: string;
};

export type OrderItem = {
  id?: number;
  inventory?: Partial<{ id: number }>;
  inventoryId: number;
  price: number;
  priceUnit: string;
  amount: number;
  amountUnit: string;
};

export type SupplierOrder = {
  id: number;
  inventorySupplierId: number;
  orderItems: Array<OrderItem>;
  orderDate: string;
  status?: string;
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
    createSupplierOrder: builder.mutation({
      query: (newSupplierOrder) => ({
        url: `inventorySupplier/${newSupplierOrder.id}/order/create`,
        method: "POST",
        body: newSupplierOrder,
      }),
    }),
    getSupplierOrders: builder.query<SupplierOrder[], void>({
      query: () => ({
        url: "inventorySupplier/order",
        method: "GET",
      }),
    }),
    getInventorySupplierOrderById: builder.query<
      SupplierOrder,
      { inventorySupplierId: string | number; inventorySupplierOrderId: number }
    >({
      query: (arg: {
        inventorySupplierId: string | number;
        inventorySupplierOrderId: number;
      }) => ({
        url: `inventorySupplier/${arg.inventorySupplierId}/order/${arg.inventorySupplierOrderId}`,
        method: "GET",
      }),
    }),
    deleteInventorySupplierOrder: builder.mutation({
      query: ({ supplierId, orderId }) => ({
        url: `inventorySupplier/${supplierId}/order/${orderId}`,
        method: "DELETE",
      }),
    }),
    updateInventorySupplierOrder: builder.mutation({
      query: (newInventorySupplier) => {
        const id = newInventorySupplier.id;
        const orderId = newInventorySupplier.orderId;
        delete newInventorySupplier.orderId;
        const updatedInventorySupplier = { ...newInventorySupplier };
        delete updatedInventorySupplier.id;
        return {
          url: `inventorySupplier/${id}/order/${orderId}`,
          method: "PUT",
          body: updatedInventorySupplier,
        };
      },
    }),
    getLatestOrderDetails: builder.query<
      { orderItem: OrderItem | undefined },
      { inventorySupplierId: string | number; inventoryId: number }
    >({
      query: (arg: {
        inventorySupplierId: string | number;
        inventoryId: number;
      }) => ({
        url: `inventorySupplier/${arg.inventorySupplierId}/inventory/${arg.inventoryId}/latest`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateInventorySupplierMutation,
  useGetInventorySupplierQuery,
  useLazyGetInventorySupplierQuery,
  useGetInventorySupplierByIdQuery,
  useLazyGetInventorySupplierByIdQuery,
  useUpdateInventorySupplierMutation,
  useDeleteInventorySupplierMutation,
  useCreateSupplierOrderMutation,
  useGetSupplierOrdersQuery,
  useUpdateInventorySupplierOrderMutation,
  useDeleteInventorySupplierOrderMutation,
  useLazyGetSupplierOrdersQuery,
  useLazyGetInventorySupplierOrderByIdQuery,
  useLazyGetLatestOrderDetailsQuery,
} = inventorySupplierApi;
