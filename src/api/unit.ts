import { api } from "./api";

export type Unit = {
  id: number;
  name: string;
};

const unitApi = api
  .enhanceEndpoints({ addTagTypes: ["Units"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      createUnit: builder.mutation<Unit, { name: string }>({
        query: (body) => ({ url: "unit", method: "POST", body }),
        invalidatesTags: (result, error) => (error ? [] : ["Units"]),
      }),
      getUnits: builder.query<Unit[], void>({
        providesTags: ["Units"],
        query: () => ({
          url: "unit",
          method: "GET",
        }),
      }),
    }),
  });

export const { useGetUnitsQuery, useCreateUnitMutation } = unitApi;
