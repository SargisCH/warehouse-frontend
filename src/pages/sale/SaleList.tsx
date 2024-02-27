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
import { useGetClientQuery, useGetSaleQuery, SaleType } from "api/client";
// Custom components
import Card from "components/card/Card";
import * as React from "react";
import dayjs from "dayjs";
import "./sale.css";
import { useHistory, useLocation } from "react-router-dom";
import { links } from "routes";
import Select from "react-select";
import Pagination from "../../components/pagination/Pagination";
import { setQuery } from "helpers/queryParams";
type Option = { label: string; value: number };

type RowObj = {
  id: number;
  clientName: string;
  clientCode: string;
  products: string[];
  created_at: string;
  updated_at: string;
};

const columnHelper = createColumnHelper<RowObj>();

// const columns = columnsDataCheck;
function SaleList() {
  const location = useLocation();
  const history = useHistory();
  const { data = { saleList: [], totalPages: 1 }, refetch } = useGetSaleQuery<{
    data: {
      saleList: SaleType[];
      totalPages: number;
    };
  }>({
    query: location.search,
  });
  const { data: clientData = [] } = useGetClientQuery();
  const [selectedClients, setSelectedClients] = React.useState<Array<Option>>(
    [],
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const handlePageChange = (page: number) => {
    setTimeout(() => {
      setQuery(location, history, { name: "page", value: 1 });
    }, 5000);
    setCurrentPage(page);
  };
  const saleArray: RowObj[] = data.saleList.map(
    ({ id, client, saleItems, created_at, updated_at }) => {
      return {
        id,
        clientName: client.name,
        clientCode: client.companyCode,
        products: saleItems.map(({ product }) => product.name),
        created_at,
        updated_at,
      };
    },
  );
  useEffect(() => {
    refetch();
  }, [refetch]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const columns = [
    columnHelper.accessor("clientName", {
      id: "clientName",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Client Name
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
    columnHelper.accessor("products", {
      id: "products",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Products
        </Text>
      ),
      cell: (info: any) => {
        return (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {info.getValue().join(",")}
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
          Created At
        </Text>
      ),
      cell: (info: any) => {
        return (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {dayjs(info.getValue()).format("DD/MM/YYYY")}
            </Text>
          </Flex>
        );
      },
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
          Created At
        </Text>
      ),
      cell: (info: any) => {
        return (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {dayjs(info.getValue()).format("DD/MM/YYYY")}
            </Text>
          </Flex>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: saleArray,
    columns: columns as any,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  useEffect(() => {
    refetch();
  }, [location.search, refetch]);

  return (
    <Card
      flexDirection="column"
      w="100%"
      px="0px"
      overflowX={{ sm: "scroll", lg: "hidden" }}
    >
      <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
        <Text
          color={textColor}
          fontSize="22px"
          fontWeight="700"
          lineHeight="100%"
        >
          Sale List
        </Text>

        <Select
          options={clientData.map((client) => {
            return { label: client.name, value: client.id };
          })}
          isMulti
          value={selectedClients}
          onChange={(newValue) => {
            setQuery(location, history, {
              name: "client",
              value: newValue.map((op: Option) => op.value),
            });
            handlePageChange(1);
            setSelectedClients(newValue as Option[]);
          }}
          placeholder="Select a client"
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
            {table
              .getRowModel()
              .rows.slice(0)
              .map((row) => {
                return (
                  <Tr
                    key={row.id}
                    cursor="pointer"
                    onClick={() => {
                      history.push(links.saleInfo(row.original.id));
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
        <Pagination
          currentPage={currentPage}
          totalPages={data.totalPages}
          onPageChange={(page: number) => {
            setCurrentPage(page);
          }}
          setQueryParams
        />
      </Box>
    </Card>
  );
}

export default SaleList;
