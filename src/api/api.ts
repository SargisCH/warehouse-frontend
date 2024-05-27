import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "config";
import { fetchAuthSession } from "aws-amplify/auth";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
const baseQueryAuthorized: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const authRes = await fetchAuthSession();
  const headers: { Authorization?: string } = {};
  const fetchArgs = args as FetchArgs;
  if (
    !fetchArgs.url.includes("register") &&
    !fetchArgs.url.includes("verify-email") &&
    !fetchArgs.url.includes("change-password")
  ) {
    headers.Authorization = "Bearer " + authRes.tokens.accessToken.toString();
  }
  console.log("base url", API_BASE_URL);
  const res = await fetchBaseQuery({
    baseUrl: API_BASE_URL,
    headers,
  })(args, api, extraOptions);
  return res;
};

// initialize an empty api service that we'll inject endpoints into later as needed
export const api = createApi({
  baseQuery: baseQueryAuthorized,
  endpoints: () => ({}),
});
