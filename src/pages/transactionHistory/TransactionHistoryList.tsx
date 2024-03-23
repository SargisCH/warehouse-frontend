import { useEffect } from "react";
import {
  Box,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Link,
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
import {
  useGetTransactionHistoryQuery,
  TransactionType,
} from "api/transactionHistory";
// Custom components
import Card from "components/card/Card";
import * as React from "react";
import dayjs from "dayjs";
import "./transactionHistory.css";
import { links } from "routes";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import { useHistory, Link as ReactLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
// Assets

type RowObj = {
  id: number | string;
  client: {
    name: string;
  };
  inventorySupplier: {
    name: string;
  };
  sale: {
    id?: number;
  };
  transactionType: TransactionType;
  amount: number;
  created_at: string;
  updated_at: string;
};

const columnHelper = createColumnHelper<RowObj>();

// const columns = columnsDataCheck;
function TransactionHistoryList() {
  const { data: transactionHistoryArray = [], refetch } =
    useGetTransactionHistoryQuery();
  useEffect(() => {
    refetch();
  }, [refetch]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const history = useHistory();
  const columns = [
    columnHelper.accessor("client.name", {
      id: "client_name",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          <>Client Name</>
        </Text>
      ),
      cell: (info: any) => {
        return (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {info.getValue() || "N/A"}
            </Text>
          </Flex>
        );
      },
    }),
    columnHelper.accessor("inventorySupplier.name", {
      id: "inventorySupplier_name",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Supplier name
        </Text>
      ),
      cell: (info: any) => {
        return (
          <Flex align="center">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {info.getValue() || "N/A"}
            </Text>
          </Flex>
        );
      },
    }),
    columnHelper.accessor("sale.id", {
      id: "sale_id",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Sale Id
        </Text>
      ),
      cell: (info: any) => {
        const value = info.getValue();
        return (
          <Flex align="center">
            <Text
              color={textColor}
              fontSize="sm"
              fontWeight="700"
              display={"inline-flex"}
              flexGrow={1}
            >
              {value ? (
                <Link
                  as={ReactLink}
                  flexGrow={1}
                  _hover={{ textDecoration: "underline", color: "purple" }}
                  to={links.saleInfo(value)}
                  display="flex"
                  justifyContent={"space-between"}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {value}
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              ) : (
                "N/A"
              )}
            </Text>
          </Flex>
        );
      },
    }),
    columnHelper.accessor("amount", {
      id: "amount",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Amount
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
    columnHelper.accessor("transactionType", {
      id: "transactionType",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Transaction type
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
  ];
  const table = useReactTable({
    data: transactionHistoryArray,
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
          Transaction History List
        </Text>

        <TableAddButton
          label="Add Transaction History"
          link={links.createTransactionHistory}
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
              .rows.slice(0, 11)
              .map((row) => {
                return (
                  <Tr
                    key={row.id}
                    cursor="pointer"
                    onClick={() => {
                      history.push(links.transactionHistory(row.original.id));
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

export default TransactionHistoryList;
