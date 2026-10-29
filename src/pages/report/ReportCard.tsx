import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { ReactNode } from "react";
import Card from "components/card/Card";

type Props = {
  title: string;
  actions?: ReactNode;
  filters: ReactNode;
  children: ReactNode;
};

/** Title, filter row, results - the frame every report page shares. */
export function ReportCard({ title, actions, filters, children }: Props) {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  return (
    <Card flexDirection="column" w="100%" px="0px" minHeight="500px">
      <Box px="25px" mb="12px">
        <Flex justify="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {title}
          </Text>
          {actions}
        </Flex>
        <Box mt="16px">{filters}</Box>
      </Box>
      <Box px="12px">{children}</Box>
    </Card>
  );
}
