import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  List,
  ListItem,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { FormEvent, useState } from "react";
import { useHistory, useLocation, Redirect } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { Role } from "types";
import { useCreateUnitMutation, useGetUnitsQuery } from "api/unit";

export type UnitCreationState = {
  returnTo?: string;
  returnState?: Record<string, unknown>;
  targetField?: string;
};

export default function Units() {
  const { t } = useTranslation();
  const history = useHistory();
  const { state } = useLocation<UnitCreationState>();
  const role = useSelector((store: RootState) => store.user.role);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [createUnit, { isLoading: saving }] = useCreateUnitMutation();
  const { data: units = [], isLoading, isError, refetch } = useGetUnitsQuery();
  // Only internal admin paths may be used as a return destination.
  const returnTo = state?.returnTo?.startsWith("/admin/")
    ? state.returnTo
    : undefined;

  if (role !== Role.ADMIN) return <Redirect to="/admin/default" />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving || !name.trim()) return;
    setError("");
    setSaved(false);
    const result = await createUnit({ name: name.trim() });
    if ("error" in result) {
      const message = (
        result.error as { data?: { message?: string | string[] } }
      ).data?.message;
      setError(
        Array.isArray(message)
          ? message.join(", ")
          : message || t("common.unitManagement.saveError"),
      );
      return;
    }
    if (returnTo) {
      history.replace(returnTo, {
        ...state.returnState,
        createdUnit: result.data,
        targetField: state.targetField,
      });
      return;
    }
    setName("");
    setSaved(true);
  };

  return (
    <Box>
      <Heading size="md" mb={6}>
        {t("common.unitManagement.title")}
      </Heading>
      <Box as="form" onSubmit={submit} maxW="480px">
        <FormControl isRequired>
          <FormLabel htmlFor="unit-name">
            {t("common.unitManagement.name")}
          </FormLabel>
          <Input
            id="unit-name"
            value={name}
            maxLength={100}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </FormControl>
        {error && (
          <Alert status="error" mt={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}
        {saved && (
          <Alert status="success" mt={4}>
            <AlertIcon />
            {t("common.unitManagement.saved")}
          </Alert>
        )}
        <Button
          type="submit"
          colorScheme="teal"
          mt={4}
          isLoading={saving}
          isDisabled={!name.trim()}
        >
          {t("common.save")}
        </Button>
        {returnTo && (
          <Button
            type="button"
            ml={4}
            mt={4}
            isDisabled={saving}
            onClick={() => history.goBack()}
          >
            {t("common.cancel")}
          </Button>
        )}
      </Box>
      <Heading size="sm" mt={8} mb={4}>
        {t("common.unitManagement.existing")}
      </Heading>
      {isLoading && <Spinner />}
      {isError && (
        <Alert status="error">
          <AlertIcon />
          {t("common.unitManagement.loadError")}
          <Button ml={4} onClick={() => refetch()}>
            {t("common.unitManagement.retry")}
          </Button>
        </Alert>
      )}
      {!isLoading && !isError && !units.length && (
        <Text>{t("common.unitManagement.empty")}</Text>
      )}
      <List spacing={2}>
        {units.map((unit) => (
          <ListItem key={unit.id}>
            {t(`common.units.${unit.name}`, { defaultValue: unit.name })}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
