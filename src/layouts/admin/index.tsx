// Chakra imports
import { Box, useDisclosure } from "@chakra-ui/react";
import Footer from "components/footer/FooterAdmin";
// Layout components
import Navbar from "components/navbar/NavbarAdmin";
import Sidebar from "components/sidebar/Sidebar";
import { SidebarContext } from "contexts/SidebarContext";
import { useEffect, useState } from "react";
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
} from "react-router-dom";
import routes from "routes";
import { RouteTypeExtended } from "types";

// Custom Chakra theme
export default function Dashboard(props: { [x: string]: any }) {
  const { ...rest } = props;
  // states and functions
  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  // functions for changing the states from components
  const history = useHistory();
  const location = useLocation();
  if (!props.userEmail) {
    history.push(`/auth/sign-in?next=${location.pathname}${location.search}`);
  }

  const getRoute = () => {
    return window.location.pathname !== "/admin/full-screen-maps";
  };
  const getActiveRoute = (routes: RoutesType[]): string => {
    let activeRoute = "Default Brand Text";
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].name;
      }
    }
    return activeRoute;
  };
  const getActiveNavbar = (routes: RoutesType[]): boolean => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].secondary;
      }
    }
    return activeNavbar;
  };
  const getActiveNavbarText = (routes: RoutesType[]): string | boolean => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].name;
      }
    }
    return activeNavbar;
  };
  const getRoutes = (routes: RouteTypeExtended[]): any => {
    return routes.map((route: RouteTypeExtended, key: any) => {
      if (route.nestedRoutes) {
        return route.nestedRoutes.map((nestedRoute: RouteTypeExtended) => {
          if (nestedRoute.layout === "/admin") {
            return (
              <Route
                path={nestedRoute.layout + nestedRoute.path}
                component={nestedRoute.component}
                key={key}
              />
            );
          } else {
            return null;
          }
        });
      }
      if (route.layout === "/admin") {
        return (
          <Route
            path={route.layout + route.path}
            component={route.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  useEffect(() => {}, []);
  document.documentElement.dir = "ltr";
  const { onOpen } = useDisclosure();

  return (
    <Box>
      <SidebarContext.Provider
        value={{
          toggleSidebar,
          setToggleSidebar,
        }}
      >
        <Sidebar routes={routes} display="none" {...rest} />
        <Box
          float="right"
          height="100vh"
          overflow="auto"
          position="relative"
          maxHeight="100%"
          w={{ base: "100%", xl: "calc( 100% - 290px )" }}
          maxWidth={{ base: "100%", xl: "calc( 100% - 290px )" }}
          transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
          transitionDuration=".2s, .2s, .35s"
          transitionProperty="top, bottom, width"
          transitionTimingFunction="linear, linear, ease"
        >
          <Box>
            <Navbar
              onOpen={onOpen}
              logoText={"Horizon UI Dashboard PRO"}
              brandText={getActiveRoute(routes)}
              secondary={getActiveNavbar(routes)}
              message={getActiveNavbarText(routes)}
              fixed={fixed}
              {...rest}
            />
          </Box>
          {getRoute() ? (
            <Box
              mx="auto"
              p={{ base: "20px", md: "30px" }}
              pe="20px"
              minH="calc(100vh - 160px)"
              pt="50px"
              background={"#f8f9fc"}
            >
              <Switch>
                {getRoutes(routes)}
                <Redirect from="/admin" to="/admin/default" />
              </Switch>
            </Box>
          ) : null}
          <Box background={"#f8f9fc"}>
            <Footer />
          </Box>
        </Box>
      </SidebarContext.Provider>
    </Box>
  );
}
