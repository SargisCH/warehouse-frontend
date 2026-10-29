// Chakra imports
import {
  Flex,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card";
import { routeAccess } from "helpers/routeAccess";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import routes from "routes";
import { RootState } from "store/store";
import { RouteTypeExtended } from "types";

const DASHBOARD_PATH = "/default";

// Route groups (Pahest) are rendered as a header in the sidebar, but a quick link
// has to point somewhere, so groups are replaced by their nested routes here.
const flattenRoutes = (list: RouteTypeExtended[]): RouteTypeExtended[] =>
  list.reduce<RouteTypeExtended[]>(
    (acc, route) =>
      Array.isArray(route.nestedRoutes)
        ? acc.concat(route.nestedRoutes)
        : acc.concat(route),
    [],
  );

export default function QuickLinks() {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.user);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const iconColor = useColorModeValue("brand.500", "white");
  const iconBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const hoverBorder = useColorModeValue("brand.500", "brand.400");

  const links = flattenRoutes(routes as RouteTypeExtended[]).filter(
    (route) =>
      route.layout === "/admin" &&
      route.path !== DASHBOARD_PATH &&
      routeAccess(user, route),
  );

  if (!links.length) return null;

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3, "2xl": 4 }} gap="20px">
      {links.map((route) => (
        <NavLink key={route.path} to={route.layout + route.path}>
          <Card
            py="20px"
            h="100%"
            transition="border-color .2s, transform .2s"
            border="2px solid transparent"
            _hover={{ borderColor: hoverBorder, transform: "translateY(-2px)" }}
          >
            <Flex align="center">
              <Flex
                align="center"
                justify="center"
                w="56px"
                h="56px"
                minW="56px"
                bg={iconBg}
                color={iconColor}
                borderRadius="16px"
                fontSize="22px"
                me="18px"
              >
                {route.icon}
              </Flex>
              <Text color={textColor} fontSize="lg" fontWeight="700">
                {route.translationKey
                  ? t(`common.${route.translationKey}`)
                  : route.name}
              </Text>
            </Flex>
          </Card>
        </NavLink>
      ))}
    </SimpleGrid>
  );
}
