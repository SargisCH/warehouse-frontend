import {
  Box,
  Collapse,
  Flex,
  HStack,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { routeAccess } from "helpers/routeAccess";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { RootState } from "store/store";
import { RouteTypeExtended } from "types";

type Props = {
  route: RouteTypeExtended;
  isGroup?: boolean;
};

export default function SidebarLink({ route, isGroup }: Props) {
  const { isOpen, onToggle } = useDisclosure();
  let activeIcon = useColorModeValue("brand.500", "white");
  let textColor = useColorModeValue("secondaryGray.500", "white");
  let brandColor = useColorModeValue("brand.500", "brand.400");
  let activeColor = useColorModeValue("gray.700", "white");
  let inactiveColor = useColorModeValue(
    "secondaryGray.600",
    "secondaryGray.600",
  );
  const { t } = useTranslation();
  let location = useLocation();
  const activeRoute = (routeName: string) => {
    return location.pathname === routeName;
  };
  const user = useSelector((state: RootState) => state.user);

  const getLink = (routeArg: RouteTypeExtended, isGroup = false) => {
    if (
      routeArg.layout === "/admin" ||
      routeArg.layout === "/auth" ||
      routeArg.layout === "/rtl"
    ) {
      const isActiveRoute = activeRoute(routeArg.layout + routeArg.path);
      return (
        <NavLink key={routeArg.path} to={routeArg.layout + routeArg.path}>
          {routeArg.icon ? (
            <Box>
              <HStack
                spacing={isActiveRoute ? "22px" : "26px"}
                py="5px"
                ps="10px"
              >
                <Flex w="100%" alignItems="center" justifyContent="center">
                  <Box
                    ml={isGroup ? 4 : 0}
                    color={isActiveRoute ? activeIcon : textColor}
                    me="18px"
                  >
                    {routeArg.icon}
                  </Box>
                  <Text
                    me="auto"
                    color={isActiveRoute ? activeColor : textColor}
                    fontWeight={isActiveRoute ? "bold" : "normal"}
                  >
                    {routeArg.translationKey
                      ? t(`common.${routeArg.translationKey}`)
                      : routeArg.name}
                  </Text>
                </Flex>
                <Box
                  h="36px"
                  w="4px"
                  bg={isActiveRoute ? brandColor : "transparent"}
                  borderRadius="5px"
                />
              </HStack>
            </Box>
          ) : (
            <Box>
              <HStack
                spacing={isActiveRoute ? "22px" : "26px"}
                py="5px"
                ps="10px"
              >
                <Box color={isActiveRoute ? activeIcon : textColor} me="18px">
                  {routeArg.icon}
                </Box>
                <Text
                  me="auto"
                  color={isActiveRoute ? activeColor : inactiveColor}
                  fontWeight={isActiveRoute ? "bold" : "normal"}
                >
                  {routeArg.translationKey
                    ? t(`common.${routeArg.translationKey}`)
                    : routeArg.name}
                </Text>
                <Box h="36px" w="4px" bg="brand.400" borderRadius="5px" />
              </HStack>
            </Box>
          )}
        </NavLink>
      );
    }
    return null;
  };
  if (isGroup) {
    return (
      <div>
        <Box>
          <HStack spacing={isOpen ? "22px" : "26px"} py="5px" ps="10px">
            <Text
              me="auto"
              style={{ cursor: "pointer" }}
              onClick={onToggle}
              color={isOpen ? activeColor : inactiveColor}
            >
              {route.translationKey
                ? t(`common.${route.translationKey}`)
                : route.groupName}
            </Text>
          </HStack>
        </Box>
        <Collapse in={isOpen} animateOpacity>
          {route.nestedRoutes.map((nestedRoute: RouteTypeExtended) => {
            const hasAccess = routeAccess(user, nestedRoute);
            if (!hasAccess) return null;
            return getLink(nestedRoute, true);
          })}
        </Collapse>
      </div>
    );
  }
  return getLink(route);
}
