import { api } from "./api";

export type AssetCondition = "NEW" | "USED";
export type AssetEntryKind = "REPAIR" | "SALE" | "REFUND";

type CashInput = {
  id: string;
  date: string;
  amount: string;
  affectsCash: boolean;
};

type NewAsset = CashInput & {
  name: string;
  description?: string;
  condition: AssetCondition;
};

type NewAssetEntry = CashInput & {
  kind: AssetEntryKind;
  description: string;
};

type AssetRow = {
  id: string;
  name: string;
  condition: AssetCondition;
  acquiredOn: string;
  purchasePrice: string;
  sold: boolean;
};

export type AssetEntry = Omit<NewAssetEntry, "date"> & { documentDate: string };

type AssetDetails = Omit<AssetRow, "sold"> & {
  description: string | null;
  paidFromCash: boolean;
  totalSpent: string;
  history: AssetEntry[];
};

type CompanyCash = {
  balance: string;
  opening: string | null;
  trackingDate: string;
};

export type CompanyCashMovement = {
  id: string;
  kind: string;
  documentDate: string;
  amount: string;
  description: string | null;
  comment: string | null;
  returnOf: string | null;
  returned: boolean;
};

type CashEntryInput = {
  id: string;
  amount: string;
  description: string;
  comment: string;
  returnOf?: string;
};

const assetsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCompanyAssets: builder.query<AssetRow[], void>({
      query: () => ({ url: "company-assets" }),
      providesTags: ["CompanyAssets"],
    }),
    getCompanyAsset: builder.query<AssetDetails, string>({
      query: (id) => ({ url: `company-assets/${id}` }),
      providesTags: ["CompanyAssets"],
    }),
    getCompanyCash: builder.query<CompanyCash, void>({
      query: () => ({ url: "company-assets/cash" }),
      providesTags: ["CompanyCash"],
    }),
    getCompanyCashHistory: builder.query<CompanyCashMovement[], void>({
      query: () => ({ url: "company-assets/cash/history" }),
      providesTags: ["CompanyCash"],
    }),
    addCompanyCashEntry: builder.mutation<unknown, CashEntryInput>({
      query: (body) => ({
        url: "company-assets/cash/entries",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CompanyCash"],
    }),
    createCompanyAsset: builder.mutation<{ id: string }, NewAsset>({
      query: (body) => ({ url: "company-assets", method: "POST", body }),
      invalidatesTags: (_result, error) =>
        error ? [] : ["CompanyAssets", "CompanyCash"],
    }),
    addCompanyAssetEntry: builder.mutation<
      unknown,
      { assetId: string; body: NewAssetEntry }
    >({
      query: ({ assetId, body }) => ({
        url: `company-assets/${assetId}/entries`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, error) =>
        error ? [] : ["CompanyAssets", "CompanyCash"],
    }),
    setCompanyCashOpening: builder.mutation<CompanyCash, { amount: string }>({
      query: (body) => ({
        url: "company-assets/cash/opening",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, error) => (error ? [] : ["CompanyCash"]),
    }),
  }),
});

export const {
  useGetCompanyAssetsQuery,
  useGetCompanyAssetQuery,
  useGetCompanyCashQuery,
  useGetCompanyCashHistoryQuery,
  useAddCompanyCashEntryMutation,
  useCreateCompanyAssetMutation,
  useAddCompanyAssetEntryMutation,
  useSetCompanyCashOpeningMutation,
} = assetsApi;
