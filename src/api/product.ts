import { api } from "./api";

export type ProductItem = {
  price: number;
  priceUnit: string;
  created_at: string;
  id: number;
  name: string;
  ingredients?: Array<{
    inventoryId: number;
    amount: number;
    amountUnit: string;
  }>;
  updated_at: string;
};

export type StockProductItem = {
  id: number;
  product?: Partial<{
    name: string;
    id: number;
    price: number;
    priceUnit: string;
    amountUnit: string;
  }>;
  costPrice: number;
  productId: number;
  inStock: number;
  inStockUnit?: string;
  noCalculation?: boolean;
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
    getProduct: builder.query<ProductItem[], void>({
      query: () => ({
        url: "product",
        method: "GET",
      }),
    }),
    getStockProduct: builder.query<
      { stockProducts: StockProductItem[]; totalWorth: number },
      void
    >({
      query: () => ({
        url: "product/stockProduct",
        method: "GET",
      }),
    }),
    getProductById: builder.query<ProductItem, { productId: string | number }>({
      query: (arg: { productId: string | number }) => ({
        url: `product/${arg.productId}`,
        method: "GET",
      }),
    }),
    getStockProductById: builder.query<
      StockProductItem,
      { stockProductId: string | number }
    >({
      query: (arg: { stockProductId: string | number }) => ({
        url: `product/stockProduct/${arg.stockProductId}`,
        method: "GET",
      }),
    }),
    updateStockProductById: builder.mutation({
      query: (newStockProduct) => ({
        url: `product/stockProduct/${newStockProduct.id}`,
        method: "PUT",
        body: newStockProduct,
      }),
    }),
  }),
});

export const {
  useCreateProductMutation,
  useGetStockProductQuery,
  useGetProductQuery,
  useGetProductByIdQuery,
  useLazyGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddInStockMutation,
  useGetStockProductByIdQuery,
  useUpdateStockProductByIdMutation,
  useLazyGetStockProductByIdQuery,
} = productApi;
