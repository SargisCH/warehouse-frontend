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
  useDeleteProductCategoryMutation,
  useLazyGetProductCategoryByIdQuery,
  useUpdateProductCategoryMutation,
  useCreateProductCategoryMutation,
} from "api/productCategory";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { links } from "routes";

const UpsertproductCategory = (props: { create: boolean }) => {
  const [name, setName] = useState("");
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams() as any;

  const [createProductCategory] = useCreateProductCategoryMutation();
  const [updateProductCategory] = useUpdateProductCategoryMutation();
  const [deleteProductCategopry] = useDeleteProductCategoryMutation();
  const history = useHistory();
  const [getProductCategoryById] = useLazyGetProductCategoryByIdQuery();
  useEffect(() => {
    (async () => {
      if (params.productCategoryId) {
        setIsLoading(true);
        const res = await getProductCategoryById({
          productCategoryId: params.productCategoryId,
        });
        setName(res.data.name);
        setTimeout(() => {
          setIsLoading(false);
        }, 100);

        //setCurrency(productItemRes.data.currency);
      }
    })();
  }, [params.productCategoryId, getProductCategoryById]);

  const saveProductCategory = async () => {
    const data = {
      name,
    };
    if (params.productCategoryId) {
      await updateProductCategory({
        ...data,
        id: params.productId,
      });
    } else {
      await createProductCategory(data);
    }
    history.push(links.productCategories);
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
      </Flex>
      <Box mt={5}>
        <Button colorScheme="teal" onClick={() => saveProductCategory()}>
          Save
        </Button>
        {params.productCategoryId ? (
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
            await deleteProductCategopry(params.productCategoryId);
            history.push(links.productCategories);
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

export default UpsertproductCategory;
