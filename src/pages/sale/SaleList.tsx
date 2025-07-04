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
  useDisclosure,
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
  useGetClientQuery,
  useGetSaleQuery,
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
import CancelDialog from "./CancelDialog";
import { useGetManagerQuery } from "api/manager";
import { useGetStockProductQuery } from "api/product";
type Option = { label: string; value: number };

type RowObj = {
  id: number;
  clientName: string;
  products: string[];
  totalPrice: number;
  cash?: number;
  credit?: number;
  transfer?: number;
  paymentType: PaymentType;
  created_at: string;
  updated_at: string;
  priceChanged?: boolean;
  partialCreditAmount?: number;
  canceled?: boolean;
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
  const { t } = useTranslation();
  const { data: clientData = [] } = useGetClientQuery();
  const { data: managers = [] } = useGetManagerQuery();
  const { data: stockProductsData } = useGetStockProductQuery();
  const { stockProducts = [] } = stockProductsData || { stockProducts: [] };
  const [selectedClients, setSelectedClients] = React.useState<Array<Option>>(
    [],
  );
  const [selectedManagers, setSelectedManagers] = React.useState<Array<Option>>(
    [],
  );
  const [selectedProducts, setSelectedProducts] = React.useState<Array<Option>>(
    [],
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = React.useState(null);
  const [cancelId, setCancelId] = React.useState(null);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const handlePageChange = (page: number) => {
    setTimeout(() => {
      setQuery(location, history, { name: "page", value: 1 });
    }, 5000);
    setCurrentPage(page);
  };
  const handleDateChange = (dates: [Date, Date]) => {
    const [start, end] = dates;
    setQuery(location, history, {
      name: "startDate",
      value: start ? dayjs(start).format("YYYY-MM-DD") : "",
    });
    setQuery(location, history, {
      name: "endDate",
      value: end ? dayjs(end).format("YYYY-MM-DD") : "",
    });
    setSelectedEndDate(end);
    setSelectedDate(start);
  };
  const total = React.useMemo(() => {
    return data.saleList.reduce((saleAcc, sale) => {
      return (
        saleAcc +
        sale.saleItems.reduce((acc, item) => {
          return acc + item.price * item.amount;
        }, 0)
      );
    }, 0);
  }, [data.saleList]);
  const saleArray: RowObj[] = data.saleList.map(
    ({
      id,
      client,
      saleItems,
      created_at,
      updated_at,
      paymentType,
      partialCreditAmount,
      canceled,
    }) => {
      return {
        id,
        clientName: client.name,
        products: saleItems.map(
          ({ stockProduct }) => stockProduct?.product.name,
        ),
        totalPrice: saleItems.reduce((acc, item) => {
          return acc + item.price * item.amount;
        }, 0),
        priceChanged: saleItems.some(
          (si) => typeof si.originalPrice === "number",
        ),
        paymentType,
        partialCreditAmount,
        created_at,
        updated_at,
        canceled,
      };
    },
  );
  useEffect(() => {
    refetch();
  }, [refetch]);
  useEffect(() => {
    if (location.search.includes("startDate")) {
      return;
    }
    setQuery(location, history, {
      name: "startDate",
      value: dayjs().format("YYYY-MM-DD"),
    });
  }, []);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const {
    onOpen: onCancelOpen,
    onClose: onCancelClose,
    isOpen: isCancelOpen,
  } = useDisclosure();
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
          Updated At
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
    columnHelper.accessor("totalPrice", {
      id: "totalPrice",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Total
        </Text>
      ),
      cell: (info: any) => {
        const priceChanged = info.row.original?.priceChanged;
        return (
          <Flex align="center">
            <Text
              title="Original price has been changed"
              color={priceChanged ? "red.500" : textColor}
              fontSize="sm"
              fontWeight="700"
            >
              {info.getValue()}
            </Text>
          </Flex>
        );
      },
    }),
    columnHelper.accessor("cash", {
      id: "cash",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Cash
        </Text>
      ),
      cell: (info: any) => {
        const totalPrice = info.row.original?.totalPrice;
        const cashSubstractedFromCredit =
          info.row.original.paymentType === PaymentType.PARTIAL_CREDIT
            ? totalPrice - info.row.original.partialCreditAmount
            : 0;
        return (
          <Flex align="center">
            <Text
              title="Original price has been changed"
              color={textColor}
              fontSize="sm"
              fontWeight="700"
            >
              {info.row.original?.paymentType === PaymentType.CASH
                ? totalPrice
                : cashSubstractedFromCredit > 0
                  ? cashSubstractedFromCredit
                  : ""}
            </Text>
          </Flex>
        );
      },
    }),
    columnHelper.accessor("credit", {
      id: "credit",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Credit
        </Text>
      ),
      cell: (info: any) => {
        const paymentType = info.row.original?.paymentType;
        const totalPrice = info.row.original?.totalPrice;
        let price: number;
        if (paymentType === PaymentType.CREDIT) {
          price = totalPrice;
        } else if (paymentType === PaymentType.PARTIAL_CREDIT) {
          price = info.row.original?.partialCreditAmount;
        }
        return (
          <Flex align="center">
            <Text
              title="Original price has been changed"
              color={textColor}
              fontSize="sm"
              fontWeight="700"
            >
              {price}
            </Text>
          </Flex>
        );
      },
    }),
    columnHelper.accessor("transfer", {
      id: "transfer",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Transfer
        </Text>
      ),
      cell: (info: any) => {
        return (
          <Flex align="center">
            <Text
              title="Original price has been changed"
              color={textColor}
              fontSize="sm"
              fontWeight="700"
            >
              {info.row.original.paymentType === PaymentType.TRANSFER
                ? info.row.original?.totalPrice
                : ""}
            </Text>
          </Flex>
        );
      },
    }),
    columnHelper.accessor("canceled", {
      id: "canceled",
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
      cell: (info: any) => {
        return (
          <Flex align="center">
            <Text
              title="Original price has been changed"
              color={textColor}
              fontSize="sm"
              fontWeight="700"
            >
              {info.getValue() ? "Canceled" : ""}
            </Text>
          </Flex>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        ></Text>
      ),
      cell: (info) =>
        info.row.original.canceled ? null : (
          <Button
            position={"static"}
            colorScheme={"teal"}
            onClick={(e) => {
              e.stopPropagation();
              history.push(links.returnSale(info.row.original.id));
            }}
          >
            {t("common.return")}
          </Button>
        ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        ></Text>
      ),
      cell: (info) =>
        info.row.original.canceled ? null : (
          <Button
            position={"static"}
            colorScheme={"teal"}
            onClick={(e) => {
              e.stopPropagation();
              setCancelId(info.row.original.id);
              onCancelOpen();
            }}
          >
            {t("common.cancel")}
          </Button>
        ),
    }),
  ];
  if (isMobile) {
    columnHelper.display({
      id: "edit_action",
      header: () => null,
      cell: (info) => (
        <Button
          position={"static"}
          colorScheme={"teal"}
          onClick={() => {
            history.push(links.saleInfo(info.row.original.id));
          }}
        >
          {t("common.edit")}
        </Button>
      ),
    });
  }

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

  let cashTotal = 0;
  let creditTotal = 0;
  let transferTotal = 0;
  data.saleList.forEach((s) => {
    const itemTotalPrice = s.saleItems.reduce(
      (acc, item) => acc + item.price * item.amount,
      0,
    );
    switch (s.paymentType) {
      case PaymentType.CASH:
        cashTotal += itemTotalPrice;
        break;
      case PaymentType.TRANSFER:
        transferTotal += itemTotalPrice;
        break;
      case PaymentType.CREDIT:
        creditTotal += itemTotalPrice;
        break;
      case PaymentType.PARTIAL_CREDIT: {
        cashTotal += itemTotalPrice;
        if (s.partialCreditAmount) {
          creditTotal += s.partialCreditAmount;
        }
        break;
      }
    }
  });
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
          <Flex justifyContent={"center"} mt={3} gap={3} flexDirection="column">
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
            <Select
              options={managers.map((manager) => {
                return { label: manager.name, value: manager.id };
              })}
              isMulti
              value={selectedManagers}
              onChange={(newValue) => {
                setQuery(location, history, {
                  name: "manager",
                  value: newValue.map((op: Option) => op.value),
                });
                handlePageChange(1);
                setSelectedManagers(newValue as Option[]);
              }}
              placeholder="Select a manager"
            />
            <Select
              options={stockProducts.map((stockProduct) => {
                return {
                  label: stockProduct.product.name,
                  value: stockProduct.id,
                };
              })}
              isMulti
              value={selectedProducts}
              onChange={(newValue) => {
                setQuery(location, history, {
                  name: "stockProduct",
                  value: newValue.map((op: Option) => op.value),
                });
                handlePageChange(1);
                setSelectedProducts(newValue as Option[]);
              }}
              placeholder="Select a product"
            />
            <Flex
              borderColor={"blue.500"}
              borderStyle="solid"
              borderWidth={"1px"}
            >
              <DatePicker
                selectsRange={true}
                startDate={selectedDate}
                endDate={selectedEndDate}
                onChange={handleDateChange}
                isClearable={true}
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
        <Select
          options={managers.map((manager) => {
            return { label: manager.name, value: manager.id };
          })}
          isMulti
          value={selectedManagers}
          onChange={(newValue) => {
            setQuery(location, history, {
              name: "manager",
              value: newValue.map((op: Option) => op.value),
            });
            handlePageChange(1);
            setSelectedManagers(newValue as Option[]);
          }}
          placeholder="Select a manager"
        />
        <Select
          options={stockProducts.map((stockProduct) => {
            return {
              label: stockProduct.product.name,
              value: stockProduct.id,
            };
          })}
          isMulti
          value={selectedProducts}
          onChange={(newValue) => {
            setQuery(location, history, {
              name: "stockProduct",
              value: newValue.map((op: Option) => op.value),
            });
            handlePageChange(1);
            setSelectedProducts(newValue as Option[]);
          }}
          placeholder="Select a product"
        />
        <Flex borderColor={"blue.500"} borderStyle="solid" borderWidth={"1px"}>
          <DatePicker
            selectsRange={true}
            startDate={selectedDate}
            endDate={selectedEndDate}
            onChange={handleDateChange}
            isClearable={true}
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
            <Tr>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td>{cashTotal}</Td>
              <Td>{creditTotal}</Td>
              <Td>{transferTotal}</Td>
            </Tr>
          </Tbody>
        </Table>
        <Flex justifyContent={"flex-end"} paddingRight="20px">
          <Text fontWeight={"bold"}> Total: {total} </Text>
        </Flex>
        <Flex marginTop={"20px"} justifyContent="flex-end">
          <Pagination
            currentPage={currentPage}
            totalPages={data.totalPages}
            onPageChange={(page: number) => {
              setCurrentPage(page);
            }}
            setQueryParams
          />
        </Flex>
      </Box>
      <CancelDialog
        isOpen={isCancelOpen}
        onClose={onCancelClose}
        saleCancelId={cancelId}
      />
    </Card>
  );
}

export default SaleList;
