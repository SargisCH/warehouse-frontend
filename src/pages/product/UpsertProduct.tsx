import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Box,
  Spinner,
} from "@chakra-ui/react";
import {
  useDeleteProductMutation,
  useLazyGetProductByIdQuery,
  useUpdateProductMutation,
  useCreateProductMutation,
} from "api/product";
import { useGetInventoryQuery } from "api/inventory";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import { links } from "routes";
import IngredientAmountModal from "./IngredientAmountModal";

const UpsertProduct = (props: { create: boolean }) => {
  const [name, setName] = useState("");
  const [inStock, setInStock] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  //const [currency, setCurrency] = useState<string>("");
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<{
    label: string;
    value: string;
  }>();
  const [selectedInStockUnit, setSelectedInStockUnit] = useState<{
    label: string;
    value: string;
  }>();
  const [selectedInventory, setSelectedInventory] = useState([]);
  const [ingredientAmounts, setIngredientAmounts] = useState<{
    [key: number | string]: { amount: number; unit: string };
  }>({});
  const [ingredientsDefaultAmount, setDefaultIngredientsAmount] = useState<{
    [key: number | string]: { amount: number; unit: string };
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams() as any;
  const { data: inventoryData = [] } = useGetInventoryQuery();

  const [createProduct, { isError, error }] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const history = useHistory();
  // Use the mutation hook
  //const layout = useBreakpointValue({
  //base: "mobile",
  //md: "tablet",
  //lg: "desktop",
  //});
  //const direction = ["tablet", "mobile"].includes(layout) ? "column" : "row";
  const [getProductById] = useLazyGetProductByIdQuery();
  useEffect(() => {
    (async () => {
      if (params.productId) {
        setIsLoading(true);
        const productItemRes = await getProductById({
          productId: params.productId,
        });
        setName(productItemRes.data.name);
        setInStock(productItemRes.data.inStock);
        setPrice(productItemRes.data.price);
        setSelectedUnit({
          label: productItemRes.data.priceUnit,
          value: productItemRes.data.priceUnit,
        });
        setSelectedInStockUnit({
          label: productItemRes.data.inStockUnit,
          value: productItemRes.data.inStockUnit,
        });
        const inventoryArray: Array<{ label: string; value: number }> = [];
        const ingredientsAmountDefault: {
          [key: number | string]: { unit: string; amount: number };
        } = {};
        productItemRes.data.ingredients.forEach(
          ({ inventoryId, amountUnit, amount }) => {
            const inventoryMatched = inventoryData.find(
              (inv) => inv.id === inventoryId
            );
            if (inventoryMatched) {
              inventoryArray.push({
                label: inventoryMatched.name,
                value: inventoryMatched.id,
              });
            }
            ingredientsAmountDefault[inventoryId] = {
              unit: amountUnit,
              amount: amount,
            };
          }
        );
        setSelectedInventory(inventoryArray);
        setDefaultIngredientsAmount(ingredientsAmountDefault);
        setIngredientAmounts(ingredientsAmountDefault);
        setTimeout(() => {
          setIsLoading(false);
        }, 100);

        //setCurrency(productItemRes.data.currency);
      }
    })();
  }, [params.productId, getProductById, inventoryData]);

  const saveProduct = async () => {
    const ingredients: Array<{
      inventory: number;
      amount: number;
      unit: string;
    }> = [];
    console.log("selcted inventory", selectedInventory);
    Object.keys(ingredientAmounts).forEach((invId: number | string) => {
      const invIndex = selectedInventory.findIndex((inv) => {
        console.log(inv.value, invId);
        return inv.value === Number(invId);
      });
      console.log("invIndex", invIndex);
      if (invIndex === -1) {
        return;
      }
      if (!ingredientAmounts?.[invId]) return;
      console.log("aaaa");
      ingredients.push({
        inventory: Number(invId),
        amount: ingredientAmounts[invId].amount,
        unit: ingredientAmounts[invId].unit,
      });
    });
    const data = {
      name,
      inStock,
      inStockUnit: selectedInStockUnit.value,
      priceUnit: selectedUnit.value,
      price,
      ingredients,
    };
    if (params.productId) {
      console.log("data", data);
      await updateProduct({
        ...data,
        id: params.productId,
      });
    } else {
      await createProduct(data);
    }
  };
  if (isLoading) {
    return (
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    );
  }
  return (
    <Flex direction="column">
      <Flex gap="20px">
        <Flex direction={"column"} gap="20px">
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>In Stock</FormLabel>
            <Input
              type="number"
              placeholder="In Stock"
              value={inStock}
              onChange={(e) => setInStock(Number(e.target.value))}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Ingredients</FormLabel>
            <Select
              isMulti
              value={selectedInventory}
              onChange={(valueSelected) => {
                setSelectedInventory([...valueSelected]);
              }}
              options={inventoryData.map((inv) => ({
                label: inv.name,
                value: inv.id,
              }))}
            />
          </FormControl>
        </Flex>
        <Flex gap="20px" direction={"column"}>
          <FormControl>
            <FormLabel>Price</FormLabel>
            <Input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
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
        <Flex>
          <FormControl>
            <FormLabel>Price Unit</FormLabel>
            <Select
              value={selectedUnit}
              onChange={(valueSelected) => {
                setSelectedUnit(valueSelected);
              }}
              options={[
                { label: "KG", value: "kg" },
                { label: "GRAM", value: "g" },
              ]}
            />
          </FormControl>
        </Flex>

        {/*<Flex gap="20px">*/}
        {/*<FormControl>*/}
        {/*<FormLabel>Currency {currency}</FormLabel>*/}
        {/*<Input*/}
        {/*type="text"*/}
        {/*placeholder="Currency"*/}
        {/*defaultValue={currency}*/}
        {/*disabled={true}*/}
        {/*/>*/}
        {/*</FormControl>*/}
        {/*</Flex>*/}
      </Flex>
      <Box mt={5}>
        <Button colorScheme="teal" onClick={() => saveProduct()}>
          Save
        </Button>
        <IngredientAmountModal
          selectedIngredients={selectedInventory}
          setIngredientsAmount={(amounts: {
            [key: number | string]: {
              amount: number;
              unit: string;
            };
          }) => {
            setIngredientAmounts(amounts);
          }}
          inventoryAmounts={ingredientsDefaultAmount}
        />
        {params.productId ? (
          <Button
            ml={4}
            colorScheme="red"
            onClick={() => setIsDeleteDialogOpened(true)}
          >
            Delete
          </Button>
        ) : null}
      </Box>
      {isDeleteDialogOpened ? (
        <AlertDialog
          handleConfirm={async () => {
            await deleteProduct(params.productId);
            history.push(links.product);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={`Are you sure? You can't undo this action afterwards.`}
          headerText={`Delete Product`}
        />
      ) : null}
    </Flex>
  );
};

export default UpsertProduct;
