import {
  Box,
  Button,
  Flex,
  Tag,
  TagCloseButton,
  TagLabel,
} from "@chakra-ui/react";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaTimesCircle } from "react-icons/fa";
import { useHistory, useLocation } from "react-router-dom";
import { FilterInstance } from "./FilterDrawer";

export default function SelectedFilterPanel({
  filters,
}: {
  filters: Array<FilterInstance>;
}) {
  const location = useLocation();
  const history = useHistory();
  const selectedFilters = Object.fromEntries(
    new URLSearchParams(location.search).entries(),
  );
  function deleteParam(key: string, filterType: "text"): void;
  function deleteParam(key: string, filterType: "select", value: string): void;
  function deleteParam(key: string, filterType: "boolean"): void;

  function deleteParam(key: unknown, filterType: unknown, value?: unknown) {
    if (typeof key !== "string") return;
    let newParams = { ...selectedFilters };
    if (filterType === "text" || filterType === "boolean") {
      delete newParams[key];
    } else if (filterType === "select") {
      const splittedParam = selectedFilters[key].split(",");
      const newParam = splittedParam.filter((p) => p !== value);
      if (newParam.length) {
        newParams[key] = newParam.join(",");
      } else {
        delete newParams[key];
      }
    }
    const newSearchParams = new URLSearchParams(newParams);
    history.replace({
      pathname: location.pathname,
      search: newSearchParams.toString(),
    });
  }
  return (
    <Flex gap={2}>
      {Object.entries(selectedFilters).map(([key, value]) => {
        const filterInstance: FilterInstance = filters.find(
          (filter) => filter.field === key,
        );
        if (!filterInstance) return null;
        if (filterInstance.type === "text") {
          return (
            <Tag size={"lg"} variant="solid" colorScheme="teal">
              <TagLabel>{value}</TagLabel>
              <TagCloseButton onClick={() => deleteParam(key, "text")} />
            </Tag>
          );
        } else if (filterInstance.type === "select") {
          const valueArray = value.split(",");
          const selectedOptions: Array<{
            label: string;
            value: string | number;
          }> = filterInstance.options.filter((opt) =>
            valueArray.includes(String(opt.value)),
          );
          return selectedOptions.map((opt) => (
            <Tag size={"lg"} key={opt.value} variant="solid" colorScheme="teal">
              <TagLabel>{opt.label}</TagLabel>
              <TagCloseButton
                onClick={() => deleteParam(key, "select", String(opt.value))}
              />
            </Tag>
          ));
        } else if (filterInstance.type === "boolean") {
          return (
            <Tag
              size={"lg"}
              variant="solid"
              colorScheme={value === "true" ? "teal" : "red"}
            >
              <TagLabel>{filterInstance.label}</TagLabel>
              <TagCloseButton onClick={() => deleteParam(key, "boolean")} />
            </Tag>
          );
        }
      })}
    </Flex>
  );
}
