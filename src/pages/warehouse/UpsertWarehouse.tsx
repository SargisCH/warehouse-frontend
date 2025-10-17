import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Box,
  Spinner,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import {
  useDeleteWarehouseMutation,
  useLazyGetWarehouseByIdQuery,
  useUpdateWarehouseMutation,
  useCreateWarehouseMutation,
} from "../../api/warehouse";
import AlertDialog from "components/alertDialog/AlertDialog";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { links } from "routes";
import { zodResolver } from "@hookform/resolvers/zod";

const ValidationSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

type WarehouseType = z.infer<typeof ValidationSchema>;

const UpsertWarehouse = (props: { create: boolean }) => {
  const [name, setName] = useState("");
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams() as any;

  const [createWarehouse] = useCreateWarehouseMutation();
  const [updateWarehouse] = useUpdateWarehouseMutation();
  const [deleteWarehouse] = useDeleteWarehouseMutation();
  const history = useHistory();
  const [getWarehouseById] = useLazyGetWarehouseByIdQuery();

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WarehouseType>({
    resolver: zodResolver(ValidationSchema),
    defaultValues: { name: "" },
  });
  useEffect(() => {
    (async () => {
      if (params.warehouseId) {
        setIsLoading(true);
        const res = await getWarehouseById({
          warehouseId: params.warehouseId,
        });
        reset({ name: res.data.name });
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      }
    })();
  }, [params.warehouseId, getWarehouseById, reset]);

  const saveWarehouse = async (values: WarehouseType) => {
    if (params.warehouseId) {
      await updateWarehouse({
        ...values,
        id: params.warehouseId,
      });
    } else {
      await createWarehouse(values);
    }
    history.push(links.warehouses);
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
      <form onSubmit={handleSubmit(saveWarehouse)}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormControl>
              <FormLabel>{t("common.name")}</FormLabel>
              <Input
                type="text"
                placeholder={t("common.name")}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
          )}
        />
        <Box mt={5}>
          <Button colorScheme="teal" type="submit">
            {t("common.save")}
          </Button>
          {params.warehouseId ? (
            <Button
              ml={4}
              colorScheme="red"
              onClick={() => setIsDeleteDialogOpened(true)}
            >
              {t("common.delete")}
            </Button>
          ) : null}
        </Box>
      </form>
      {isDeleteDialogOpened ? (
        <AlertDialog
          handleConfirm={async () => {
            await deleteWarehouse(params.warehouseId);
            history.push(links.warehouses);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={`Are you sure? You can't undo this action afterwards.`}
          headerText={t("common.warehouses.deleteHeaderText")}
        />
      ) : null}
    </Flex>
  );
};

export default UpsertWarehouse;
