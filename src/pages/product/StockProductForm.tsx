import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Box,
  NumberInput,
  NumberInputField,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import {
  useAddInStockMutation,
  useGetProductQuery,
  useLazyGetStockProductByIdQuery,
  useUpdateStockProductByIdMutation,
} from "api/product";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import { links } from "routes";

function getQueryParamBoolean(url: string, param: string) {
  // Create a URL object
  const urlObject = new URL(url);

  // Get the value of the query parameter
  const paramValue = urlObject.searchParams.get(param);

  // Check if the parameter value is a boolean
  if (paramValue !== null) {
    if (paramValue.toLowerCase() === "true") {
      return true;
    } else if (paramValue.toLowerCase() === "false") {
      return false;
    } else {
      // If the parameter value is not 'true' or 'false', return null
      return null;
    }
  } else {
    // If the parameter is not found in the URL, return null
    return null;
  }
}
const StockProductForm = () => {
  const params = useParams<{ stockProductId: string }>();
  const [selectedProduct, setSelectedProduct] = useState<{
    label: string;
    value: string;
  }>();
  const [inStock, setInStock] = useState<number | string>(0);
  const [selectedInStockUnit, setSelectedInStockUnit] = useState<{
    label: string;
    value: string;
  }>();
  const [noCalculation, setNoCalculation] = useState(false);

  const [createStockProduct, { isError, error }] = useAddInStockMutation();
  const [updateStockProductById] = useUpdateStockProductByIdMutation();
  const history = useHistory();
  const { data: products = [] } = useGetProductQuery();
  const [getStockProduct] = useLazyGetStockProductByIdQuery();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const saveStockProduct = async (noCalculationArg?: boolean) => {
    const data = {
      productId: Number(selectedProduct.value),
      inStock: Number(inStock),
      inStockUnit: selectedInStockUnit.value,
      noCalculation: noCalculationArg ?? noCalculation,
    };

    if (params.stockProductId) {
      updateStockProductById({ ...data, id: Number(params.stockProductId) });
    } else {
      createStockProduct(data);
    }
    history.push(links.product);
  };
  useEffect(() => {
    (async () => {
      console.log(params.stockProductId);
      if (!params.stockProductId) return;
      const stockProductRes = await getStockProduct({
        stockProductId: params.stockProductId,
      });
      if (!stockProductRes) return;
      const product = products?.find(
        (p) => p.id === stockProductRes.data.productId,
      );
      if (!product) return;
      setSelectedProduct({ label: product.name, value: String(product.id) });
      setInStock(stockProductRes.data.inStock);
      setSelectedInStockUnit({
        label: stockProductRes.data.inStockUnit,
        value: stockProductRes.data.inStockUnit,
      });
    })();
  }, [
    params.stockProductId,
    products,
    setSelectedInStockUnit,
    setInStock,
    setSelectedProduct,
    getStockProduct,
  ]);
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
              isDisabled={Boolean(params.stockProductId)}
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
        <FormControl>
          <Flex alignItems={"center"}>
            <Checkbox
              id="noCalculation"
              checked={noCalculation}
              onChange={(e) => setNoCalculation(e.target.checked)}
            />
            <FormLabel
              htmlFor="noCalculation"
              alignItems={"center"}
              ml="10px"
              mb="0"
            >
              I don't want to make any calculation when updating product count{" "}
            </FormLabel>
          </Flex>
        </FormControl>
      </Box>
      <Box mt={5}>
        <Button
          colorScheme="teal"
          onClick={() => {
            if (!noCalculation) {
              onOpen();
            }
          }}
        >
          Save
        </Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader></ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              This action will make changes in the invetory section (creating a
              stock product will decrease the amount in the inventory you used).
              Click Yes button if you want to make the calculation and No
              Calculation button if you prefer otherwise
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button variant="ghost" onClick={() => saveStockProduct()}>
                Yes
              </Button>
              <Button variant="ghost" onClick={() => saveStockProduct(true)}>
                No calculation
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Flex>
  );
};

export default StockProductForm;
