import { api } from "./api";

export type SIgnUpUseritem = {
  email: string;
  companyName: string;
  password: string;
};
export type VerifyEmailCode = {
  email: string;
  code: string;
};
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signUp: builder.mutation({
      query: (userData: SIgnUpUseritem) => ({
        url: "auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    verifyEmail: builder.mutation({
      query: (codeRequest: VerifyEmailCode) => ({
        url: "auth/verify-email",
        method: "POST",
        body: codeRequest,
      }),
    }),
  }),
});

export const { useSignUpMutation, useVerifyEmailMutation } = authApi;
