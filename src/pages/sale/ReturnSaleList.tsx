import {
  Box,
  Button,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  textDecoration,
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
import {
  useGetClientQuery,
  useGetReturnSaleQuery,
  SaleType,
  PaymentType,
} from "api/client";
// Custom components
import Card from "components/card/Card";
import * as React from "react";
import dayjs from "dayjs";
import "./sale.css";
import { useHistory, useLocation } from "react-router-dom";
import { links } from "routes";
import Select from "react-select";
import Pagination from "../../components/pagination/Pagination";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { setQuery } from "helpers/queryParams";
import { useTranslation } from "react-i18next";
type Option = { label: string; value: number };

type RowObj = {
  id: number;
  clientName: string;
  saleId: number;
  productName: string;
};

const columnHelper = createColumnHelper<RowObj>();
type ReturnSaleType = {
  id: number;
  stockProduct: { product: { name: string; id: number }; id: number };
  amount: number;
  saleId: number;
  sale: {
    client: { name: string; id: number };
    saleItems: Array<{ stockProductId: number; price: number }>;
  };
  created_at: Date;
};
type ReturnType = {
  id: number;
  saleId: number;
  sale: {
    client: { name: string; id: number };
    saleItems: Array<{ stockProductId: number; price: number }>;
  };
  returnItems: Array<ReturnSaleType>;
};
// const columns = columnsDataCheck;
function ReturnSaleList() {
  const location = useLocation();
  const history = useHistory();
  const { data: returnSaleList = [], refetch } = useGetReturnSaleQuery<{
    data: ReturnType[];
  }>({
    query: location.search,
  });
  const { t } = useTranslation();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { data: clientData = [] } = useGetClientQuery();
  const [selectedClients, setSelectedClients] = React.useState<Array<Option>>(
    [],
  );
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const handleDateChange = (date: Date) => {
    setQuery(location, history, {
      name: "created_at",
      value: date ? dayjs(date).format("YYYY-MM-DD") : "",
    });
    setSelectedDate(date);
  };
  const returnSaleArray: RowObj[] = returnSaleList.map(
    ({ id, saleId, sale, returnItems }) => {
      return {
        saleId,
        id,
        productName: returnItems
          .map((ri: ReturnSaleType) => ri.stockProduct?.product?.name)
          .join(", "),
        clientName: sale?.client?.name,
      };
    },
  );
  React.useEffect(() => {
    refetch();
  }, [refetch]);
  React.useEffect(() => {
    if (location.search.includes("created_at")) {
      return;
    }
    setQuery(location, history, {
      name: "created_at",
      value: dayjs().format("YYYY-MM-DD"),
    });
  }, []);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const columns: ColumnDef<RowObj, any>[] = [
    columnHelper.accessor("saleId", {
      id: "saleId",
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
        const saleId = info.getValue();
        return (
          <Flex align="center">
            <Text
              color={textColor}
              fontSize="sm"
              fontWeight="700"
              _hover={{
                textDecoration: "underline",
              }}
              onClick={() => history.push(links.saleInfo(saleId))}
            >
              {saleId}
            </Text>
          </Flex>
        );
      },
    }),
    columnHelper.accessor("productName", {
      id: "productName",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Product name
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

  if (isMobile) {
    columns.push(
      columnHelper.display({
        id: "edit_action",
        header: () => null,
        cell: (info) => (
          <Button
            position={"static"}
            colorScheme={"teal"}
            onClick={() => {
              history.push(links.returnSale(info.row.original.id));
            }}
          >
            {t("common.edit")}
          </Button>
        ),
      }),
    );
  }
  const table = useReactTable({
    data: returnSaleArray,
    columns: columns as any,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  React.useEffect(() => {
    refetch();
  }, [location.search, refetch]);
  if (isMobile) {
    return (
      <Box>
        <Flex px="25px" mb="8px" flexDirection={"column"}>
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            Sale List
          </Text>
          <Flex justifyContent={"space-between"} mt={3}>
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
                setSelectedClients(newValue as Option[]);
              }}
              placeholder="Select a client"
            />
            <Flex
              borderColor={"blue.500"}
              borderStyle="solid"
              borderWidth={"1px"}
            >
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date) => handleDateChange(date)}
                isClearable
              />
            </Flex>
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
      position={"static"}
    >
      <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
        <Text
          color={textColor}
          fontSize="22px"
          fontWeight="700"
          lineHeight="100%"
        >
          Return Sale List
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
            setSelectedClients(newValue as Option[]);
          }}
          placeholder="Select a client"
        />
        <Flex borderColor={"blue.500"} borderStyle="solid" borderWidth={"1px"}>
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date) => handleDateChange(date)}
            isClearable
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
                    history.push(links.returnSaleDetails(row.original.saleId));
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

export default ReturnSaleList;
