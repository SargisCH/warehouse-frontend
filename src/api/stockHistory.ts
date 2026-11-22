import { toQueryString } from "helpers/money";
import { TransferKind } from "types";
import { api } from "./api";

export type StockHistoryScope = "product" | "warehouse";
export type StockHistoryKind =
  | TransferKind
  | "SALE"
  | "SALE_RETURN"
  | "SUPPLY"
  | "ADJUSTMENT";

export type StockHistoryRow = {
  id: number;
  productId: number;
  product: string | null;
  sku: string | null;
  unit: string | null;
  kind: StockHistoryKind;
  quantity: string;
  date: string;
  documentId: number | null;
  documentCode: string | null;
  documentAvailable: boolean;
  reversed: boolean;
  fromWarehouseId: number | null;
  fromWarehouse: string | null;
  toWarehouseId: number | null;
  toWarehouse: string | null;
  fromManagerId: number | null;
  fromManager: string | null;
  toManagerId: number | null;
  toManager: string | null;
  beforeQuantity: string | null;
  afterQuantity: string | null;
};

type StockHistoryResult = {
  entity: { id: number; name: string | null };
  rows: StockHistoryRow[];
  hasMore: boolean;
  summary: { sold: string; returned: string } | null;
};

type StockHistoryQuery = {
  scope: StockHistoryScope;
  id: string;
  page: number;
  dateFrom?: string;
  dateTo?: string;
  kind?: string;
  searchTerm?: string;
};

const stockHistoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStockHistory: builder.query<StockHistoryResult, StockHistoryQuery>({
      query: ({ scope, id, ...filters }) => ({
        url: `stock-history/${scope}/${id}?${toQueryString(filters)}`,
      }),
    }),
  }),
});

export const { useGetStockHistoryQuery } = stockHistoryApi;
