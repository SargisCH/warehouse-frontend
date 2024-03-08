import React, { ReactPortal, useEffect } from "react";
import ReactDOM from "react-dom";
import "./assets/css/App.css";
import {
  HashRouter,
  Route,
  Switch,
  Redirect,
  useHistory,
  BrowserRouter,
} from "react-router-dom";
import AuthLayout from "./layouts/auth";
import AdminLayout from "./layouts/admin";
import RTLLayout from "./layouts/rtl";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme/theme";
import { Provider, useDispatch ,useSelector} from "react-redux";
import { store } from "./store/store";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";
import { useGetUserMutation } from "api/auth";
import { links } from "routes";
import { setUserData } from "store/slices/userSlice";
import { RootState } from "store/store";


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
  const [getUser, { data, status: resStatus }] = useGetUserMutation();
  const dispatch = useDispatch();


  const userEmail = useSelector((state: RootState) => state.user.email);
  useEffect(() => {
    (async () => {
        //if user data already persist exit out of the function
        if (userEmail) return;
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
  }, [getUser,userEmail]);
  
  useEffect(() => {
    if (data && data.email && resStatus === "fulfilled") {
      dispatch(setUserData(data));
      console.log(data,"lop")
    }
  }, [resStatus, data, dispatch]);
  return (
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
