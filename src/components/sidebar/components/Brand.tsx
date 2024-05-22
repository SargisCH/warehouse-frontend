// Chakra imports
import { Flex, Image, useColorModeValue } from "@chakra-ui/react";

// Custom components
import { HorizonLogo } from "components/icons/Icons";
import { HSeparator } from "components/separator/Separator";
import { useSelector } from "react-redux";
import { RootState } from "store/store";

export function SidebarBrand() {
  //   Chakra color mode
  let logoColor = useColorModeValue("navy.700", "white");
  const { tenant } = useSelector((state: RootState) => state.user);
  return (
    <Flex alignItems="center" flexDirection="column">
      {tenant?.logo ? (
        <Image
          src={tenant.logo}
          alt="Uploaded Preview"
          boxSize="200px"
          objectFit="contain"
        />
      ) : (
        <h1>Logo</h1>
      )}
      <HSeparator mb="20px" />
    </Flex>
  );
}

export default SidebarBrand;
