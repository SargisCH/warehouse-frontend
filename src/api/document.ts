import { api } from "./api";

export type DocumentType = {
  id?: number;
  name: string;
  updated_at?: string;
  created_at?: string;
};

const documentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createDocument: builder.mutation({
      query: (newDocument: DocumentType) => ({
        url: "document/create",
        method: "POST",
        body: newDocument,
      }),
    }),
    deleteDocument: builder.mutation({
      query: (id) => ({
        url: `document/${id}`,
        method: "DELETE",
      }),
    }),
    updateDocument: builder.mutation({
      query: (newDocument) => {
        const id = newDocument.id;
        const updatedDocument = { ...newDocument };
        delete updatedDocument.id;
        return {
          url: `document/${id}`,
          method: "PUT",
          body: updatedDocument,
        };
      },
    }),
    getDocument: builder.query<
      DocumentType[],
      {
        sortKey?: string;
        sortOrder?: string;
      } | void
    >({
      query: (
        arg: {
          sortKey?: string;
          sortOrder?: string;
        } = {},
      ) => {
        const queryString = `sortKey=${arg.sortKey || ""}&sortOrder=${arg.sortOrder || ""}`;
        return {
          url: `document?${queryString}`,
          method: "GET",
        };
      },
    }),
    getDocumentById: builder.query<DocumentType, { documentId: string | number }>({
      query: (arg: { documentId: string | number }) => ({
        url: `document/${arg.documentId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateDocumentMutation,
  useGetDocumentQuery,
  useLazyGetDocumentQuery,
  useGetDocumentByIdQuery,
  useLazyGetDocumentByIdQuery,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
} = documentApi;
