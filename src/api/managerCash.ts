import { api } from "./api";

type CashEntryInput = {
  id: string;
  managerId: number;
  kind: "OPENING" | "RECEIPT";
  documentDate?: string;
  amount: string;
  note?: string;
};

type ManagerCashEntry = Omit<CashEntryInput, "note"> & {
  managerCode: string;
  managerName: string;
  note: string | null;
  documentDate: string;
};

const managerCashApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getManagerCashHistory: builder.query<ManagerCashEntry[], void>({
      query: () => ({ url: "manager-cash", method: "GET" }),
      providesTags: ["ManagerCash"],
    }),
    createManagerCashEntry: builder.mutation<unknown, CashEntryInput>({
      query: (body) => ({ url: "manager-cash", method: "POST", body }),
      invalidatesTags: (_result, error) => (error ? [] : ["ManagerCash", "CompanyCash"]),
    }),
  }),
});

export const {
  useGetManagerCashHistoryQuery,
  useCreateManagerCashEntryMutation,
} = managerCashApi;
