import { useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  TableContainer,
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
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table";
import { useGetProductQuery } from "api/product";
// Custom components
import Card from "components/card/Card";
import * as React from "react";
import { OptionType } from "../../types";
import "./product.css";
import { useHistory, useLocation } from "react-router-dom";
import { links } from "../../routes";
import { TableAddButton } from "components/tableAddButton/TableAddButton";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import FilterDrawer, { FilterInstance } from "components/filter/FilterDrawer";
import { useGetUnitsQuery } from "api/unit";
import { useGetProductGroupQuery } from "api/productGroup";
import { useGetWarehouseQuery } from "api/warehouse";
import SelectedFilterPanel from "components/filter/SelectedFilterPanel";
import getProductCoumns, { RowObj } from "./column";
import MoveToWarehouseModal from "./MoveToWarehouse";
import { transformOptions } from "helpers/transformOptions";
import CustomTable from "components/table/Table";

const getFilters = (
  t: (token: string) => string,
  unitOptions: OptionType[],
  groupOptions: OptionType[],
  warehouseOptions: OptionType[],
): Array<FilterInstance> => [
  {
    field: "name",
    type: "text",
    id: "name",
    label: t("common.name"),
    placeholder: t("common.name"),
  },
  {
    field: "sku",
    type: "text",
    id: "sku",
    label: "SKU",
    placeholder: "SKU",
  },
  {
    field: "forSale",
    type: "boolean",
    id: "forSale",
    label: t("common.product.forSale"),
    placeholder: t("common.product.forSale"),
  },
  {
    field: "returnable",
    type: "boolean",
    id: "returnable",
    label: t("common.product.returnable"),
    placeholder: t("common.product.returnable"),
  },
  {
    field: "fractional",
    type: "boolean",
    id: "fractional",
    label: t("common.product.fractional"),
    placeholder: t("common.product.fractional"),
  },
  {
    field: "units",
    type: "select",
    id: "units",
    label: t("common.unit"),
    placeholder: t("common.unit"),
    options: unitOptions,
    multiple: true,
  },
  {
    field: "groups",
    type: "select",
    id: "groups",
    label: t("common.productGroups.productGroups"),
    placeholder: t("common.productGroups.productGroups"),
    options: groupOptions,
    multiple: true,
  },
  {
    field: "warehouses",
    type: "select",
    id: "warehouses",
    label: t("common.warehouse.warehouse"),
    placeholder: t("common.warehouse.warehouse"),
    options: warehouseOptions,
    multiple: true,
  },
];

// const columns = columnsDataCheck;
function ProductList() {
  const location = useLocation();
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const queryString = location.search;
  const { data: productResponse } = useGetProductQuery(
    { queryString },
    {
      refetchOnMountOrArgChange: true,
    },
  );
  const products = productResponse?.data ?? [];
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: units = [] } = useGetUnitsQuery();
  const { data: groups = [] } = useGetProductGroupQuery();
  const { data: warehouses = [] } = useGetWarehouseQuery();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const { t } = useTranslation();

  const options = useMemo(() => {
    const unitOptions = transformOptions(units, {
      label: (unit) => t(`common.units.${unit.name}`),
      value: "id",
    });
    return {
      units: unitOptions,
      warehouses: transformOptions(warehouses, { label: "name", value: "id" }),
      groups: transformOptions(groups, { label: "name", value: "id" }),
    };
  }, [warehouses, units, groups, t]);

  const filters = useMemo(
    () => getFilters(t, options.units, options.groups, options.warehouses),
    [t, options.units, options.groups, options.warehouses],
  );

  const columns = useMemo(() => getProductCoumns(t, textColor), [t, textColor]);

  const table = useReactTable({
    data: products,
    columns: columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => String(row.id),
  });

  const isRowsSelected = table.getIsSomeRowsSelected();
  const selectedRows = table.getSelectedRowModel().rows;

  // You can then map over selectedRows to get the original data:
  const selectedRowData = selectedRows.map((row) => row.original);
  const isMobile = useBreakpointValue({ base: true, md: false });
  // const sharedElements =
  //   <>
  //     <Text align={"right"} paddingRight="20">
  //       {t("common.totalWorth")}: {totalWorth}
  //     </Text>
  //   </>
  // );

  if (isMobile) {
    return (
      <Flex justifyContent={"flex-end"} mt="20px" mb="20px">
        <TableAddButton
          link={links.createProduct}
          label={t("common.product.addProduct")}
        />
      </Flex>
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
          {isRowsSelected && (
            <Menu>
              <MenuButton as={Button}>
                <FontAwesomeIcon icon={faEllipsis} />
              </MenuButton>
              <MenuList>
                <MenuItem
                  onClick={() => {
                    console.log("table", table.getSelectedRowModel());
                    onOpen();
                  }}
                >
                  {t("common.product.moveToWarehouse")}
                </MenuItem>
              </MenuList>
            </Menu>
          )}
          <FilterDrawer
            filters={filters}
            header={t("common.product.filterHeader")}
          />
        </Flex>
      </Flex>
      <Flex px={7}>
        <SelectedFilterPanel filters={filters} />
      </Flex>
      <MoveToWarehouseModal<RowObj>
        isOpen={isOpen}
        onClose={onClose}
        rowSelection={rowSelection}
        selectedRowData={selectedRowData}
      />
      <Box>
        <CustomTable<RowObj>
          tableInstance={table}
          totalPages={
            productResponse?.totalCount
              ? Math.floor(productResponse.totalCount / 10)
              : 1
          }
          editRowUrl={links.productItem}
        />

        {/*{sharedElements}*/}
      </Box>
    </Card>
  );
}

export default ProductList;
