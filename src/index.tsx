import React, { ReactPortal, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./assets/css/App.css";
import { Route, Switch, Redirect, BrowserRouter } from "react-router-dom";
import AuthLayout from "./layouts/auth";
import AdminLayout from "./layouts/admin";
import RTLLayout from "./layouts/rtl";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme/theme";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./store/store";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";
import { useGetUserMutation } from "api/auth";
import { setUserData } from "store/slices/userSlice";
import { RootState } from "store/store";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import common_am from "./translations/am/common.json";
import common_en from "./translations/en/common.json";
import FullPageLoader from "components/fullPageLoader/FullPageLoader";

i18next.init(
  {
    interpolation: { escapeValue: false }, // React already does escaping
    fallbackLng: "am",
    resources: {
      en: {
        translation: {
          common: common_en, // 'common' is our custom namespace
        },
      },
      am: {
        translation: {
          common: common_am,
        },
      },
    },
  },
  (err, t) => {
    // You can use this callback to perform actions once the translations are loaded
    if (err) return console.error("Error loading translations:", err);
    console.log("Translations loaded");
  },
);

interface Props {
  userEmail: string;
  children: React.ReactNode;
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: "ngltvt3dbqp86piipjoeic9cc",
      userPoolId: "us-east-1_QsJSsFk4H",
    },
  },
});

function App() {
  const [isAmplifyLoading, setIsAmplifyLoading] = useState(false);
  const [getUser, { data, status: resStatus, isLoading }] =
    useGetUserMutation();
  const dispatch = useDispatch();
  const userEmail = useSelector((state: RootState) => state.user.email);
  console.log("cache check");
  useEffect(() => {
    (async () => {
      //if user data already persist exit out of the function
      if (userEmail) return;
      try {
        setIsAmplifyLoading(true);
        const res = await fetchAuthSession({ forceRefresh: true });
        const email = res?.tokens?.idToken?.payload?.email || "";
        setIsAmplifyLoading(false);
        if (email) {
          getUser(email as string);
        }
      } catch (e: any) {
        console.log("eeeeeee", e);
      }
    })();
  }, [getUser, userEmail]);
  useEffect(() => {
    if (data && data.email && resStatus === "fulfilled") {
      dispatch(setUserData(data));
    }
  }, [resStatus, data, dispatch]);
  return (
    <>
      <BrowserRouter>
        <Switch>
          <Route
            path={`/auth`}
            component={() => <AuthLayout userEmail={data?.email || ""} />}
          />
          <Route
            path={`/admin`}
            component={() => (
              <AdminLayout userEmail={data?.email || userEmail || ""} />
            )}
          />

          <Route path={`/rtl`} component={RTLLayout} />
          <Redirect from="/" to="/admin" />
        </Switch>
      </BrowserRouter>
      {isAmplifyLoading || isLoading ? <FullPageLoader /> : null}
    </>
  );
}

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <React.StrictMode>
      <Provider store={store}>
        <I18nextProvider i18n={i18next}>
          <App />
        </I18nextProvider>
      </Provider>
    </React.StrictMode>
  </ChakraProvider>,
  document.getElementById("root"),
);
