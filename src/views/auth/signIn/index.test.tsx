import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";
import { signIn } from "aws-amplify/auth";
import { useGetUserMutation } from "api/auth";
import SignIn from "./index";

jest.mock("aws-amplify/auth", () => ({ signIn: jest.fn() }));
jest.mock("api/auth", () => ({ useGetUserMutation: jest.fn() }));
jest.mock("react-redux", () => ({ useDispatch: () => jest.fn() }));
jest.mock("layouts/auth/Default", () => ({ children }: any) => <>{children}</>);
jest.mock("components/fullPageLoader/FullPageLoader", () => () => (
  <div role="status">Signing in</div>
));

const getUser = jest.fn();
const unwrap = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  (useGetUserMutation as jest.Mock).mockReturnValue([
    getUser,
    { status: "uninitialized" },
  ]);
  getUser.mockReturnValue({ unwrap });
  unwrap.mockResolvedValue({ email: "user@example.com" });
  (signIn as jest.Mock).mockResolvedValue({
    isSignedIn: true,
    nextStep: { signInStep: "DONE" },
  });
});

function submit() {
  render(
    <ChakraProvider>
      <MemoryRouter>
        <SignIn />
      </MemoryRouter>
    </ChakraProvider>
  );
  fireEvent.change(screen.getByPlaceholderText("mail@simmmple.com"), {
    target: { value: "user@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), {
    target: { value: "wrong-password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
}

test("Cognito errors release the spinner and allow another attempt", async () => {
  (signIn as jest.Mock).mockRejectedValueOnce(
    new Error("Incorrect username or password.")
  );
  submit();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Incorrect username or password."
  );
  expect(screen.queryByRole("status")).toBeNull();
  expect(getUser).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
  await waitFor(() => expect(getUser).toHaveBeenCalledWith("user@example.com"));
  await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
});

test("backend errors are shown instead of leaving the login spinner running", async () => {
  unwrap.mockRejectedValueOnce({
    data: { message: "Warehouse API is unavailable." },
  });
  submit();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Warehouse API is unavailable."
  );
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("button", { name: "Sign In" })).toBeTruthy();
});

test("unsupported Cognito challenges show an explanation and release the spinner", async () => {
  (signIn as jest.Mock).mockResolvedValueOnce({
    isSignedIn: false,
    nextStep: { signInStep: "CONFIRM_SIGN_IN_WITH_TOTP_CODE" },
  });
  submit();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Additional sign-in verification is required."
  );
  expect(screen.queryByRole("status")).toBeNull();
  expect(getUser).not.toHaveBeenCalled();
});
