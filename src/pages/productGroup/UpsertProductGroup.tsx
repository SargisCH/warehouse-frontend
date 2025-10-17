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
  useDeleteProductGroupMutation,
  useLazyGetProductGroupByIdQuery,
  useUpdateProductGroupMutation,
  useCreateProductGroupMutation,
} from "../../api/productGroup";
import AlertDialog from "components/alertDialog/AlertDialog";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { links } from "routes";

const UpsertProductGroup = (props: { create: boolean }) => {
  const [name, setName] = useState("");
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams() as any;

  const [createProductGroup] = useCreateProductGroupMutation();
  const [updateProductGroup] = useUpdateProductGroupMutation();
  const [deleteProductGroup] = useDeleteProductGroupMutation();
  const history = useHistory();
  const [getProductGroupById] = useLazyGetProductGroupByIdQuery();
  useEffect(() => {
    (async () => {
      if (params.productGroupId) {
        setIsLoading(true);
        const res = await getProductGroupById({
          productGroupId: params.productGroupId,
        });
        setName(res.data.name);
        setTimeout(() => {
          setIsLoading(false);
        }, 100);

        //setCurrency(productItemRes.data.currency);
      }
    })();
  }, [params.productGroupId, getProductGroupById]);

  const saveProductGroup = async () => {
    const data = {
      name,
    };
    if (params.productGroupId) {
      await updateProductGroup({
        ...data,
        id: params.productId,
      });
    } else {
      await createProductGroup(data);
    }
    history.push(links.productGroups);
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
            <FormLabel>{t("common.name")}</FormLabel>
            <Input
              type="text"
              placeholder={t("common.name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
        </Flex>
      </Flex>
      <Box mt={5}>
        <Button colorScheme="teal" onClick={() => saveProductGroup()}>
          {t("common.save")}
        </Button>
        {params.productGroupId ? (
          <Button
            ml={4}
            colorScheme="red"
            onClick={() => setIsDeleteDialogOpened(true)}
          >
            {t("common.delete")}
          </Button>
        ) : null}
      </Box>
      {isDeleteDialogOpened ? (
        <AlertDialog
          handleConfirm={async () => {
            await deleteProductGroup(params.productGroupId);
            history.push(links.productGroups);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={`Are you sure? You can't undo this action afterwards.`}
          headerText={t("common.productGroups.deleteHeaderText")}
        />
      ) : null}
    </Flex>
  );
};

export default UpsertProductGroup;
