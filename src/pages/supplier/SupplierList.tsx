import { useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
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
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useGetSuppliersQuery } from "api/supplier";
import { Supplier } from "types";
// Custom components
import Card from "components/card/Card";
import * as React from "react";
import dayjs from "dayjs";
import "./supplier.css";
import { useHistory } from "react-router-dom";
import { links } from "routes";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import { useTranslation } from "react-i18next";

type RowObj = Supplier;

const columnHelper = createColumnHelper<RowObj>();
let searchTimeoutId: ReturnType<typeof setTimeout>;

function SupplierList() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchFilter, setSearchFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const { t } = useTranslation();

  const queryObject = {
    searchTerm: searchFilter,
    sortKey: "",
    sortOrder: "",
  };

  if (sorting.length) {
    queryObject.sortKey = sorting[0].id;
    queryObject.sortOrder = sorting[0].desc ? "desc" : "asc";
  }

  const { data: supplierArray = [], refetch } =
    useGetSuppliersQuery(queryObject);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const history = useHistory();

  const handleSearchTermChange = (e: any) => {
    setSearchTerm(e.target.value);
    clearTimeout(searchTimeoutId);
    searchTimeoutId = setTimeout(() => {
      setSearchFilter(e.target.value);
    }, 500);
  };

  const isMobile = useBreakpointValue({ base: true, md: false });
  const columns: ColumnDef<Supplier, any>[] = [
    columnHelper.accessor("name", {
      id: "name",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          {t("common.supplier.name").toUpperCase()}
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
          {t("common.createdAt").toUpperCase()}
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
          {t("common.updatedAt").toUpperCase()}
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
        cell: (info) => (
          <Button
            colorScheme={"teal"}
            onClick={() => history.push(links.manager(info.row.original.id))}
          >
            {t("common.edit")}
          </Button>
        ),
      }),
    );
  }

  const table = useReactTable({
    data: supplierArray,
    columns: columns as any,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
    manualSorting: true,
    state: {
      sorting,
    },
  });

  if (isMobile) {
    return (
      <Box>
        <Flex px="25px" mb="8px" flexDirection={"column"}>
          <Flex justifyContent={"space-between"}>
            <Text
              color={textColor}
              fontSize="22px"
              fontWeight="700"
              lineHeight="100%"
            >
              {t("common.supplier.supplierListasdasd")}
            </Text>
            <TableAddButton
              label={t("common.supplier.addSuppliesr")}
              link={links.createSupplier}
            />
          </Flex>
          <Flex mt={3} marginRight={10} width={"200px"}>
            <Input
              placeholder={t("common.searchTerm")}
              value={searchTerm}
              onChange={handleSearchTermChange}
            />
          </Flex>
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
      minHeight="500px"
      position={"static"}
    >
      <Box px="25px" mb="8px">
        <Flex justifyContent={"space-between"}>
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            {t("common.supplier.supplierList")}
          </Text>
          <TableAddButton
            label={t("common.supplier.addSupplier")}
            link={links.createSupplier}
          />
        </Flex>
        <Flex marginTop={"20px"} justifyContent="flex-start">
          <Box marginRight={10} width={"200px"}>
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
                          asc: " 🔼",
                          desc: " 🔽",
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

export default SupplierList;
