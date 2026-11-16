import { Box, Heading } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Redirect, useParams } from "react-router-dom";
import { RootState } from "store/store";
import { Role } from "types";
import UpsertManager from "pages/manager/UpsertManager";

export default function CreateDeliverer() {
  const { t } = useTranslation();
  const { managerId } = useParams<{ managerId?: string }>();
  const role = useSelector((state: RootState) => state.user.role);
  if (role !== Role.ADMIN) return <Redirect to="/admin/default" />;
  return (
    <Box>
      <Heading size="md" mb={6}>
        {t(managerId ? "common.deliverer.edit" : "common.deliverer.create")}
      </Heading>
      <UpsertManager deliverer />
    </Box>
  );
}
