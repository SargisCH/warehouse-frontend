import { useEffect } from "react";
import {
  Box,
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
  useColorModeValue,
  Link as ChakraLink,
  Button,
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
import { useGetInventoryQuery } from "api/inventory";
// Custom components
import Card from "components/card/Card";
import * as React from "react";
import dayjs from "dayjs";
import "./inventory.css";
import { useHistory } from "react-router-dom";
import { links } from "routes";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import { useTranslation } from "react-i18next";
import InventoryAmountModal from "./InventoryPriceModal";

// Assets

type RowObj = {
  id: number | string;
  name: string;
  amount: number;
  avg: number;
  price: number;
  amountUnit: string;
  created_at: string;
  updated_at: string;
};

const columnHelper = createColumnHelper<RowObj>();

function InventoryList() {
  const { data, refetch } = useGetInventoryQuery();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inventoryArray = data?.inventories || [];
  const totalWorth = data?.totalWorth;
  useEffect(() => {
    refetch();
  }, []);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const history = useHistory();
  const { t } = useTranslation();
  const [updateAmountId, setUpdateAmountId] = React.useState(null);
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
      cell: (info) => {
        return (
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {info.getValue()}
          </Text>
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
          {t("common.amount")}
        </Text>
      ),
      cell: (info) => {
        const unit = info.row.original.amountUnit;
        return (
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {`${info.getValue()} ${unit ? t("common." + unit) : ""}`}
          </Text>
        );
      },
    }),
    columnHelper.accessor("avg", {
      id: "avg",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          {t("common.average")}
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
      cell: (info) => (
        <Button
          colorScheme={"teal"}
          onClick={(e) => {
            e.stopPropagation();
            setUpdateAmountId(info.row.original.id);
            onOpen();
          }}
        >
          {t("common.declareAmount")}
        </Button>
      ),
    }),
  ];
  const table = useReactTable({
    data: inventoryArray,
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
      position={"static"}
      flexDirection="column"
      w="100%"
      px="0px"
      overflowX={{ sm: "scroll", lg: "hidden" }}
    >
      <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
        <Box>
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            {t("common.inventories")}
          </Text>
        </Box>
        <Flex>
          <TableAddButton
            link={links.createInventory}
            label={t("common.inventory.createNewInventory")}
          />
          <TableAddButton
            link={links.createSupplyOrderNoSupplier}
            label={t("common.inventory.addNewEntry")}
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
            {table
              .getRowModel()
              .rows.slice(0, 11)
              .map((row) => {
                return (
                  <Tr
                    key={row.id}
                    cursor="pointer"
                    onClick={() => {
                      history.push(links.inventoryItem(row.original.id));
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
        <Text align={"right"} paddingRight="20">
          {t("common.totalWorth")}: {totalWorth}
        </Text>
        <InventoryAmountModal
          isOpen={isOpen}
          onClose={() => {
            setUpdateAmountId(null);
            onClose();
          }}
          inventoryId={updateAmountId}
        />
      </Box>
    </Card>
  );
}

export default InventoryList;
