import { useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Progress,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  createColumnHelper,
  DisplayColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useGetInventorySupplierQuery } from "api/inventorySupplier";
// Custom components
import Card from "components/card/Card";
import Menu from "components/menu/MainMenu";
import * as React from "react";
import dayjs from "dayjs";
import "./inventorySupplier.css";
import { useHistory } from "react-router-dom";
import { links } from "routes";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import { useTranslation } from "react-i18next";

type RowObj = {
  id: number | string;
  name: string;
  created_at: string;
  updated_at: string;
};

const columnHelper = createColumnHelper<RowObj>();

// const columns = columnsDataCheck;
function InventorySupplerList() {
  const { data: inventorySupplierArray = [], refetch } =
    useGetInventorySupplierQuery();
  useEffect(() => {
    refetch();
  }, [refetch]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const history = useHistory();
  const { t } = useTranslation();
  const isMobile = useBreakpointValue({ base: true, md: false });
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
          NAME
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
    columnHelper.accessor("updated_at", {
      id: "updated_at",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        ></Text>
      ),
      cell: (info) => (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            history.push(links.createSupplyOrder(info.row.original.id));
          }}
        >
          Order
        </Button>
      ),
    }),
    isMobile
      ? columnHelper.display({
          id: "edit_action",
          header: () => "",
          cell: (info) => (
            <Button
              fontSize={isMobile ? "14px" : ""}
              colorScheme={"green"}
              onClick={() => {
                history.push(links.supplier(info.row.original.id));
              }}
            >
              {t("common.edit")}
            </Button>
          ),
        })
      : columnHelper.display({
          header: () => "",
          cell: () => null,
          id: "edit_action",
        }),
  ];
  const table = useReactTable({
    data: inventorySupplierArray,
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
            link={links.createSupplier}
            label={t("common.inventorySupplier.createInventorySupplier")}
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
          Inventory Supplier List
        </Text>
        <TableAddButton
          label={t("common.inventorySupplier.createInventorySupplier")}
          link={links.createSupplier}
        />
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
                    history.push(links.supplier(row.original.id));
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

export default InventorySupplerList;
