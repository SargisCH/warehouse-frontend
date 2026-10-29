import { api } from "./api";
import { Manager } from "types";

type ListArgs = {
  searchTerm?: string;
  sortKey?: string;
  sortOrder?: string;
};

const managerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createManager: builder.mutation({
      query: (newManager: Partial<Manager>) => ({
        url: "manager",
        method: "POST",
        body: newManager,
      }),
    }),
    deleteManager: builder.mutation({
      query: (id) => ({
        url: `manager/${id}`,
        method: "DELETE",
      }),
    }),
    updateManager: builder.mutation({
      query: (newManager: Partial<Manager>) => {
        // «Կոդ» and the joined-in labels are server-owned, so they never go back.
        const {
          id,
          code,
          salesZoneName,
          delivererCode,
          delivererName,
          ...updatedManager
        } = newManager;
        return {
          url: `manager/${id}`,
          method: "PATCH",
          body: updatedManager,
        };
      },
    }),
    getManagers: builder.query<Manager[], ListArgs | void>({
      query: (arg: ListArgs = {}) => {
        const queryString = `searchTerm=${arg.searchTerm || ""}&sortKey=${
          arg.sortKey || ""
        }&sortOrder=${arg.sortOrder || ""}`;
        return {
          url: `manager?${queryString}`,
          method: "GET",
        };
      },
    }),
    getManagerById: builder.query<Manager, { managerId: string | number }>({
      query: (arg: { managerId: string | number }) => ({
        url: `manager/${arg.managerId}`,
        method: "GET",
      }),
    }),
    // Who can be an «առաքիչ»: every manager of the tenant.
    getDeliverers: builder.query<Manager[], void>({
      query: () => ({
        url: "manager/deliverers",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateManagerMutation,
  useGetManagersQuery,
  useLazyGetManagersQuery,
  useGetManagerByIdQuery,
  useLazyGetManagerByIdQuery,
  useUpdateManagerMutation,
  useDeleteManagerMutation,
  useGetDeliverersQuery,
} = managerApi;
