import { api } from "./api";
import { toQueryString } from "helpers/money";
import { StockTransfer, TransferKind } from "types";

export type StockTransferFilters = {
  kind: TransferKind;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  warehouseId?: string;
  managerId?: string;
};

export type CreateStockTransferInput = {
  kind: TransferKind;
  documentDate?: string;
  fromWarehouseId?: number;
  toWarehouseId?: number;
  fromManagerId?: number;
  toManagerId?: number;
  sender?: string;
  receiver?: string;
  priceListId?: number;
  note?: string;
  allowNegativeStock?: boolean;
  requireAvailableStock?: boolean;
  items: Array<{ productId: number; quantity: string; price?: string }>;
};

const stockTransferApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStockTransfers: builder.query<StockTransfer[], StockTransferFilters>({
      providesTags: ["StockTransfers"],
      query: (filters) => ({
        url: `stock-transfer?${toQueryString(filters)}`,
        method: "GET",
      }),
    }),
    getStockTransferById: builder.query<
      StockTransfer,
      { transferId: string | number }
    >({
      query: (arg) => ({
        url: `stock-transfer/${arg.transferId}`,
        method: "GET",
      }),
    }),
    createStockTransfer: builder.mutation({
      invalidatesTags: (_result, error) =>
        error ? [] : ["StockTransfers", "ManagerStock", "WarehouseStock"],
      query: (body: CreateStockTransferInput) => ({
        url: "stock-transfer",
        method: "POST",
        body,
      }),
    }),
    deleteStockTransfer: builder.mutation({
      invalidatesTags: (_result, error) =>
        error ? [] : ["StockTransfers", "ManagerStock", "WarehouseStock"],
      query: (id: number | string) => ({
        url: `stock-transfer/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetStockTransfersQuery,
  useLazyGetStockTransferByIdQuery,
  useCreateStockTransferMutation,
  useDeleteStockTransferMutation,
} = stockTransferApi;
