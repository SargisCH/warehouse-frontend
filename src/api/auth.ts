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
    getUser: builder.mutation({
      query: (email: string) => ({
        url: "auth/get-user",
        method: "POST",
        body: { email },
      }),
    }),
  }),
});

export const createUserDataSelector = (email: string) => {
  console.log("email", email);
  if (!email) {
    console.log("empty");
    return () => ({});
  } else {
    console.log("aaaaaa", email);
    return authApi.endpoints.getUser.select(email);
  }
};

export const { useSignUpMutation, useVerifyEmailMutation, useGetUserMutation } =
  authApi;
