import { api } from "./api";

export type Unit = {
  id: number;
  name: string;
};

const unitApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUnits: builder.query<Unit[], void>({
      query: () => ({
        url: "unit",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetUnitsQuery } = unitApi;
