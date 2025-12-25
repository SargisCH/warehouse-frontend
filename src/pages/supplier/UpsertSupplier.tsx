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
  useCreateSupplierMutation,
  useLazyGetSupplierByIdQuery,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} from "api/supplier";
import { Supplier } from "types";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { links } from "routes";

const UpsertSupplier = () => {
  const [name, setName] = useState("");
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const params = useParams() as any;

  const [
    createSupplier,
    {
      isSuccess: isSuccessSupplier,
      isError: isErrorSupplier,
      error: createError,
    },
  ] = useCreateSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();
  const history = useHistory();
  const [getSupplierById] = useLazyGetSupplierByIdQuery();
  const { t } = useTranslation();

  useEffect(() => {
    if (isErrorSupplier) {
      setError((createError as any)?.data?.message as string);
    }
    if (isSuccessSupplier) {
      history.push(links.suppliers);
    }
  }, [isErrorSupplier, isSuccessSupplier, history, createError]);

  useEffect(() => {
    (async () => {
      if (params.supplierId) {
        setIsLoading(true);
        const res = await getSupplierById({
          supplierId: params.supplierId,
        });
        setName(res.data.name);
        setIsLoading(false);
      }
    })();
  }, [params.supplierId, getSupplierById]);

  const saveSupplier = async () => {
    const data: Partial<Supplier> = {
      name,
    };

    if (params.supplierId) {
      await updateSupplier({
        ...data,
        id: params.supplierId,
      });
      history.push(links.suppliers);
    } else {
      await createSupplier(data);
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
    <Box>
      <Flex direction="column" gap="20px">
        <Flex gap="20px">
          <FormControl>
            <FormLabel>{t("common.supplier.name")}</FormLabel>
            <Input
              type="text"
              placeholder={t("common.supplier.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
        </Flex>
      </Flex>
      <Box mt={5}>
        <Button colorScheme="teal" onClick={saveSupplier}>
          {t("common.save")}
        </Button>
        {params.supplierId ? (
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
            await deleteSupplier(params.supplierId);
            history.push(links.suppliers);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={t("common.supplier.deleteConfirmation")}
          headerText={t("common.supplier.deleteSupplier")}
        />
      ) : null}
      {error ? (
        <AlertDialog
          handleConfirm={() => {
            setError("");
          }}
          oneButton={true}
          isOpen={Boolean(error)}
          onClose={() => setError("")}
          bodyText={error}
          headerText={"Warning"}
          confirmText="OK"
        />
      ) : null}
    </Box>
  );
};

export default UpsertSupplier;
