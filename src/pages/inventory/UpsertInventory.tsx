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
  InventoryItem,
  useCreateInventoryMutation,
  useDeleteInventoryMutation,
  useGetInventoryByIdQuery,
  useLazyGetInventoryByIdQuery,
  useUpdateInventoryMutation,
} from "api/inventory";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import { links } from "routes";

const UpsertInventory = (props: { create: boolean }) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | string>();
  const [price, setPrice] = useState<number | string>();
  const [currency, setCurrency] = useState<string>("");
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<{
    label: string;
    value: string;
  }>();
  const params = useParams() as any;
  const [createInventory, { isLoading, isError, error }] =
    useCreateInventoryMutation();
  const [updateInventory] = useUpdateInventoryMutation();
  const [deleteInventory] = useDeleteInventoryMutation();
  const history = useHistory();
  // Use the mutation hook
  //const layout = useBreakpointValue({
  //base: "mobile",
  //md: "tablet",
  //lg: "desktop",
  //});
  //const direction = ["tablet", "mobile"].includes(layout) ? "column" : "row";
  const [getInventoryById] = useLazyGetInventoryByIdQuery();
  useEffect(() => {
    (async () => {
      if (params.inventoryId) {
        const inventoryItemRes = await getInventoryById({
          inventoryId: params.inventoryId,
        });
        setName(inventoryItemRes.data.name);
        setAmount(inventoryItemRes.data.amount);
        setSelectedUnit({
          label: inventoryItemRes.data.amountUnit,
          value: inventoryItemRes.data.amountUnit,
        });
        setCurrency(inventoryItemRes.data.currency);
      }
    })();
  }, [params.inventoryId]);

  const saveInventory = async () => {
    const data = {
      name,
      amount,
      amountUnit: selectedUnit.value,
      price,
    };
    if (params.inventoryId) {
      await updateInventory({
        name,
        amount,
        amountUnit: selectedUnit.value,
        id: params.inventoryId,
        price,
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
          <FormControl>
            <FormLabel>Amount</FormLabel>
            <NumberInput value={amount} onChange={setAmount}>
              <NumberInputField placeholder="Amount" />
            </NumberInput>
          </FormControl>
        </Flex>
        <Flex gap="20px" direction={"column"}>
          <FormControl>
            <FormLabel>Amount Unit</FormLabel>
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
          <FormControl>
            <FormLabel>Price</FormLabel>
            <NumberInput value={price} onChange={setPrice}>
              <NumberInputField placeholder="Price" />
            </NumberInput>
            <Input type="number" />
          </FormControl>
        </Flex>
        <Flex gap="20px">
          <FormControl>
            <FormLabel>Currency {currency}</FormLabel>
            <Input
              type="text"
              placeholder="Currency"
              defaultValue={currency}
              disabled={true}
            />
          </FormControl>
        </Flex>
      </Flex>
      <Box mt={5}>
        <Button colorScheme="teal" onClick={() => saveInventory()}>
          Save
        </Button>
        {params.inventoryId ? (
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
            await deleteInventory(params.inventoryId);
            history.push(links.inventory);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={`Are you sure? You can't undo this action afterwards.`}
          headerText={`Delete Inventory`}
        />
      ) : null}
    </Flex>
  );
};

export default UpsertInventory;
