import { Box, Heading } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { RootState } from "store/store";
import { Role } from "types";
import UpsertManager from "pages/manager/UpsertManager";

export default function CreateDeliverer() {
  const { t } = useTranslation();
  const role = useSelector((state: RootState) => state.user.role);
  if (role !== Role.ADMIN) return <Redirect to="/admin/default" />;
  return (
    <Box>
      <Heading size="md" mb={6}>{t("common.deliverer.create")}</Heading>
      <UpsertManager deliverer />
    </Box>
  );
}
