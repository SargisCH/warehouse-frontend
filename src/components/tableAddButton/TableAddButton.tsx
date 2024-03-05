import { Box, Link as ChakraLink } from "@chakra-ui/react";
import Menu from "../menu/MainMenu";
import { Link as ReactRouterLink } from "react-router-dom";

export const TableAddButton = ({
  link,
  label,
}: {
  link: string;
  label: string;
}) => {
  return (
    <Box display={"flex"} justifyContent="flex-end" alignItems={"center"}>
      <ChakraLink
        color="teal.500"
        to={link}
        as={ReactRouterLink}
        marginRight="10px"
        _hover={{
          textDecoration: "underline",
        }}
      >
        {label}
      </ChakraLink>
    </Box>
  );
};
