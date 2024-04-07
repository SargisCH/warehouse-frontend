import { Flex, Spinner } from "@chakra-ui/react";
import React from "react";

export default function FullPageLoader() {
  return (
    <Flex
      position={"absolute"}
      zIndex={2}
      left={"0"}
      top={"0"}
      width="100%"
      height="100vh"
      justifyContent={"center"}
      alignItems="center"
      backgroundColor={"white"}
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    </Flex>
  );
}
