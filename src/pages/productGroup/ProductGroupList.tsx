import { useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useGetProductGroupQuery } from "../../api/productGroup";
// Custom components
import Card from "components/card/Card";
import * as React from "react";
import dayjs from "dayjs";
import "./productGroup.css";
import { useHistory } from "react-router-dom";
import { links } from "routes";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import { t } from "i18next";
import CustomTable from "components/table/Table";
// Assets

type RowObj = {
  id: string | number;
  name: string;
};

const columnHelper = createColumnHelper<RowObj>();

// const columns = columnsDataCheck;
function ProductGroupList() {
  const { data: productGroupArray = [], refetch } = useGetProductGroupQuery();
  useEffect(() => {
    refetch();
  }, [refetch]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          {t("common.name")}
        </Text>
      ),
      cell: (info: any) => {
        return (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {info.getValue()}
            </Text>
          </Flex>
        );
      },
    }),
  ];
  const table = useReactTable<RowObj>({
    data: productGroupArray,
    columns: columns as any,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });
  return (
    <Card
      flexDirection="column"
      w="100%"
      px="0px"
      overflowX={{ sm: "scroll", lg: "hidden" }}
      position={"static"}
    >
      <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
        <Text
          color={textColor}
          fontSize="22px"
          fontWeight="700"
          lineHeight="100%"
        >
          {t("common.productGroups.list")}
        </Text>
        <TableAddButton
          label={t("common.productGroups.addProductGroup")}
          link={links.createProductGroup}
        />
      </Flex>
      <Box>
        <CustomTable<RowObj>
          tableInstance={table}
          editRowUrl={links.productGroup}
        />
      </Box>
    </Card>
  );
}

export default ProductGroupList;
