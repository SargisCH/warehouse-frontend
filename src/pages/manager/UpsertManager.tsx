import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Spinner,
} from "@chakra-ui/react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateManagerMutation,
  useDeleteManagerMutation,
  useGetDeliverersQuery,
  useLazyGetManagerByIdQuery,
  useUpdateManagerMutation,
} from "api/manager";
import { useGetSalesZonesQuery } from "api/salesZone";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import { links } from "routes";

const ValidationSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "A valid email is required." }),
  // «Սարքի նույնականացման համար»: read off the handheld, so free-form.
  deviceId: z.string().optional(),
  salesZoneId: z.string().optional(),
  delivererId: z.string().optional(),
});

type ManagerFormType = z.infer<typeof ValidationSchema>;

const getErrorStyles = (error: boolean) => {
  if (error) {
    return { borderColor: "red", borderWidth: "2px" };
  }
  return {};
};

const UpsertManager = () => {
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [error, setError] = useState("");
  // «Կոդ» is assigned by the server; shown once the record exists.
  const [code, setCode] = useState("");
  const params = useParams() as any;
  const history = useHistory();
  const { t } = useTranslation();

  const [createManager] = useCreateManagerMutation();
  const [updateManager] = useUpdateManagerMutation();
  const [deleteManager] = useDeleteManagerMutation();
  const [getManagerById, { isLoading }] = useLazyGetManagerByIdQuery();
  const { data: salesZones = [] } = useGetSalesZonesQuery();
  const { data: deliverers = [] } = useGetDeliverersQuery();

  const zoneOptions = salesZones.map((zone) => ({
    label: zone.name,
    value: String(zone.id),
  }));

  // A manager cannot deliver to himself here; leaving it empty means that.
  const delivererOptions = deliverers
    .filter((deliverer) => String(deliverer.id) !== String(params.managerId))
    .map((deliverer) => ({
      label: `${deliverer.code} — ${deliverer.name}`,
      value: String(deliverer.id),
    }));

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ManagerFormType>({
    resolver: zodResolver(ValidationSchema),
    defaultValues: {
      name: "",
      email: "",
      deviceId: "",
      salesZoneId: "",
      delivererId: "",
    },
  });

  useEffect(() => {
    (async () => {
      if (params.managerId) {
        const res = await getManagerById({ managerId: params.managerId });
        if (res.data) {
          setCode(res.data.code);
          reset({
            name: res.data.name,
            email: res.data.email,
            deviceId: res.data.deviceId ?? "",
            salesZoneId: res.data.salesZoneId
              ? String(res.data.salesZoneId)
              : "",
            delivererId: res.data.delivererId
              ? String(res.data.delivererId)
              : "",
          });
        }
      }
    })();
  }, [params.managerId, getManagerById, reset]);

  const onSubmit = async (values: ManagerFormType) => {
    const data = {
      name: values.name,
      email: values.email,
      deviceId: values.deviceId || null,
      salesZoneId: values.salesZoneId ? Number(values.salesZoneId) : null,
      delivererId: values.delivererId ? Number(values.delivererId) : null,
    };

    const res: any = params.managerId
      ? await updateManager({ ...data, id: params.managerId })
      : await createManager(data);

    if (res?.error) {
      setError(res.error?.data?.message || "Request failed");
      return;
    }
    history.push(links.managers);
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
            <FormLabel>{t("common.manager.code")}</FormLabel>
            <Input
              value={code || t("common.manager.codeAutoAssigned")}
              isReadOnly={true}
              isDisabled={true}
            />
          </FormControl>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>{t("common.manager.name")}</FormLabel>
                <Input
                  {...field}
                  type="text"
                  placeholder={t("common.manager.namePlaceholder")}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
        </Flex>
        <Flex gap="20px">
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>{t("common.manager.email")}</FormLabel>
                <Input
                  {...field}
                  type="email"
                  placeholder={t("common.manager.emailPlaceholder")}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
          <Controller
            name="deviceId"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.deviceId}>
                <FormLabel>{t("common.manager.deviceId")}</FormLabel>
                <Input
                  {...field}
                  type="text"
                  placeholder={t("common.manager.deviceIdPlaceholder")}
                />
                <FormErrorMessage>{errors.deviceId?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
        </Flex>
        <Flex gap="20px">
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
          <Controller
            name="delivererId"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.delivererId}>
                <FormLabel>{t("common.manager.deliverer")}</FormLabel>
                <Select
                  isClearable={true}
                  placeholder={t("common.manager.selectDeliverer")}
                  noOptionsMessage={() => t("common.manager.noDeliverers")}
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      ...getErrorStyles(!!errors.delivererId),
                    }),
                  }}
                  value={
                    delivererOptions.find((op) => op.value === field.value) ??
                    null
                  }
                  onChange={(valueSelected) => {
                    field.onChange(valueSelected?.value ?? "");
                  }}
                  options={delivererOptions}
                />
                <FormErrorMessage>
                  {errors.delivererId?.message}
                </FormErrorMessage>
              </FormControl>
            )}
          />
        </Flex>
      </Flex>
      <Box mt={5}>
        <Button colorScheme="teal" type="submit" isLoading={isSubmitting}>
          {t("common.save")}
        </Button>
        {params.managerId ? (
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
            const res: any = await deleteManager(params.managerId);
            setIsDeleteDialogOpened(false);
            if (res?.error) {
              setError(res.error?.data?.message || "Request failed");
              return;
            }
            history.push(links.managers);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={t("common.manager.deleteConfirmation")}
          headerText={t("common.manager.deleteManager")}
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

export default UpsertManager;
