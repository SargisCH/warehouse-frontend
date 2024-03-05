import { api } from "./api";
import { ProductItem } from "./product";

export enum PaymentType {
  CASH = "CASH",
  TRANSFER = "TRANSFER",
  CREDIT = "CREDIT",
  PARTIAL_CREDIT = "PARTIAL CREDIT",
}

export type ClientType = {
  id?: number;
  name: string;
  companyCode: string;
  companyType: string;
  companyId: string;
  taxId?: string;
  accountNumber: string;
  bankAccountNumber: string;
  legalAddress: string;
  address: string;
  phoneNumber: string;
  otherPhoneNumber: string;
  email: string;
  contactPerson: string;
  updated_at?: string;
  created_at?: string;
};
export interface SaleType {
  id?: number;
  clientId: number;
  client?: ClientType;
  partialCreditAmount?: number;
  saleItems: Array<{
    productId: number;
    product?: ProductItem;
    price: number;
    priceUnit: string;
    amount: number;
    amountUnit: string;
  }>;
  paymentType: PaymentType;
  updated_at?: string;
  created_at?: string;
}

interface SaleReturnType extends SaleType {
  id: number;
}

const clientApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createClient: builder.mutation({
      query: (newClient: ClientType) => ({
        url: "client/create",
        method: "POST",
        body: newClient,
      }),
    }),
    deleteClient: builder.mutation({
      query: (id) => ({
        url: `client/${id}`,
        method: "DELETE",
      }),
    }),
    updateClient: builder.mutation({
      query: (newClient) => {
        const id = newClient.id;
        const updatedClient = { ...newClient };
        delete updatedClient.id;
        return {
          url: `product/${id}`,
          method: "PUT",
          body: updatedClient,
        };
      },
    }),
    getClient: builder.query<ClientType[], void>({
      query: () => ({
        url: "client",
        method: "GET",
      }),
    }),
    getClientById: builder.query<ClientType, { clientId: string | number }>({
      query: (arg: { clientId: string | number }) => ({
        url: `client/${arg.clientId}`,
        method: "GET",
      }),
    }),
    addSale: builder.mutation({
      query: (newSale: SaleType) => ({
        url: "sale/create",
        method: "POST",
        body: newSale,
      }),
    }),
    getSaleById: builder.query<SaleType, { id: string | number }>({
      query: (arg: { id: string | number }) => ({
        url: `sale/${arg.id}`,
        method: "GET",
      }),
    }),
    getSale: builder.query<
      { saleList: SaleReturnType[]; totalPages: number }[],
      { query: string }
    >({
      query: ({ query }: { query: string }) => ({
        url: `sale/${query}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateClientMutation,
  useGetClientQuery,
  useLazyGetClientQuery,
  useGetClientByIdQuery,
  useLazyGetClientByIdQuery,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useAddSaleMutation,
  useLazyGetSaleByIdQuery,
  useGetSaleByIdQuery,
  useGetSaleQuery,
} = clientApi;
