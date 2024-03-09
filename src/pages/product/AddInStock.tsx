import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Box,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { useAddInStockMutation, useGetProductQuery } from "api/product";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import { links } from "routes";

const AddInStock = () => {
  const [selectedProduct, setSelectedProduct] = useState<{
    label: string;
    value: string;
  }>();
  const [inStock, setInStock] = useState<number | string>(0);
  const [selectedInStockUnit, setSelectedInStockUnit] = useState<{
    label: string;
    value: string;
  }>();

  const [createStockProduct, { isError, error }] = useAddInStockMutation();
  const history = useHistory();
  const { data: products } = useGetProductQuery();
  const saveStockProduct = async () => {
    const data = {
      productId: Number(selectedProduct.value),
      inStock: Number(inStock),
      inStockUnit: selectedInStockUnit.value,
    };

    createStockProduct(data);
    history.push(links.product);
  };
  return (
    <Flex direction="column">
      <Flex gap="20px">
        <Flex gap="20px">
          <FormControl>
            <FormLabel>Product</FormLabel>
            <Select
              value={selectedProduct}
              onChange={(valueSelected) => {
                setSelectedProduct(valueSelected);
              }}
              options={products.map((pr) => ({
                label: pr.name,
                value: String(pr.id),
              }))}
            />
          </FormControl>
          <FormControl>
            <FormLabel>In Stock</FormLabel>
            <NumberInput value={inStock} onChange={setInStock}>
              <NumberInputField placeholder="In Stock" />
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel>In Stock Unit</FormLabel>
            <Select
              value={selectedInStockUnit}
              onChange={(valueSelected) => {
                setSelectedInStockUnit(valueSelected);
              }}
              options={[
                { label: "KG", value: "kg" },
                { label: "GRAM", value: "g" },
              ]}
            />
          </FormControl>
        </Flex>
      </Flex>
      <Box mt={5}>
        <Button colorScheme="teal" onClick={saveStockProduct}>
          Save
        </Button>
      </Box>
    </Flex>
  );
};

export default AddInStock;
