import { api } from "./api";

export type ProductItem = {
  id: number;
  name: string;
  unitId: number;
  warehouseId: number;
  groupId: number;
  officialName: string;
  forSale: boolean;
  returnable: boolean;
  fractional: boolean;
  sku: string;
  amount: number;
  unit: { id: number; name: string };
  warehouse: { id: number; name: string; quantity?: number };
  group: { id: number; name: string };
  ingredients?: Array<{
    productId: number;
    product?: Partial<{ name: string; id: string }>;
    quantity: number;
    unitId: number;
  }>;
  created_at: string;
  updated_at: string;
  totalStock?: number;
  inventory?: {
    warehouseId: number;
    warehouseName: string;
    quantity: number;
  }[];
};

const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation({
      query: (newProduct) => ({
        url: "product/create",
        method: "POST",
        body: newProduct,
      }),
    }),
    addInStock: builder.mutation({
      query: (newStockProduct) => ({
        url: "product/addInStock",
        method: "POST",
        body: newStockProduct,
      }),
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `product/${id}`,
        method: "DELETE",
      }),
    }),
    moveProduct: builder.mutation({
      query: (body) => ({
        url: `product/move`,
        method: "POST",
        body,
      }),
    }),
    updateProduct: builder.mutation({
      query: (newProduct) => {
        const id = newProduct.id;
        const updatedProdcut = { ...newProduct };
        delete updatedProdcut.id;
        return {
          url: `product/${id}`,
          method: "PUT",
          body: updatedProdcut,
        };
      },
    }),
    updateProductAmount: builder.mutation({
      query: (newAmountPayload) => ({
        url: `product/updateAmount/${newAmountPayload.id}`,
        method: "PUT",
        body: newAmountPayload,
      }),
    }),
    getProduct: builder.query<
      { data: ProductItem[]; totalCount: number },
      { queryString: string } | undefined
    >({
      query: (arg = { queryString: "" }) => ({
        url: `product${arg.queryString || ""}`,
        method: "GET",
      }),
    }),
    // getStockProduct: builder.query<
    //   { stockProducts: StockProductItem[]; totalWorth: number },
    //   void
    // >({
    //   query: () => ({
    //     url: "product/stockProduct",
    //     method: "GET",
    //   }),
    // }),
    getProductById: builder.query<ProductItem, { productId: string | number }>({
      query: (arg: { productId: string | number }) => ({
        url: `product/${arg.productId}`,
        method: "GET",
      }),
    }),
    // getStockProductById: builder.query<
    //   StockProductItem,
    //   { stockProductId: string | number }
    // >({
    //   query: (arg: { stockProductId: string | number }) => ({
    //     url: `product/stockProduct/${arg.stockProductId}`,
    //     method: "GET",
    //   }),
    // }),
    // updateStockProductById: builder.mutation({
    //   query: (newStockProduct) => ({
    //     url: `product/stockProduct/${newStockProduct.id}`,
    //     method: "PUT",
    //     body: newStockProduct,
    //   }),
    // }),
    // makeProduct: builder.mutation({
    //   query: (newStockProduct: { id: number; amount: number }) => ({
    //     url: `product/makeProduct/${newStockProduct.id}`,
    //     method: "PUT",
    //     body: newStockProduct,
    //   }),
    // }),
  }),
});

export const {
  useCreateProductMutation,
  useGetProductQuery,
  useGetProductByIdQuery,
  useLazyGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useMoveProductMutation,
  useAddInStockMutation,
  useUpdateProductAmountMutation,
} = productApi;
