import {
  Box,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import dayjs from "dayjs";
import { formatMoney, formatQuantity } from "helpers/money";

export type GridColumn<T> = {
  id: string;
  label: string;
  // How the cell reads; money and quantity are right-aligned.
  format?: "money" | "quantity" | "date";
  render?: (row: T) => ReactNode;
};

type Props<T> = {
  columns: GridColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  // Footer values by column id, shown under the matching column.
  totals?: Record<string, string | number | undefined>;
  emptyText?: string;
};

const formatCell = (value: any, format?: GridColumn<any>["format"]) => {
  if (value === undefined || value === null || value === "") return "—";
  if (format === "money") return formatMoney(value);
  if (format === "quantity") return formatQuantity(value);
  if (format === "date") return dayjs(value).format("DD/MM/YYYY");
  return String(value);
};

/** The plain ERP-style grid the document and report screens share. */
export function DataGrid<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  totals,
  emptyText,
}: Props<T>) {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const numeric = (column: GridColumn<T>) =>
    column.format === "money" || column.format === "quantity";

  return (
    <Box overflowX="auto">
      <Table size="sm" variant="simple" color="gray.500">
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th
                key={column.id}
                borderColor={borderColor}
                isNumeric={numeric(column)}
              >
                <Text fontSize="11px" color="gray.400">
                  {column.label}
                </Text>
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row, index) => (
            <Tr
              key={rowKey(row, index)}
              cursor={onRowClick ? "pointer" : undefined}
              _hover={onRowClick ? { bg: "blackAlpha.50" } : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <Td
                  key={column.id}
                  borderColor={borderColor}
                  isNumeric={numeric(column)}
                >
                  <Text color={textColor} fontSize="sm">
                    {column.render
                      ? column.render(row)
                      : formatCell((row as any)[column.id], column.format)}
                  </Text>
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
        {totals && rows.length ? (
          <Tfoot>
            <Tr>
              {columns.map((column) => (
                <Th key={column.id} isNumeric={numeric(column)}>
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    {column.id in totals
                      ? formatCell(totals[column.id], column.format)
                      : ""}
                  </Text>
                </Th>
              ))}
            </Tr>
          </Tfoot>
        ) : null}
      </Table>
      {!rows.length ? (
        <Flex justify="center" p="24px">
          <Text color="gray.400" fontSize="sm">
            {emptyText ?? "—"}
          </Text>
        </Flex>
      ) : null}
    </Box>
  );
}
