import { api } from "./api";

export type ProductGroup = {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const productGroupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createProductGroup: builder.mutation({
      query: (newProductGroup) => ({
        url: "product_groups/create",
        method: "POST",
        body: newProductGroup,
      }),
    }),
    deleteProductGroup: builder.mutation({
      query: (id) => ({
        url: `product_groups/${id}`,
        method: "DELETE",
      }),
    }),
    updateProductGroup: builder.mutation({
      query: (newProductGroup) => {
        const id = newProductGroup.id;
        const updatedProductGroup = { ...newProductGroup };
        delete updatedProductGroup.id;
        return {
          url: `product_groups/${id}`,
          method: "PUT",
          body: updatedProductGroup,
        };
      },
    }),
    getProductGroup: builder.query<ProductGroup[], void>({
      query: () => ({
        url: "product_groups",
        method: "GET",
      }),
    }),
    getProductGroupById: builder.query<
      ProductGroup,
      { productGroupId: string | number }
    >({
      query: (arg: { productGroupId: string | number }) => ({
        url: `product_groups/${arg.productGroupId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateProductGroupMutation,
  useGetProductGroupQuery,
  useGetProductGroupByIdQuery,
  useLazyGetProductGroupByIdQuery,
  useUpdateProductGroupMutation,
  useDeleteProductGroupMutation,
} = productGroupApi;
