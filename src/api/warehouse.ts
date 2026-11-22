import { api } from "./api";

export type Warehouse = {
  id: number;
  name: string;
};

type StockQuantity = {
  quantity: string;
  unit: { id: number; name: string | null } | null;
};

type WarehouseStock = {
  id: number;
  name: string | null;
  products: Array<
    StockQuantity & { id: number; name: string | null; sku: string | null }
  >;
  totals: StockQuantity[];
};

const warehouseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createWarehouse: builder.mutation({
      query: (newWarehouse) => ({
        url: "warehouses/create",
        method: "POST",
        body: newWarehouse,
      }),
    }),
    deleteWarehouse: builder.mutation({
      query: (id) => ({
        url: `warehouses/${id}`,
        method: "DELETE",
      }),
    }),
    updateWarehouse: builder.mutation({
      query: (newWarehouse) => {
        const id = newWarehouse.id;
        const updatedWarehouse = { ...newWarehouse };
        delete updatedWarehouse.id;
        return {
          url: `warehouses/${id}`,
          method: "PUT",
          body: updatedWarehouse,
        };
      },
    }),
    getWarehouse: builder.query<Warehouse[], void>({
      query: () => ({
        url: "warehouses",
        method: "GET",
      }),
    }),
    getWarehouseById: builder.query<
      Warehouse,
      { warehouseId: string | number }
    >({
      query: (arg: { warehouseId: string | number }) => ({
        url: `warehouses/${arg.warehouseId}`,
        method: "GET",
      }),
    }),
    getWarehouseStock: builder.query<WarehouseStock, string>({
      query: (id) => ({ url: `warehouses/${id}/stock` }),
    }),
  }),
});

export const {
  useCreateWarehouseMutation,
  useGetWarehouseQuery,
  useGetWarehouseByIdQuery,
  useGetWarehouseStockQuery,
  useLazyGetWarehouseByIdQuery,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehouseApi;
