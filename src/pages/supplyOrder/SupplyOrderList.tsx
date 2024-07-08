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
  useBreakpointValue,
  useColorModeValue,
  useQuery,
} from "@chakra-ui/react";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useGetSupplierOrdersQuery } from "api/inventorySupplier";
// Custom components
import Card from "components/card/Card";
import Menu from "components/menu/MainMenu";
import * as React from "react";
import dayjs from "dayjs";
import "./supplyOrder.css";
import { useHistory, useLocation } from "react-router-dom";
import { links } from "routes";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import { useGetInventoryQuery } from "api/inventory";
import ReactSelect from "react-select";
import { setQuery } from "helpers/queryParams";
import { useTranslation } from "react-i18next";
// Assets

type RowObj = {
  id: number | string;
  name: string;
  orderDate: string;
  status?: string;
  created_at: string;
  updated_at: string;
  inventorySupplier: Partial<{ id: number; name: string }>;
};

const columnHelper = createColumnHelper<RowObj>();

// const columns = columnsDataCheck;
function SupplierOrderList() {
  const history = useHistory();
  const location = useLocation();
  const { data: ordersArray = [], refetch } = useGetSupplierOrdersQuery({
    query: location.search,
  });
  useEffect(() => {
    refetch();
  }, []);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  const isMobile = useBreakpointValue({ base: true, md: false });
  const { data: inventoryData } = useGetInventoryQuery();
  const inventoryOptions = inventoryData?.inventories?.map((inv: any) => ({
    label: inv.name,
    value: inv.id,
  }));
  const { t } = useTranslation();
  const columns: ColumnDef<RowObj, any>[] = [
    columnHelper.accessor("inventorySupplier.name", {
      id: "inventorySupplier",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Inventory Supplier
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
    columnHelper.accessor("orderDate", {
      id: "orderDate",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Order Date
        </Text>
      ),
      cell: (info) => {
        return (
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {dayjs(info.getValue()).format("DD/MM/YYYY")}
          </Text>
        );
      },
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Status
        </Text>
      ),
      cell: (info) => {
        return (
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {info.getValue()}
          </Text>
        );
      },
    }),
    columnHelper.accessor("created_at", {
      id: "created_at",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Created at
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {dayjs(info.getValue()).format("DD/MM/YYYY")}
        </Text>
      ),
    }),
    columnHelper.accessor("updated_at", {
      id: "updated_at",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Updated at
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {dayjs(info.getValue()).format("DD/MM/YYYY")}
        </Text>
      ),
    }),
  ];
  if (isMobile) {
    columns.push(
      columnHelper.display({
        id: "edit_action",
        header: () => null,
        cell: (info: any) => (
          <Button
            colorScheme="teal"
            onClick={() =>
              history.push(
                links.supplyOrder(
                  info.row.original.inventorySupplierId,
                  info.row.original.id,
                ),
              )
            }
          >
            {t("common.edit")}
          </Button>
        ),
      }),
    );
  }
  const table = useReactTable({
    data: ordersArray,
    columns: columns as any,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });
  if (isMobile) {
    return (
      <Box>
        <Flex justifyContent={"flex-end"} mt="20px" mb="20px">
          <TableAddButton
            link={links.createSupplyOrderNoSupplier}
            label={t("common.inventorySupplier.makeOrder")}
          />
        </Flex>

        {table.getRowModel().rows.map((row) => (
          <Box
            key={row.id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p="4"
            mb="4"
          >
            {row.getVisibleCells().map((cell) => {
              return (
                <Box
                  key={cell.id}
                  display="flex"
                  justifyContent="space-between"
                  py="2"
                >
                  <Box
                    as="span"
                    fontSize={"16px"}
                    css={{ p: { fontSize: "14px" } }}
                  >
                    {flexRender(
                      cell.column.columnDef.header,
                      cell.getContext() as any,
                    )}
                  </Box>
                  <Box as="span">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Box>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    );
  }
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
          Inventory Supplier Order List
        </Text>
        <Flex justifyContent={"flex-end"} gap="20px">
          <ReactSelect
            isMulti
            options={inventoryOptions}
            onChange={(op) => {
              setQuery(location, history, {
                name: "inventory[]",
                value: op.map((op) => op.value),
              });
            }}
          />
          <TableAddButton
            label="Create Order"
            link={links.createSupplyOrderNoSupplier}
          />
        </Flex>
      </Flex>
      <Box>
        <Table variant="simple" color="gray.500" mb="24px" mt="12px">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Th
                      key={header.id}
                      colSpan={header.colSpan}
                      pe="10px"
                      borderColor={borderColor}
                      cursor="pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <Flex
                        justifyContent="space-between"
                        align="center"
                        fontSize={{ sm: "10px", lg: "12px" }}
                        color="gray.400"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: "",
                          desc: "",
                        }[header.column.getIsSorted() as string] ?? null}
                      </Flex>
                    </Th>
                  );
                })}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <Tr
                  key={row.id}
                  cursor="pointer"
                  onClick={() => {
                    history.push(
                      links.supplyOrder(
                        row.original.inventorySupplierId,
                        row.original.id,
                      ),
                    );
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <Td
                        key={cell.id}
                        fontSize={{ sm: "14px" }}
                        minW={{ sm: "150px", md: "200px", lg: "auto" }}
                        borderColor="transparent"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Card>
  );
}

export default SupplierOrderList;
