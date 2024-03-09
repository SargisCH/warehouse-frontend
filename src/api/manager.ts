import { api } from "./api";
import { ClientType } from "./client";

export type ManagerType = {
  id?: number;
  name: string;
  phoneNumber: string;
  email: string;
  clients?: ClientType[];
  updated_at?: string;
  created_at?: string;
};

const ManagerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createManager: builder.mutation({
      query: (newManager: ManagerType) => ({
        url: "manager/create",
        method: "POST",
        body: newManager,
      }),
    }),
    deleteManger: builder.mutation({
      query: (id) => ({
        url: `manager/${id}`,
        method: "DELETE",
      }),
    }),
    updateManager: builder.mutation({
      query: (newManager) => {
        const id = newManager.id;
        const updatedManager = { ...newManager };
        delete updatedManager.id;
        return {
          url: `manager/${id}`,
          method: "PUT",
          body: updatedManager,
        };
      },
    }),
    getManager: builder.query<ManagerType[], void>({
      query: () => ({
        url: "manager",
        method: "GET",
      }),
    }),
    getManagerById: builder.query<ManagerType, { managerId: string | number }>({
      query: (arg: { managerId: string | number }) => ({
        url: `manager/${arg.managerId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetManagerQuery,
  useLazyGetManagerQuery,
  useGetManagerByIdQuery,
  useLazyGetManagerByIdQuery,
  useUpdateManagerMutation,
  useCreateManagerMutation,
  useDeleteMangerMutation,
} = ManagerApi;
