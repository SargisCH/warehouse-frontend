import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  useBreakpointValue,
} from "@chakra-ui/react";

export default function Inventory() {
  const layout = useBreakpointValue({
    base: "mobile",
    md: "tablet",
    lg: "desktop",
  });
  const direction = ["tablet", "mobile"].includes(layout) ? "column" : "row";

  return (
    <Box>
      <h1>Inventory</h1>
      <Flex>
        <Flex direction={direction} gap="20px">
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input type="text" placeholder="Name" />
          </FormControl>
          <FormControl>
            <FormLabel>Amount</FormLabel>
            <Input type="number" placeholder="Amount" />
          </FormControl>
          <FormControl>
            <FormLabel>Amount unit</FormLabel>
            <Input type="text" placeholder="Amount" />
          </FormControl>
          <FormControl>
            <FormLabel>Amount unit</FormLabel>
            <Input type="text" placeholder="Amount" />
          </FormControl>
          <FormControl>
            <FormLabel>Amount unit</FormLabel>
            <Input type="text" placeholder="Amount" />
          </FormControl>
          <FormControl>
            <FormLabel>Amount unit</FormLabel>
            <Input type="text" placeholder="Amount" />
          </FormControl>
        </Flex>
      </Flex>
    </Box>
  );
}
