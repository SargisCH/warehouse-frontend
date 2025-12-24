import { useState } from "react";
import {
  Flex,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Table,
  useColorModeValue,
  useBreakpointValue,
  Box,
} from "@chakra-ui/react";
import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import { useHistory } from "react-router-dom";
import Pagination from "../pagination/Pagination";

const SELECT_COL_ID = "select-col";

type Props<T> = {
  tableInstance: ReactTable<T>;
  editRowUrl?: (id: string) => string;
  totalPages?: number;
  rowSelection?: Record<number | string, boolean | number | string>;
};

export default function CustomTable<T extends { id: number | string }>({
  tableInstance,
  editRowUrl,
  totalPages,
}: Props<T>) {
  const history = useHistory();
  const [page, setPage] = useState(1);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (isMobile) {
    return (
      <Box>
        {tableInstance.getRowModel().rows.map((row) => (
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
        {/*{sharedElements}*/}
      </Box>
    );
  }
  console.log("rerender custom table:");
  return (
    <TableContainer maxHeight={"700px"} overflowY="auto">
      <Table
        size="md"
        variant="striped"
        color="gray.500"
        mb="24px"
        mt="12px"
        colorScheme="lightgrey"
      >
        <Thead>
          {tableInstance.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <Th
                    key={header.id}
                    colSpan={header.colSpan}
                    pe="10px"
                    borderColor={borderColor}
                    onClick={header.column.getToggleSortingHandler()}
                    width={{ sm: "150px", md: "200px", lg: "auto" }}
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
          {tableInstance.getRowModel().rows.map((row) => {
            return (
              <Tr key={row.id} cursor="pointer">
                {row.getVisibleCells().map((cell) => {
                  return (
                    <Td
                      key={cell.id}
                      fontSize={{ sm: "14px" }}
                      width={{ sm: "150px", md: "200px", lg: "auto" }}
                      borderColor="transparent"
                      onClick={() => {
                        if (cell.column.id === SELECT_COL_ID) {
                          return;
                        }
                        if (editRowUrl) {
                          history.push(editRowUrl(String(row.original.id)));
                        }
                      }}
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
        setQueryParams
        currentPage={page}
        onPageChange={(pageUpdated) => setPage(pageUpdated)}
        totalPages={totalPages || 1}
      />
    </TableContainer>
  );
}
