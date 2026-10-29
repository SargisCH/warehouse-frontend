import { api } from "./api";
import { ClientGroup } from "types";

type ListArgs = {
  searchTerm?: string;
  sortKey?: string;
  sortOrder?: string;
};

const clientGroupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createClientGroup: builder.mutation({
      query: (newClientGroup: Partial<ClientGroup>) => ({
        url: "client-group",
        method: "POST",
        body: newClientGroup,
      }),
    }),
    deleteClientGroup: builder.mutation({
      query: (id) => ({
        url: `client-group/${id}`,
        method: "DELETE",
      }),
    }),
    updateClientGroup: builder.mutation({
      query: (newClientGroup: Partial<ClientGroup>) => {
        const { id, salesZoneName, ...updatedClientGroup } = newClientGroup;
        return {
          url: `client-group/${id}`,
          method: "PATCH",
          body: updatedClientGroup,
        };
      },
    }),
    getClientGroups: builder.query<ClientGroup[], ListArgs | void>({
      query: (arg: ListArgs = {}) => {
        const queryString = `searchTerm=${arg.searchTerm || ""}&sortKey=${
          arg.sortKey || ""
        }&sortOrder=${arg.sortOrder || ""}`;
        return {
          url: `client-group?${queryString}`,
          method: "GET",
        };
      },
    }),
    getClientGroupById: builder.query<
      ClientGroup,
      { clientGroupId: string | number }
    >({
      query: (arg: { clientGroupId: string | number }) => ({
        url: `client-group/${arg.clientGroupId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateClientGroupMutation,
  useGetClientGroupsQuery,
  useLazyGetClientGroupsQuery,
  useGetClientGroupByIdQuery,
  useLazyGetClientGroupByIdQuery,
  useUpdateClientGroupMutation,
  useDeleteClientGroupMutation,
} = clientGroupApi;
