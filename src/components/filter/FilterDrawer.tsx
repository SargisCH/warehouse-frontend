import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormLabel,
  Input,
  Switch,
  useDisclosure,
} from "@chakra-ui/react";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Select from "react-select";

export type FilterInstance =
  | {
      id?: string;
      label?: string;
      type: "text";
      placeholder: string;
      field: string;
    }
  | {
      id?: string;
      label?: string;
      type: "select";
      placeholder: string;
      field: string;
      options: Array<{ label: string; value: string | number }>;
      multiple?: boolean;
    }
  | {
      id?: string;
      label?: string;
      type: "boolean";
      placeholder: string;
      field: string;
    };
type Props = {
  header: string;
  filters: Array<FilterInstance>;
};

let timeout: ReturnType<typeof setTimeout>;
const debounceParams = (updateFn: () => void) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    updateFn();
  }, 500);
};

export default function FilterDrawer({ header, filters }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const history = useHistory();
  const defaultState: { [key: string]: any } = Object.fromEntries(
    new URLSearchParams(location.search).entries(),
  );
  const [filterState = {}, setFilterState] = useState(defaultState);
  useEffect(() => {
    const stateUpdated = Object.fromEntries(
      new URLSearchParams(location.search).entries(),
    );
    delete stateUpdated.page;
    setFilterState(stateUpdated);
  }, [location.search]);
  const updateParams = (
    name: string,
    value: string | number | boolean | Array<string | number>,
  ) => {
    debounceParams(() => {
      const newParams = new URLSearchParams(location.search);
      newParams.set(name, value as string);
      newParams.delete("page");
      history.replace({
        pathname: location.pathname,
        search: newParams.toString(),
      });
    });
  };
  return (
    <>
      <Flex align={"center"} p={2}>
        <FontAwesomeIcon icon={faFilter} onClick={onOpen} color="blue" />
      </Flex>
      <Drawer isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{header}</DrawerHeader>

          <DrawerBody>
            <Flex direction="column" gap={4}>
              {filters.map((filter) => {
                if (filter.type === "text") {
                  return (
                    <Flex direction="column" key={filter.id}>
                      <FormLabel htmlFor={filter.id}>{filter.label}</FormLabel>
                      <Input
                        placeholder={filter.placeholder}
                        id={filter.id}
                        value={filterState[filter.field]}
                        onChange={(e) => {
                          setFilterState({
                            ...filterState,
                            [filter.field]: e.target.value,
                          });
                          updateParams(filter.field, e.target.value);
                        }}
                      />
                    </Flex>
                  );
                } else if (filter.type === "select") {
                  return (
                    <Flex direction="column" key={filter.id}>
                      <FormLabel htmlFor={filter.id}> {filter.label}</FormLabel>
                      <Select
                        placeholder={filter.placeholder}
                        options={filter.options}
                        isMulti={filter.multiple}
                        value={
                          filter.multiple
                            ? filter.options.filter((opt) =>
                                filterState?.[filter.field]?.includes(
                                  opt.value,
                                ),
                              )
                            : filter.options.find(
                                (opt) =>
                                  opt.value === filterState[filter.field],
                              )
                        }
                        onChange={(selected) => {
                          let newValue;
                          if (filter.multiple && Array.isArray(selected)) {
                            newValue = selected.map((opt) => opt.value);
                          } else if (!filter.multiple) {
                            newValue = (
                              selected as {
                                label: string;
                                value: string | number;
                              }
                            ).value;
                          }
                          setFilterState({
                            ...filterState,
                            [filter.field]: newValue,
                          });
                          updateParams(filter.field, newValue);
                        }}
                      />
                    </Flex>
                  );
                } else if (filter.type === "boolean") {
                  return (
                    <Flex direction="column" key={filter.id}>
                      <FormLabel htmlFor={filter.id}> {filter.label}</FormLabel>
                      <Switch
                        placeholder={filter.placeholder}
                        isChecked={
                          filterState[filter.field] ||
                          filterState[filter.field] === "true"
                        }
                        onChange={(e) => {
                          setFilterState({
                            ...filterState,
                            [filter.field]: e.target.checked,
                          });
                          updateParams(filter.field, e.target.checked);
                        }}
                      />
                    </Flex>
                  );
                }
              })}
            </Flex>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="solid"
              mr={3}
              onClick={() => {
                setFilterState({});
                history.replace({ pathname: location.pathname, search: "" });
              }}
            >
              Reset
            </Button>
            <Button colorScheme="brand">Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
