import { api } from "./api";

export type ProductItem = {
  price: number;
  priceUnit: string;
  created_at: string;
  id: number;
  name: string;
  inStock: number;
  ingredients?: Array<{
    inventoryId: number;
    amount: number;
    amountUnit: string;
  }>;
  inStockUnit?: string;
  updated_at: string;
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
    getProductById: builder.query<ProductItem, { productId: string | number }>({
      query: (arg: { productId: string | number }) => ({
        url: `product/${arg.productId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateProductMutation,
  useGetProductQuery,
  useGetProductByIdQuery,
  useLazyGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
