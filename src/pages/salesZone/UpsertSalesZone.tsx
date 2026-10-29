import {
  Box,
  Button,
  Checkbox,
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
  useCreateSalesZoneMutation,
  useDeleteSalesZoneMutation,
  useGetSalesZonesQuery,
  useLazyGetSalesZoneByIdQuery,
  useUpdateSalesZoneMutation,
} from "api/salesZone";
import { useGetManagersQuery } from "api/manager";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import { links } from "routes";

const ValidationSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  managerId: z.string().optional(),
  // «Փակվել է»
  isClosed: z.boolean(),
  // «Կուտակիչ»: another sales zone this one nests under.
  parentId: z.string().optional(),
});

type SalesZoneFormType = z.infer<typeof ValidationSchema>;

const getErrorStyles = (error: boolean) => {
  if (error) {
    return { borderColor: "red", borderWidth: "2px" };
  }
  return {};
};

const UpsertSalesZone = () => {
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [error, setError] = useState("");
  // «Կոդ» is assigned by the server; shown once the record exists.
  const [code, setCode] = useState("");
  const params = useParams() as any;
  const history = useHistory();
  const { t } = useTranslation();

  const [createSalesZone] = useCreateSalesZoneMutation();
  const [updateSalesZone] = useUpdateSalesZoneMutation();
  const [deleteSalesZone] = useDeleteSalesZoneMutation();
  const [getSalesZoneById, { isLoading }] = useLazyGetSalesZoneByIdQuery();
  const { data: salesZones = [] } = useGetSalesZonesQuery();
  const { data: managers = [] } = useGetManagersQuery();

  const managerOptions = managers.map((manager) => ({
    label: `${manager.code} — ${manager.name}`,
    value: String(manager.id),
  }));

  // A zone can't accumulate into itself; the server also refuses any deeper
  // loop, which this list can't rule out on its own.
  const accumulatorOptions = salesZones
    .filter((zone) => String(zone.id) !== String(params.salesZoneId))
    .map((zone) => ({
      label: `${zone.code} — ${zone.name}`,
      value: String(zone.id),
    }));

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SalesZoneFormType>({
    resolver: zodResolver(ValidationSchema),
    defaultValues: {
      name: "",
      managerId: "",
      isClosed: false,
      parentId: "",
    },
  });

  useEffect(() => {
    (async () => {
      if (params.salesZoneId) {
        const res = await getSalesZoneById({
          salesZoneId: params.salesZoneId,
        });
        if (res.data) {
          setCode(res.data.code);
          reset({
            name: res.data.name,
            managerId: res.data.managerId ? String(res.data.managerId) : "",
            isClosed: res.data.isClosed,
            parentId: res.data.parentId ? String(res.data.parentId) : "",
          });
        }
      }
    })();
  }, [params.salesZoneId, getSalesZoneById, reset]);

  const onSubmit = async (values: SalesZoneFormType) => {
    const data = {
      name: values.name,
      managerId: values.managerId ? Number(values.managerId) : null,
      isClosed: values.isClosed,
      parentId: values.parentId ? Number(values.parentId) : null,
    };

    const res: any = params.salesZoneId
      ? await updateSalesZone({ ...data, id: params.salesZoneId })
      : await createSalesZone(data);

    if (res?.error) {
      setError(res.error?.data?.message || "Request failed");
      return;
    }
    history.push(links.salesZones);
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
          <FormControl>
            <FormLabel>{t("common.salesZone.code")}</FormLabel>
            <Input
              value={code || t("common.salesZone.codeAutoAssigned")}
              isReadOnly={true}
              isDisabled={true}
            />
          </FormControl>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>{t("common.salesZone.name")}</FormLabel>
                <Input
                  {...field}
                  type="text"
                  placeholder={t("common.salesZone.namePlaceholder")}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
        </Flex>
        <Flex gap="20px">
          <Controller
            name="managerId"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.managerId}>
                <FormLabel>{t("common.salesZone.manager")}</FormLabel>
                <Select
                  isClearable={true}
                  placeholder={t("common.salesZone.selectManager")}
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      ...getErrorStyles(!!errors.managerId),
                    }),
                  }}
                  value={
                    managerOptions.find((op) => op.value === field.value) ??
                    null
                  }
                  onChange={(valueSelected) => {
                    field.onChange(valueSelected?.value ?? "");
                  }}
                  options={managerOptions}
                />
                <FormErrorMessage>{errors.managerId?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
          <Controller
            name="parentId"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.parentId}>
                <FormLabel>{t("common.salesZone.accumulator")}</FormLabel>
                <Select
                  isClearable={true}
                  placeholder={t("common.salesZone.selectAccumulator")}
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      ...getErrorStyles(!!errors.parentId),
                    }),
                  }}
                  value={
                    accumulatorOptions.find((op) => op.value === field.value) ??
                    null
                  }
                  onChange={(valueSelected) => {
                    field.onChange(valueSelected?.value ?? "");
                  }}
                  options={accumulatorOptions}
                />
                <Text fontSize="sm" color="gray.400" mt="4px">
                  {t("common.salesZone.accumulatorHint")}
                </Text>
                <FormErrorMessage>{errors.parentId?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
        </Flex>
        <Controller
          name="isClosed"
          control={control}
          render={({ field }) => (
            <FormControl>
              <Checkbox
                id="is-closed"
                isChecked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              >
                {t("common.salesZone.isClosed")}
              </Checkbox>
              <Text fontSize="sm" color="gray.400" mt="4px">
                {t("common.salesZone.isClosedHint")}
              </Text>
            </FormControl>
          )}
        />
      </Flex>
      <Box mt={5}>
        <Button colorScheme="teal" type="submit" isLoading={isSubmitting}>
          {t("common.save")}
        </Button>
        {params.salesZoneId ? (
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
            const res: any = await deleteSalesZone(params.salesZoneId);
            setIsDeleteDialogOpened(false);
            if (res?.error) {
              setError(res.error?.data?.message || "Request failed");
              return;
            }
            history.push(links.salesZones);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={t("common.salesZone.deleteConfirmation")}
          headerText={t("common.salesZone.deleteSalesZone")}
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

export default UpsertSalesZone;
