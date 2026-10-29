import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Spinner,
  Text,
} from "@chakra-ui/react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateClientGroupMutation,
  useDeleteClientGroupMutation,
  useLazyGetClientGroupByIdQuery,
  useUpdateClientGroupMutation,
} from "api/clientGroup";
import { useGetSalesZonesQuery } from "api/salesZone";
import { useGetClientGroupsQuery } from "api/clientGroup";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import { links } from "routes";

const ValidationSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  // «Կուտակիչ»: the group this one rolls up into.
  parentId: z.string().optional(),
  salesZoneId: z.string().optional(),
});

type ClientGroupFormType = z.infer<typeof ValidationSchema>;

const getErrorStyles = (error: boolean) => {
  if (error) {
    return { borderColor: "red", borderWidth: "2px" };
  }
  return {};
};

const UpsertClientGroup = () => {
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [error, setError] = useState("");
  const params = useParams() as any;
  const history = useHistory();
  const { t } = useTranslation();

  const [createClientGroup] = useCreateClientGroupMutation();
  const [updateClientGroup] = useUpdateClientGroupMutation();
  const [deleteClientGroup] = useDeleteClientGroupMutation();
  const [getClientGroupById, { isLoading }] = useLazyGetClientGroupByIdQuery();
  const { data: salesZones = [] } = useGetSalesZonesQuery();
  const { data: clientGroups = [] } = useGetClientGroupsQuery();

  // A group cannot accumulate into itself; the server also refuses cycles.
  const parentOptions = clientGroups
    .filter((group) => String(group.id) !== String(params.clientGroupId))
    .map((group) => ({ label: group.name, value: String(group.id) }));

  const zoneOptions = salesZones.map((zone) => ({
    label: zone.name,
    value: String(zone.id),
  }));

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientGroupFormType>({
    resolver: zodResolver(ValidationSchema),
    defaultValues: {
      name: "",
      parentId: "",
      salesZoneId: "",
    },
  });

  useEffect(() => {
    (async () => {
      if (params.clientGroupId) {
        const res = await getClientGroupById({
          clientGroupId: params.clientGroupId,
        });
        if (res.data) {
          reset({
            name: res.data.name,
            parentId: res.data.parentId ? String(res.data.parentId) : "",
            salesZoneId: res.data.salesZoneId
              ? String(res.data.salesZoneId)
              : "",
          });
        }
      }
    })();
  }, [params.clientGroupId, getClientGroupById, reset]);

  const onSubmit = async (values: ClientGroupFormType) => {
    const data = {
      name: values.name,
      parentId: values.parentId ? Number(values.parentId) : null,
      salesZoneId: values.salesZoneId ? Number(values.salesZoneId) : null,
    };

    const res: any = params.clientGroupId
      ? await updateClientGroup({ ...data, id: params.clientGroupId })
      : await createClientGroup(data);

    if (res?.error) {
      setError(res.error?.data?.message || "Request failed");
      return;
    }
    history.push(links.clientGroups);
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
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="20px">
        <Flex gap="20px">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>{t("common.clientGroup.name")}</FormLabel>
                <Input
                  {...field}
                  type="text"
                  placeholder={t("common.clientGroup.namePlaceholder")}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
          <Controller
            name="salesZoneId"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.salesZoneId}>
                <FormLabel>{t("common.salesZone.salesZone")}</FormLabel>
                <Select
                  isClearable={true}
                  placeholder={t("common.salesZone.selectSalesZone")}
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      ...getErrorStyles(!!errors.salesZoneId),
                    }),
                  }}
                  value={
                    zoneOptions.find((op) => op.value === field.value) ?? null
                  }
                  onChange={(valueSelected) => {
                    field.onChange(valueSelected?.value ?? "");
                  }}
                  options={zoneOptions}
                />
                <FormErrorMessage>
                  {errors.salesZoneId?.message}
                </FormErrorMessage>
              </FormControl>
            )}
          />
        </Flex>
        <Controller
          name="parentId"
          control={control}
          render={({ field }) => (
            <FormControl>
              <FormLabel>{t("common.clientGroup.accumulator")}</FormLabel>
              <Select
                isClearable
                placeholder={t("common.clientGroup.accumulator")}
                options={parentOptions}
                value={
                  parentOptions.find((op) => op.value === field.value) ?? null
                }
                onChange={(picked) => field.onChange(picked?.value ?? "")}
              />
              <Text fontSize="sm" color="gray.400" mt="4px">
                {t("common.clientGroup.accumulatorHint")}
              </Text>
            </FormControl>
          )}
        />
      </Flex>
      <Box mt={5}>
        <Button colorScheme="teal" type="submit" isLoading={isSubmitting}>
          {t("common.save")}
        </Button>
        {params.clientGroupId ? (
          <Button
            ml={4}
            colorScheme="red"
            type="button"
            onClick={() => setIsDeleteDialogOpened(true)}
          >
            {t("common.delete")}
          </Button>
        ) : null}
      </Box>
      {isDeleteDialogOpened ? (
        <AlertDialog
          handleConfirm={async () => {
            const res: any = await deleteClientGroup(params.clientGroupId);
            setIsDeleteDialogOpened(false);
            if (res?.error) {
              setError(res.error?.data?.message || "Request failed");
              return;
            }
            history.push(links.clientGroups);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={t("common.clientGroup.deleteConfirmation")}
          headerText={t("common.clientGroup.deleteClientGroup")}
        />
      ) : null}
      {error ? (
        <AlertDialog
          handleConfirm={() => setError("")}
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

export default UpsertClientGroup;
