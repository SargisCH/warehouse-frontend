import { useEffect } from "react";
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useGetWarehouseQuery } from "../../api/warehouse";
import Card from "components/card/Card";
import * as React from "react";
import "./warehouse.css";
import { links } from "routes";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import { t } from "i18next";
import CustomTable from "components/table/Table";

type RowObj = {
  id: number | string;
  name: string;
};

const columnHelper = createColumnHelper<RowObj>();

function WarehouseList() {
  const { data: warehouseArray = [], refetch } = useGetWarehouseQuery();
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
  const table = useReactTable({
    data: warehouseArray,
    columns: columns,
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
          {t("common.warehouse.list")}
        </Text>
        <TableAddButton
          label={t("common.warehouse.addWarehouse")}
          link={links.createWarehouse}
        />
      </Flex>
      <Box>
        <CustomTable<RowObj>
          editRowUrl={links.warehouse}
          tableInstance={table}
          totalPages={1}
        />
      </Box>
    </Card>
  );
}

export default WarehouseList;
