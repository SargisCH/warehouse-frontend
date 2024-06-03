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
import { useGetProductQuery, useMakeProductMutation } from "api/product";
// Custom components
import Card from "components/card/Card";
import Menu from "components/menu/MainMenu";
import * as React from "react";
import dayjs from "dayjs";
import "./product.css";
import { useHistory } from "react-router-dom";
import { links } from "routes";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import { useTranslation } from "react-i18next";
import ProductMakeModal from "./ProductMakeModal";
import ProductAmountModal from "./ProductPriceModal";
// Assets

type RowObj = {
  id: number | string;
  name: string;
  price: string | number;
  priceUnit: string;
  inStock: number;
  inStockUnit: string;
  costPrice: number;
};

const columnHelper = createColumnHelper<RowObj>();

// const columns = columnsDataCheck;
function ProductList() {
  const { data: productArray = [], refetch } = useGetProductQuery();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const history = useHistory();
  const { t } = useTranslation();
  const [makeId, setMakeId] = React.useState<number>();
  const [amountUpdateId, setAmountUpdateId] = React.useState<number>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const amountUpdateModalActions = useDisclosure();
  useEffect(() => {
    refetch();
  }, []);
  const makeModalOnClose = React.useCallback(() => {
    onClose();
    setMakeId(null);
    refetch();
  }, [onClose, setMakeId, refetch]);
  const amountModalOnClose = React.useCallback(() => {
    amountUpdateModalActions.onClose();
    setAmountUpdateId(null);
    refetch();
  }, [amountUpdateModalActions.onClose, setAmountUpdateId, refetch]);
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
    columnHelper.accessor("price", {
      id: "price",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          {t("common.price")}
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {`${Number(info.getValue()).toFixed(2)} / ${
              info.row.original.priceUnit
            }`}
          </Text>
        </Flex>
      ),
    }),
    columnHelper.accessor("inStock", {
      id: "inStock",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          {t("common.product.inStock")}
        </Text>
      ),
      cell: (info) => {
        return (
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {`${Number(info.getValue()).toFixed(2)} ${" "} ${
              info.row.original.inStockUnit
            }`}
          </Text>
        );
      },
    }),
    columnHelper.accessor("costPrice", {
      id: "costPrice",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          {t("common.product.costPrice")}
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {Number(info.getValue()).toFixed(2)}
        </Text>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () =>
        isMobile ? null : (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: "10px", lg: "12px" }}
            color="gray.400"
          >
            {t("common.actions")}
          </Text>
        ),
      cell: (info) => (
        <Button
          fontSize={isMobile ? "14px" : ""}
          colorScheme={"green"}
          onClick={(e) => {
            e.stopPropagation();
            setMakeId(Number(info.row.original.id));
            onOpen();
          }}
        >
          {t("common.product.make")}
        </Button>
      ),
    }),
    columnHelper.display({
      id: "actions2",
      header: () =>
        isMobile ? null : (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: "10px", lg: "12px" }}
            color="gray.400"
          >
            {t("common.actions")}
          </Text>
        ),
      cell: (info) => (
        <Button
          fontSize={isMobile ? "14px" : ""}
          colorScheme={"green"}
          onClick={(e) => {
            e.stopPropagation();
            setAmountUpdateId(Number(info.row.original.id));
            amountUpdateModalActions.onOpen();
          }}
        >
          {t("common.declareAmount")}
        </Button>
      ),
    }),
  ];

  const isMobile = useBreakpointValue({ base: true, md: false });
  const table = useReactTable({
    data: productArray,
    columns: columns as any,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });
  const sharedElements = (
    <>
      <ProductMakeModal
        isOpen={isOpen}
        onClose={makeModalOnClose}
        productId={makeId}
      />
      <ProductAmountModal
        isOpen={amountUpdateModalActions.isOpen}
        onClose={amountModalOnClose}
        productId={amountUpdateId}
      />
    </>
  );
  if (isMobile) {
    return (
      <Box>
        <Flex justifyContent={"flex-end"} mt="20px" mb="20px">
          <TableAddButton
            link={links.createProduct}
            label={t("common.product.addProduct")}
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
        {sharedElements}
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
          {t("common.products")}
        </Text>
        <Flex>
          <TableAddButton
            link={links.createProduct}
            label={t("common.product.addProduct")}
          />
          <Menu />
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
            {table
              .getRowModel()
              .rows.slice(0, 11)
              .map((row) => {
                return (
                  <Tr
                    key={row.id}
                    cursor="pointer"
                    onClick={() => {
                      history.push(links.productItem(row.original.id));
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
        {sharedElements}
      </Box>
    </Card>
  );
}

export default ProductList;
