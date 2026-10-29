import { api } from "./api";
import { toQueryString } from "helpers/money";
import {
  GroupDimension,
  Measure,
  ReportResponse,
  SalesReportFilters,
} from "types";

const reportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // «Վաճառքների վերլուծություն»
    getSalesAnalysis: builder.query<
      ReportResponse,
      SalesReportFilters & { dateFrom: string; dateTo: string }
    >({
      query: (filters) => ({
        url: `report/sales-analysis?${toQueryString(filters)}`,
        method: "GET",
      }),
    }),
    // «Վաճառքների համեմատական» - a POST, since periods and groupings nest.
    getSalesComparison: builder.mutation<
      ReportResponse & {
        periods: Array<{ from: string; to: string }>;
        groupBy: GroupDimension[];
        measures: Measure[];
      },
      SalesReportFilters & {
        periods: Array<{ from: string; to: string }>;
        groupBy: GroupDimension[];
        measures: Measure[];
        includeZeroRows?: boolean;
        sortBy?: "label" | "value";
        explodeKits?: boolean;
      }
    >({
      query: (body) => ({
        url: "report/sales-comparison",
        method: "POST",
        body,
      }),
    }),
    // «Ըստ գնորդի քաղվածք»
    getClientStatement: builder.query<
      ReportResponse & {
        client: { id: number; code: string; name: string };
        opening: string;
        closing: string;
      },
      { clientId: string; dateFrom: string; dateTo: string }
    >({
      query: (filters) => ({
        url: `report/client-statement?${toQueryString(filters)}`,
        method: "GET",
      }),
    }),
    // «Ըստ գնորդի մնացորդներ»
    getClientBalances: builder.query<
      ReportResponse & { date: string },
      {
        date?: string;
        clientGroupId?: string;
        managerId?: string;
        salesZoneId?: string;
      }
    >({
      query: (filters) => ({
        url: `report/client-balances?${toQueryString(filters)}`,
        method: "GET",
      }),
    }),
    // «Ըստ մենեջերի մնացորդներ»
    getManagerBalances: builder.query<
      ReportResponse & { date: string },
      { date?: string }
    >({
      query: (filters) => ({
        url: `report/manager-balances?${toQueryString(filters)}`,
        method: "GET",
      }),
    }),
    // «Ըստ մենեջերի ապրանքի մնացորդ»
    getManagerStockReport: builder.query<
      ReportResponse,
      { managerId?: string; productGroupId?: string }
    >({
      query: (filters) => ({
        url: `report/manager-stock?${toQueryString(filters)}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetSalesAnalysisQuery,
  useLazyGetSalesAnalysisQuery,
  useGetSalesComparisonMutation,
  useLazyGetClientStatementQuery,
  useGetClientBalancesQuery,
  useGetManagerBalancesQuery,
  useGetManagerStockReportQuery,
} = reportApi;
