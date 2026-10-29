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
  useCreateClientMutation,
  useDeleteClientMutation,
  useLazyGetClientByIdQuery,
  useUpdateClientMutation,
} from "api/client";
import { useGetClientGroupsQuery } from "api/clientGroup";
import { useGetManagersQuery } from "api/manager";
import { useGetSalesZonesQuery } from "api/salesZone";
import { useGetPriceListsQuery } from "api/priceList";
import { PAYMENT_TYPES } from "types";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import { links } from "routes";

// Matches PHONE_REGEX on the backend, so a number rejected here is rejected there.
const PHONE_REGEX = /^[0-9\s+\-.()]+$/;

const optionalPhone = z
  .string()
  .refine((value) => !value || PHONE_REGEX.test(value), {
    message: "Not a valid phone number.",
  })
  .optional();

const ValidationSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  legalAddress: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: optionalPhone,
  otherPhoneNumber: optionalPhone,
  email: z
    .string()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Not a valid email.",
    })
    .optional(),
  clientGroupId: z.string().optional(),
  salesZoneId: z.string().optional(),
  managerId: z.string().optional(),
  // «Գնացուցակ», «Վճարման տեսակ» and the credit terms.
  priceListId: z.string().optional(),
  paymentType: z.string().optional(),
  paymentTermDays: z
    .string()
    .refine((v) => !v || /^\d+$/.test(v), { message: "Whole days only." })
    .optional(),
  debtLimit: z
    .string()
    .refine((v) => !v || /^\d+(\.\d{1,2})?$/.test(v), {
      message: "Not a valid amount.",
    })
    .optional(),
  overdueDebtLimit: z
    .string()
    .refine((v) => !v || /^\d+(\.\d{1,2})?$/.test(v), {
      message: "Not a valid amount.",
    })
    .optional(),
});

type ClientFormType = z.infer<typeof ValidationSchema>;

const getErrorStyles = (error: boolean) => {
  if (error) {
    return { borderColor: "red", borderWidth: "2px" };
  }
  return {};
};

