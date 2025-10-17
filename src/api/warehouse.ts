import { api } from "./api";

export type Warehouse = {
  id: number;
  name: string;
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
  }),
});

export const {
  useCreateWarehouseMutation,
  useGetWarehouseQuery,
  useGetWarehouseByIdQuery,
  useLazyGetWarehouseByIdQuery,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehouseApi;
