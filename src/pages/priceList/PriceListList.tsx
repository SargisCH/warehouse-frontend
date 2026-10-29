import { useEffect } from "react";
import {
  Badge,
  Box,
  Flex,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import * as React from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetPriceListsQuery } from "api/priceList";
import Card from "components/card/Card";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import { links } from "routes";

let searchTimeoutId: ReturnType<typeof setTimeout>;

function PriceListList() {
  const { t } = useTranslation();
  const history = useHistory();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchFilter, setSearchFilter] = React.useState("");

  const { data: priceLists = [], refetch } = useGetPriceListsQuery({
    searchTerm: searchFilter,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleSearchTermChange = (e: any) => {
    setSearchTerm(e.target.value);
    clearTimeout(searchTimeoutId);
    searchTimeoutId = setTimeout(() => setSearchFilter(e.target.value), 500);
  };

  const headers = [
    t("common.priceList.code"),
    t("common.priceList.name"),
    t("common.priceList.isDefault"),
    t("common.priceList.isClosed"),
  ];

  return (
    <Card
      flexDirection="column"
      w="100%"
      px="0px"
      overflowX={{ sm: "scroll", lg: "hidden" }}
      minHeight="500px"
      position={"static"}
    >
      <Box px="25px" mb="8px">
        <Flex justifyContent="space-between">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            {t("common.priceList.priceListList")}
          </Text>
          <TableAddButton
            label={t("common.priceList.addPriceList")}
            link={links.createPriceList}
          />
        </Flex>
        <Flex marginTop="20px">
          <Box width="200px">
            <Input
              placeholder={t("common.searchTerm")}
              value={searchTerm}
              onChange={handleSearchTermChange}
            />
          </Box>
        </Flex>
      </Box>
      <Box>
        <Table variant="simple" color="gray.500" mb="24px" mt="12px">
          <Thead>
            <Tr>
              {headers.map((label) => (
                <Th key={label} pe="10px" borderColor={borderColor}>
                  <Text fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
                    {label.toUpperCase()}
                  </Text>
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {priceLists.map((priceList) => (
              <Tr
                key={priceList.id}
                cursor="pointer"
                onClick={() => history.push(links.priceList(priceList.id))}
              >
                <Td borderColor="transparent">
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    {priceList.code}
                  </Text>
                </Td>
                <Td borderColor="transparent">
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    {priceList.name}
                  </Text>
                </Td>
                <Td borderColor="transparent">
                  {priceList.isDefault ? (
                    <Badge colorScheme="green">{t("common.yes")}</Badge>
                  ) : (
                    <Text fontSize="sm">—</Text>
                  )}
                </Td>
                <Td borderColor="transparent">
                  {priceList.isClosed ? (
                    <Badge colorScheme="red">{t("common.yes")}</Badge>
                  ) : (
                    <Text fontSize="sm">—</Text>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Card>
  );
}

export default PriceListList;