const UpsertClient = () => {
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [error, setError] = useState("");
  // «Կոդ» is assigned by the server; shown once the record exists.
  const [code, setCode] = useState("");
  const params = useParams() as any;
  const history = useHistory();
  const { t } = useTranslation();

  const [createClient] = useCreateClientMutation();
  const [updateClient] = useUpdateClientMutation();
  const [deleteClient] = useDeleteClientMutation();
  const [getClientById, { isLoading }] = useLazyGetClientByIdQuery();
  const { data: clientGroups = [] } = useGetClientGroupsQuery();
  const { data: salesZones = [] } = useGetSalesZonesQuery();
  const { data: managers = [] } = useGetManagersQuery();

  const groupOptions = clientGroups.map((group) => ({
    label: group.name,
    value: String(group.id),
  }));

  const zoneOptions = salesZones.map((zone) => ({
    label: zone.name,
    value: String(zone.id),
  }));

  const { data: priceLists = [] } = useGetPriceListsQuery();
  const priceListOptions = priceLists.map((priceList) => ({
    label: `${priceList.code} — ${priceList.name}`,
    value: String(priceList.id),
  }));
  const paymentTypeOptions = PAYMENT_TYPES.map((type) => ({
    label: t(`common.sale.paymentTypes.${type}`),
    value: type,
  }));

  const managerOptions = managers.map((manager) => ({
    label: `${manager.code} — ${manager.name}`,
    value: String(manager.id),
  }));

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientFormType>({
    resolver: zodResolver(ValidationSchema),
    defaultValues: {
      name: "",
      legalName: "",
      taxId: "",
      legalAddress: "",
      address: "",
      phoneNumber: "",
      otherPhoneNumber: "",
      email: "",
      clientGroupId: "",
      salesZoneId: "",
      managerId: "",
      priceListId: "",
      paymentType: "",
      paymentTermDays: "0",
      debtLimit: "0",
      overdueDebtLimit: "0",
    },
  });

  useEffect(() => {
    (async () => {
      if (params.clientId) {
        const res = await getClientById({ clientId: params.clientId });
        if (res.data) {
          setCode(res.data.code);
          reset({
            name: res.data.name,
            legalName: res.data.legalName ?? "",
            taxId: res.data.taxId ?? "",
            legalAddress: res.data.legalAddress ?? "",
            address: res.data.address ?? "",
            phoneNumber: res.data.phoneNumber ?? "",
            otherPhoneNumber: res.data.otherPhoneNumber ?? "",
            email: res.data.email ?? "",
            clientGroupId: res.data.clientGroupId
              ? String(res.data.clientGroupId)
              : "",
            salesZoneId: res.data.salesZoneId
              ? String(res.data.salesZoneId)
              : "",
            managerId: res.data.managerId ? String(res.data.managerId) : "",
            priceListId: res.data.priceListId
              ? String(res.data.priceListId)
              : "",
            paymentType: res.data.paymentType ?? "",
            paymentTermDays: String(res.data.paymentTermDays ?? 0),
            debtLimit: res.data.debtLimit ?? "0",
            overdueDebtLimit: res.data.overdueDebtLimit ?? "0",
          });
        }
      }
    })();
  }, [params.clientId, getClientById, reset]);

  const onSubmit = async (values: ClientFormType) => {
    const data = {
      name: values.name,
      legalName: values.legalName || null,
      taxId: values.taxId || null,
      legalAddress: values.legalAddress || null,
      address: values.address || null,
      phoneNumber: values.phoneNumber || null,
      otherPhoneNumber: values.otherPhoneNumber || null,
      email: values.email || null,
      clientGroupId: values.clientGroupId ? Number(values.clientGroupId) : null,
      salesZoneId: values.salesZoneId ? Number(values.salesZoneId) : null,
      managerId: values.managerId ? Number(values.managerId) : null,
      priceListId: values.priceListId ? Number(values.priceListId) : null,
      paymentType: values.paymentType || null,
      paymentTermDays: Number(values.paymentTermDays || 0),
      debtLimit: values.debtLimit || "0",
      overdueDebtLimit: values.overdueDebtLimit || "0",
    };

    const res: any = params.clientId
      ? await updateClient({ ...data, id: params.clientId })
      : await createClient(data);

    if (res?.error) {
      setError(res.error?.data?.message || "Request failed");
      return;
    }
    history.push(links.clients);
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

  // Every plain text field is laid out the same way; only the label differs.
  const textField = (
    fieldName: keyof ClientFormType,
    labelKey: string,
    type = "text",
  ) => (
    <Controller
      name={fieldName}
      control={control}
      render={({ field }) => (
        <FormControl isInvalid={!!errors[fieldName]}>
          <FormLabel>{t(labelKey)}</FormLabel>
          <Input {...field} type={type} placeholder={t(labelKey)} />
          <FormErrorMessage>{errors[fieldName]?.message}</FormErrorMessage>
        </FormControl>
      )}
    />
  );

  const selectField = (
    fieldName:
      | "clientGroupId"
      | "salesZoneId"
      | "managerId"
      | "priceListId"
      | "paymentType",
    labelKey: string,
    placeholderKey: string,
    options: Array<{ label: string; value: string }>,
  ) => (
    <Controller
      name={fieldName}
      control={control}
      render={({ field }) => (
        <FormControl isInvalid={!!errors[fieldName]}>
          <FormLabel>{t(labelKey)}</FormLabel>
          <Select
            isClearable={true}
            placeholder={t(placeholderKey)}
            styles={{
              control: (baseStyles) => ({
                ...baseStyles,
                ...getErrorStyles(!!errors[fieldName]),
              }),
            }}
            value={options.find((op) => op.value === field.value) ?? null}
            onChange={(valueSelected) => {
              field.onChange(valueSelected?.value ?? "");
            }}
            options={options}
          />
          <FormErrorMessage>{errors[fieldName]?.message}</FormErrorMessage>
        </FormControl>
      )}
    />
  );

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="20px">
        <Flex gap="20px">
          <FormControl>
            <FormLabel>{t("common.client.code")}</FormLabel>
            <Input
              value={code || t("common.client.codeAutoAssigned")}
              isReadOnly={true}
              isDisabled={true}
            />
          </FormControl>
          {textField("name", "common.client.name")}
        </Flex>
        <Flex gap="20px">
          {textField("legalName", "common.client.legalName")}
          {textField("taxId", "common.client.taxId")}
        </Flex>
        <Flex gap="20px">
          {textField("legalAddress", "common.client.legalAddress")}
          {textField("address", "common.client.address")}
        </Flex>
        <Flex gap="20px">
          {textField("phoneNumber", "common.client.phoneNumber", "tel")}
          {textField(
            "otherPhoneNumber",
            "common.client.otherPhoneNumber",
            "tel",
          )}
        </Flex>
        <Flex gap="20px">
          {textField("email", "common.client.email", "email")}
          {selectField(
            "clientGroupId",
            "common.client.group",
            "common.client.selectGroup",
            groupOptions,
          )}
        </Flex>
        <Flex gap="20px">
          {selectField(
            "salesZoneId",
            "common.salesZone.salesZone",
            "common.salesZone.selectSalesZone",
            zoneOptions,
          )}
          {selectField(
            "managerId",
            "common.client.manager",
            "common.client.selectManager",
            managerOptions,
          )}
        </Flex>
        <Flex gap="20px">
          {selectField(
            "priceListId",
            "common.sale.priceList",
            "common.sale.selectPriceList",
            priceListOptions,
          )}
          {selectField(
            "paymentType",
            "common.sale.paymentType",
            "common.sale.paymentType",
            paymentTypeOptions,
          )}
        </Flex>
        <Flex gap="20px">
          {textField("paymentTermDays", "common.client.paymentTermDays")}
          {textField("debtLimit", "common.client.debtLimit")}
          {textField("overdueDebtLimit", "common.client.overdueDebtLimit")}
        </Flex>
      </Flex>
      <Box mt={5}>
        <Button colorScheme="teal" type="submit" isLoading={isSubmitting}>
          {t("common.save")}
        </Button>
        {params.clientId ? (
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
            const res: any = await deleteClient(params.clientId);
            setIsDeleteDialogOpened(false);
            if (res?.error) {
              setError(res.error?.data?.message || "Request failed");
              return;
            }
            history.push(links.clients);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={t("common.client.deleteConfirmation")}
          headerText={t("common.client.deleteClient")}
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

export default UpsertClient;
