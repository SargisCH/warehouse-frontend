import { api } from "./api";

export type ProductCategoryItem = {
  id?: number;
  name: string;
  updated_at: string;
  created_at: string;
};

const productCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createProductCategory: builder.mutation({
      query: (newProduct) => ({
        url: "productCategory/create",
        method: "POST",
        body: newProduct,
      }),
    }),
    deleteProductCategory: builder.mutation({
      query: (id) => ({
        url: `productCategory/${id}`,
        method: "DELETE",
      }),
    }),
    updateProductCategory: builder.mutation({
      query: (newProductCategory) => {
        const id = newProductCategory.id;
        const updatedProductCategory = { ...newProductCategory };
        delete updatedProductCategory.id;
        return {
          url: `product/${id}`,
          method: "PUT",
          body: updatedProductCategory,
        };
      },
    }),
    getProductCategory: builder.query<ProductCategoryItem[], void>({
      query: () => ({
        url: "productCategory",
        method: "GET",
      }),
    }),
    getProductCategoryById: builder.query<
      ProductCategoryItem,
      { productCategoryId: string | number }
    >({
      query: (arg: { productCategoryId: string | number }) => ({
        url: `productCategory/${arg.productCategoryId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateProductCategoryMutation,
  useGetProductCategoryQuery,
  useGetProductCategoryByIdQuery,
  useLazyGetProductCategoryByIdQuery,
  useUpdateProductCategoryMutation,
  useDeleteProductCategoryMutation,
} = productCategoryApi;
