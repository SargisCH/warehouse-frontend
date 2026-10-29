import { useEffect } from "react";
import {
  Box,
  Flex,
  Input,
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
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useGetManagersQuery } from "api/manager";
import { Manager } from "types";
// Custom components
import Card from "components/card/Card";
import * as React from "react";
import { useHistory } from "react-router-dom";
import { links } from "routes";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import { useTranslation } from "react-i18next";

const columnHelper = createColumnHelper<Manager>();
let searchTimeoutId: ReturnType<typeof setTimeout>;

function ManagerList() {
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

  const { data: managers = [], refetch } = useGetManagersQuery(queryObject);

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

  const header = (label: string) => () => (
    <Text
      justifyContent="space-between"
      align="center"
      fontSize={{ sm: "10px", lg: "12px" }}
      color="gray.400"
    >
      {label.toUpperCase()}
    </Text>
  );

  const textCell = (info: any) => (
    <Text color={textColor} fontSize="sm" fontWeight="700">
      {info.getValue() || "—"}
    </Text>
  );

  const columns: ColumnDef<Manager, any>[] = [
    columnHelper.accessor("code", {
      id: "code",
      header: header(t("common.manager.code")),
      cell: textCell,
    }),
    columnHelper.accessor("name", {
      id: "name",
      header: header(t("common.manager.name")),
      cell: textCell,
    }),
    columnHelper.accessor("email", {
      id: "email",
      header: header(t("common.manager.email")),
      cell: textCell,
    }),
    columnHelper.accessor("deviceId", {
      id: "deviceId",
      enableSorting: false,
      header: header(t("common.manager.deviceId")),
      cell: textCell,
    }),
    columnHelper.accessor("salesZoneName", {
      id: "salesZoneName",
      enableSorting: false,
      header: header(t("common.salesZone.salesZone")),
      cell: textCell,
    }),
    columnHelper.accessor("delivererName", {
      id: "delivererName",
      enableSorting: false,
      header: header(t("common.manager.deliverer")),
      cell: textCell,
    }),
  ];

  const table = useReactTable({
    data: managers,
    columns: columns as any,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    state: {
      sorting,
    },
  });

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
            {t("common.manager.managerList")}
          </Text>
          <TableAddButton
            label={t("common.manager.addManager")}
            link={links.createManager}
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
                {headerGroup.headers.map((header) => (
                  <Th
                    key={header.id}
                    colSpan={header.colSpan}
                    pe="10px"
                    borderColor={borderColor}
                    cursor={header.column.getCanSort() ? "pointer" : "default"}
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
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr
                key={row.id}
                cursor="pointer"
                onClick={() => {
                  history.push(links.manager(row.original.id));
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <Td
                    key={cell.id}
                    fontSize={{ sm: "14px" }}
                    minW={{ sm: "150px", md: "200px", lg: "auto" }}
                    borderColor="transparent"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Card>
  );
}

export default ManagerList;
