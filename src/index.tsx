import React, { ReactPortal, useEffect } from "react";
import ReactDOM from "react-dom";
import "./assets/css/App.css";
import {
  HashRouter,
  Route,
  Switch,
  Redirect,
  useHistory,
} from "react-router-dom";
import AuthLayout from "./layouts/auth";
import AdminLayout from "./layouts/admin";
import RTLLayout from "./layouts/rtl";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme/theme";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store/store";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";
import { useGetUserMutation } from "api/auth";
import { links } from "routes";
import { setUserData } from "store/slices/userSlice";

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

const ProtectedRoute: React.FC<Props> = (props) => {
  console.log("sadsadsa", props);
  if (!props.userEmail) {
    return <Redirect to={"/auth/sign-in"} />;
  }
  return <>{props.children}</>;
};

const AuthRoute: React.FC<Props> = (props) => {
  if (props.userEmail) {
    return <Redirect from="/" to="/admin/default" />;
  }
  return <>{props.children}</>;
};

function App() {
  const [getUser, { data, status: resStatus }] = useGetUserMutation();
  const dispatch = useDispatch();
  console.log("aaaaa", data);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchAuthSession({ forceRefresh: true });
        const email = res?.tokens?.idToken?.payload?.email || "";
        if (email) {
          getUser(email as string);
        }
      } catch (e: any) {
        console.log("eeeee", e);
      }
    })();
  }, [getUser]);
  useEffect(() => {
    if (data && data.email && resStatus === "fulfilled") {
      dispatch(setUserData(data));
    }
  }, [resStatus, data, dispatch]);
  return (
    <HashRouter>
      <Switch>
        <AuthRoute userEmail={data?.email || ""}>
          <Route path={`/auth`} component={AuthLayout} />
        </AuthRoute>
        <ProtectedRoute userEmail={data?.email || ""}>
          <Route path={`/admin`} component={AdminLayout} />
        </ProtectedRoute>

        <Route path={`/rtl`} component={RTLLayout} />
        <Redirect from="/" to="/admin" />
      </Switch>
    </HashRouter>
  );
}

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  </ChakraProvider>,
  document.getElementById("root"),
);
