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
  useBreakpointValue,
  Button,
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
import { useGetCreditQuery } from "api/credit";
// Custom components
import Card from "components/card/Card";
import * as React from "react";
import dayjs from "dayjs";
import "./credit.css";
import { useHistory, Link as ReactLink } from "react-router-dom";
import { links } from "routes";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ReactSelect from "react-select";
import { Weekday } from "types";
import { useGetClientQuery } from "api/client";
import { Trans, useTranslation } from "react-i18next";
// Assets

type RowObj = {
  id: number | string;
  name: string;
  client: {
    name: string;
  };
  sale: {
    id?: number;
  };
  amount: number;
  created_at: string;
  updated_at: string;
};

type OptionType = { label: string; value: string | number };
type DayOptionType = { label: Weekday; value: Weekday };
const weekDayOptions: DayOptionType[] = [
  Weekday.MONDAY,
  Weekday.TUESDAY,
  Weekday.WEDNESDAY,
  Weekday.THURSDAY,
  Weekday.FRIDAY,
  Weekday.SATURDAY,
  Weekday.SUNDAY,
].map((d) => ({ label: d, value: d }));

const columnHelper = createColumnHelper<RowObj>();

// const columns = columnsDataCheck;
function CreditList() {
  const [selectedDay, setSelectedDay] = React.useState<DayOptionType>();
  const [selectedClient, setSelectedClient] = React.useState<OptionType>();
  const { data: creditArray = [], refetch } = useGetCreditQuery({
    weekDay: selectedDay?.value as string,
    clientId: selectedClient?.value,
  });
  const { data: clients } = useGetClientQuery();
  useEffect(() => {
    refetch();
  }, [refetch]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const history = useHistory();
  const { t } = useTranslation();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const columns: ColumnDef<RowObj, any>[] = [
    columnHelper.accessor("client.name", {
      id: "client_name",
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
        cell: (info) => (
          <Button
            colorScheme={"teal"}
            onClick={() => {
              history.push(links.credit(info.row.original.id));
            }}
          >
            {t("common.edit")}
          </Button>
        ),
      }),
    );
  }
  const table = useReactTable({
    data: creditArray,
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
            link={links.createCredit}
            label={t("common.credit.addCredit")}
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
      minHeight="500px"
      position={"static"}
    >
      {!isMobile ? (
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            Credit List
          </Text>
          <Box marginRight={10} width={"200px"}>
            <ReactSelect
              placeholder="Day plan"
              options={weekDayOptions}
              value={selectedDay}
              onChange={setSelectedDay}
            />
          </Box>
          <Box marginRight={10} width={"200px"}>
            <ReactSelect
              placeholder="choose a clients"
              options={clients?.map((cl) => ({ label: cl.name, value: cl.id }))}
              value={selectedClient}
              onChange={setSelectedClient}
            />
          </Box>
          <TableAddButton label="Add Credit" link={links.createCredit} />
        </Flex>
      ) : (
        <Box mb="8px">
          <Flex justifyContent={"space-between"}>
            <Text
              color={textColor}
              fontSize="22px"
              fontWeight="700"
              lineHeight="100%"
            >
              Credit List
            </Text>

            <TableAddButton label="Add Credit" link={links.createCredit} />
          </Flex>
          <Flex justifyContent={"space-between"}>
            <Box mt={2} marginRight={10} width={"200px"}>
              <ReactSelect
                placeholder="Day plan"
                options={weekDayOptions}
                value={selectedDay}
                onChange={setSelectedDay}
              />
            </Box>
            <Box mt={2} marginRight={10} width={"200px"}>
              <ReactSelect
                placeholder="choose a clients"
                options={clients?.map((cl) => ({
                  label: cl.name,
                  value: cl.id,
                }))}
                value={selectedClient}
                onChange={setSelectedClient}
              />
            </Box>
          </Flex>
        </Box>
      )}
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
                    history.push(links.credit(row.original.id));
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

export default CreditList;
