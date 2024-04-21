import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Box,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import {
  useCreateInventoryMutation,
  useLazyGetInventoryByIdQuery,
  useUpdateInventoryMutation,
} from "api/inventory";
import withAdminRoute from "hocs/withAdminRoute";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { links } from "routes";

const UpsertInventory = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | string>();
  const params = useParams() as any;
  const [createInventory] = useCreateInventoryMutation();
  const [updateInventory] = useUpdateInventoryMutation();
  const history = useHistory();
  const [getInventoryById] = useLazyGetInventoryByIdQuery();
  useEffect(() => {
    (async () => {
      if (params.inventoryId) {
        const inventoryItemRes = await getInventoryById({
          inventoryId: params.inventoryId,
        });
        setName(inventoryItemRes.data.name);
        setPrice(inventoryItemRes.data.price);
      }
    })();
  }, [params.inventoryId, getInventoryById]);

  const saveInventory = async () => {
    const data = {
      name,
      price: Number(price),
    };
    if (params.inventoryId) {
      await updateInventory({
        name,
        id: params.inventoryId,
        price: Number(price),
      });
    } else {
      await createInventory(data);
    }
    history.push(links.inventory);
  };

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
        </Flex>
        <Flex gap="20px" direction={"column"}>
          <FormControl>
            <FormLabel>Price</FormLabel>
            <NumberInput value={price} onChange={setPrice}>
              <NumberInputField placeholder="Price" />
            </NumberInput>
          </FormControl>
        </Flex>
      </Flex>
      <Box mt={5}>
        <Button colorScheme="teal" onClick={() => saveInventory()}>
          Save
        </Button>
      </Box>
    </Flex>
  );
};

export default withAdminRoute(UpsertInventory);
