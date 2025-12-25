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
import {
  useLazyGetDocumentByIdQuery,
  useUpdateDocumentMutation,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  DocumentType,
} from "api/document";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { links } from "routes";

const UpsertDocument = () => {
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [documentCreateError, setDocumentCreateError] = useState("");
  const params = useParams() as any;

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DocumentType>();

  const [
    createDocument,
    {
      data: createData,
      isSuccess: isSuccessDocument,
      isError: isErrorDocument,
      error: createError,
    },
  ] = useCreateDocumentMutation();
  const [updateDocument] = useUpdateDocumentMutation();
  const [deleteDocument] = useDeleteDocumentMutation();
  const history = useHistory();
  const [getDocumentById] = useLazyGetDocumentByIdQuery();
  const { t } = useTranslation();

  useEffect(() => {
    if (isErrorDocument) {
      setDocumentCreateError((createError as any)?.data?.message as string);
    }
    if (isSuccessDocument) {
      history.push(links.documents);
    }
  }, [isErrorDocument, createData, isSuccessDocument, history, createError]);

  useEffect(() => {
    (async () => {
      if (params.documentId) {
        setIsLoading(true);
        const res = await getDocumentById({
          documentId: params.documentId,
        });
        reset(res.data);
        setIsLoading(false);
      }
    })();
  }, [params.documentId, getDocumentById, reset]);

  const onSubmit = async (data: DocumentType) => {
    if (params.documentId) {
      await updateDocument({
        ...data,
        id: params.documentId,
      });
    } else {
      await createDocument(data);
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap="20px">
          <FormControl isInvalid={!!errors.name}>
            <FormLabel htmlFor="name">{t("common.name")}</FormLabel>
            <Input
              id="name"
              placeholder={t("common.name")}
              {...register("name", {
                required: "This is required",
              })}
            />
            <FormErrorMessage>
              {errors.name && errors.name.message}
            </FormErrorMessage>
          </FormControl>
        </Flex>
        <Box mt={5}>
          <Button colorScheme="teal" isLoading={isSubmitting} type="submit">
            {t("common.save")}
          </Button>
          {params.documentId ? (
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
            await deleteDocument(params.documentId);
            history.push(links.documents);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={`Are you sure? You can't undo this action afterwards.`}
          headerText={`Delete Document`}
        />
      ) : null}
      {documentCreateError ? (
        <AlertDialog
          handleConfirm={async () => {
            setDocumentCreateError("");
          }}
          oneButton={true}
          isOpen={Boolean(documentCreateError)}
          onClose={() => setDocumentCreateError("")}
          bodyText={documentCreateError}
          headerText={"Warning"}
          confirmText="OK"
        />
      ) : null}
    </Box>
  );
};

export default UpsertDocument;
