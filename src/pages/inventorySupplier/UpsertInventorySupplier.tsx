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
  useDeleteInventorySupplierMutation,
  useLazyGetInventorySupplierByIdQuery,
  useUpdateInventorySupplierMutation,
  useCreateInventorySupplierMutation,
} from "api/inventorySupplier";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { links } from "routes";

const UpsertInventorySupplier = (props: { create: boolean }) => {
  const [name, setName] = useState("");
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams() as any;

  const [createInventorySupplier] = useCreateInventorySupplierMutation();
  const [updateInventorySupplier] = useUpdateInventorySupplierMutation();
  const [deleteInventorySupplier] = useDeleteInventorySupplierMutation();
  const history = useHistory();
  // Use the mutation hook
  //const layout = useBreakpointValue({
  //base: "mobile",
  //md: "tablet",
  //lg: "desktop",
  //});
  //const direction = ["tablet", "mobile"].includes(layout) ? "column" : "row";
  const [getInventorySupplierById] = useLazyGetInventorySupplierByIdQuery();
  useEffect(() => {
    (async () => {
      if (params.inventorySupplierId) {
        setIsLoading(true);
        const res = await getInventorySupplierById({
          inventorySupplierId: params.inventorySupplierId,
        });
        setName(res.data.name);
        setTimeout(() => {
          setIsLoading(false);
        }, 100);

        //setCurrency(productItemRes.data.currency);
      }
    })();
  }, [params.inventorySupplierId, getInventorySupplierById]);

  const savePartner = async () => {
    const data = {
      name,
    };
    if (params.productId) {
      await updateInventorySupplier({
        ...data,
        id: params.productId,
      });
    } else {
      await createInventorySupplier(data);
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
        <Button colorScheme="teal" onClick={() => savePartner()}>
          Save
        </Button>
        {params.inventorySupplierId ? (
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
            await deleteInventorySupplier(params.inventorySupplierId);
            history.push(links.suppliers);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={`Are you sure? You can't undo this action afterwards.`}
          headerText={`Delete Inventory Supplier`}
        />
      ) : null}
    </Flex>
  );
};

export default UpsertInventorySupplier;
