import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Box,
  NumberInput,
  NumberInputField,
  useBreakpointValue,
  useToast,
  Text,
} from "@chakra-ui/react";
import {
  useCreateInventoryMutation,
  useLazyGetInventoryByIdQuery,
  useUpdateInventoryMutation,
} from "api/inventory";
import * as Yup from "yup";
import { useFormik } from "formik";
import withAdminRoute from "hocs/withAdminRoute";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { links } from "routes";
const ValidationSchema = Yup.object().shape({
  name: Yup.string().required("required"),
  price: Yup.string().required("required"),
});

const UpsertInventory = () => {
  const toast = useToast();
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | string>();
  const params = useParams() as any;
  const { t } = useTranslation();
  const [
    createInventory,
    {
      isSuccess: isSuccessCreate,
      error,
      isError: isErrorCreate,
      isLoading: isLoadingCreate,
    },
  ] = useCreateInventoryMutation();
  const [
    updateInventory,
    {
      isSuccess: isSuccessUpdate,
      isLoading: isLoadingUpdate,
      isError: isErrorUpdate,
      data: updateResponse,
    },
  ] = useUpdateInventoryMutation();
  const history = useHistory();
  const [getInventoryById] = useLazyGetInventoryByIdQuery();
  const formik = useFormik({
    initialValues: {
      name: name,
      price: price,
    },
    validationSchema: ValidationSchema,
    onSubmit: async (values) => {
      const data = {
        name: values.name,
        price: Number(values.price),
      };
      if (params.inventoryId) {
        await updateInventory({
          id: params.inventoryId,
          ...data,
        });
      } else {
        await createInventory(data);
      }
    },
  });
  const isMobile = useBreakpointValue({ base: true, md: false });
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

  const saveInventory = async () => {};
  useEffect(() => {
    if (isSuccessCreate || isSuccessUpdate) {
      history.push(links.inventory);
    }
    if (isErrorCreate) {
      toast({
        position: "top-right",
        render: () => (
          <Box color="white" p={3} bg="red.500">
            {(error as any).data.errors?.map(
              (errorMessage: any, index: number) => {
                return (
                  <Text key={index}>
                    {Object.values(errorMessage.constraints)}
                  </Text>
                );
              },
            )}
          </Box>
        ),
      });
    }
  }, [isSuccessCreate, isSuccessUpdate, error, isErrorCreate, history, toast]);
  return (
    <form onSubmit={formik.handleSubmit}>
      <Flex direction="column">
        <Flex gap="20px" direction={isMobile ? "column" : "row"}>
          <Flex direction={"column"} gap="20px">
            <FormControl>
              <FormLabel>{t("common.name")}</FormLabel>
              <Input
                type="text"
                placeholder={t("common.name")}
                value={formik.values.name}
                onChange={(e) => formik.setFieldValue("name", e.target.value)}
              />
              {formik.errors.name ? (
                <Text mt="10px" color={"red.500"}>
                  {t(`common.${formik.errors.name}`)}
                </Text>
              ) : null}
            </FormControl>
          </Flex>
          <Flex gap="20px" direction={"column"}>
            <FormControl>
              <FormLabel>{t("common.price")}</FormLabel>
              <NumberInput
                value={formik.values.price}
                onChange={(price) => {
                  formik.setFieldValue("price", price);
                }}
              >
                <NumberInputField placeholder={t("common.price")} />
              </NumberInput>
              {formik.errors.name ? (
                <Text mt="10px" color={"red.500"}>
                  {t(`common.${formik.errors.price}`)}
                </Text>
              ) : null}
            </FormControl>
          </Flex>
        </Flex>
        <Box mt={5}>
          <Button
            type="submit"
            isLoading={isLoadingCreate || isLoadingUpdate}
            colorScheme="teal"
            onClick={() => saveInventory()}
          >
            {t("common.save")}
          </Button>
        </Box>
      </Flex>
    </form>
  );
};

export default withAdminRoute(UpsertInventory);
