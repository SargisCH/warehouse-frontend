import { Checkbox, Flex, Text } from "@chakra-ui/react";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createColumnHelper } from "@tanstack/react-table";
import { FaHeart } from "react-icons/fa";

export type RowObj = {
  id: number;
  name: string;
  unit: { id: number; name: string };
  warehouse: { id: number; name: string };
  group: { id: number; name: string };
  officialName: string;
  forSale: boolean;
  returnable: boolean;
  sku: string;
  fractional: boolean;
};
export const SELECT_COL_ID = "select-col";

const columnHelper = createColumnHelper<RowObj>();

const BooleanCell = ({ value }: { value: boolean }) => {
  return (
    <Flex align="center" pl={9}>
      {value ? (
        <FontAwesomeIcon icon={faCheckCircle} color="green" />
      ) : (
        <FontAwesomeIcon icon={faTimesCircle} color="red" />
      )}
    </Flex>
  );
};

export const TextCell = ({ text, color }: { text: string; color: string }) => {
  return (
    <Flex align="center">
      <Text color={color} fontSize="sm" fontWeight="700">
        {text}
      </Text>
    </Flex>
  );
};
const Header = ({ header }: { header: string }) => {
  return (
    <Text
      justifyContent="space-between"
      align="center"
      fontSize={{ sm: "10px", lg: "12px" }}
      color="gray.400"
    >
      {header}
    </Text>
  );
};

export default function getProductCoumns(
  t: (key: string, option?: { [key: string]: string }) => string,
  textColor: string,
) {
  return [
    columnHelper.display({
      id: SELECT_COL_ID,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          isIndeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()} //or getToggleAllPageRowsSelectedHandler
        />
      ),
      cell: ({ row }) => {
        return (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        );
      },
    }),
    columnHelper.accessor("name", {
      id: "name",
      header: () => <Header header={t("common.name")} />,
      cell: (info: any) => {
        return <TextCell text={info.getValue()} color={textColor} />;
      },
    }),
    columnHelper.accessor("forSale", {
      id: "forSale",
      header: () => <Header header={t("common.product.forSale")} />,
      cell: (info) => <BooleanCell value={info.getValue()} />,
    }),
    columnHelper.accessor("returnable", {
      id: "returnable",
      header: () => <Header header={t("common.product.returnable")} />,
      cell: (info) => <BooleanCell value={info.getValue()} />,
    }),
    columnHelper.accessor("fractional", {
      id: "fractional",
      header: () => <Header header={t("common.product.fractional")} />,
      cell: (info) => <BooleanCell value={info.getValue()} />,
    }),
    columnHelper.accessor("unit.name", {
      id: "unit",
      header: () => <Header header={t("common.units.unit")} />,
      cell: (info) => (
        <TextCell
          text={t(`common.units.${info.getValue()}`)}
          color={textColor}
        />
      ),
    }),
    columnHelper.accessor("warehouse.name", {
      id: "warehouse",
      header: () => <Header header={t("common.warehouse.warehouse")} />,
      cell: (info) => <TextCell text={info.getValue()} color={textColor} />,
    }),
    columnHelper.accessor("sku", {
      id: "sku",
      header: () => <Header header="SKU" />,
      cell: (info) => <TextCell text={info.getValue()} color={textColor} />,
    }),
    columnHelper.accessor("group.name", {
      id: "group",
      header: () => <Header header={t("common.productGroups.productGroups")} />,
      cell: (info) => <TextCell text={info.getValue()} color={textColor} />,
    }),
    // isMobile &&
    //   columnHelper.display({
    //     id: "actions3",
    //     header: () => "",
    //     cell: (info) => (
    //       <Button
    //         fontSize={isMobile ? "14px" : ""}
    //         colorScheme={"green"}
    //         onClick={(e) => {
    //           history.push(links.productItem(info.row.original?.id));
    //         }}
    //       >
    //         {t("common.edit")}
    //       </Button>
    //     ),
    //   }),
  ];
}
