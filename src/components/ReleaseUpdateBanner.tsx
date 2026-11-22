import { Alert, AlertIcon, Button, Flex, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const currentRelease = process.env.REACT_APP_RELEASE;
const versionUrl = `${process.env.PUBLIC_URL || ""}/version.json`;
const checkInterval = 60_000;

export default function ReleaseUpdateBanner() {
  const { t } = useTranslation();
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!currentRelease) return;

    let active = true;
    let request: AbortController | undefined;

    async function checkRelease() {
      if (document.visibilityState !== "visible" || request) return;

      request = new AbortController();
      const timeout = window.setTimeout(() => request?.abort(), 10_000);

      try {
        const response = await fetch(versionUrl, {
          cache: "no-store",
          signal: request.signal,
        });
        if (!response.ok) return;

        const data = await response.json();
        if (active && typeof data?.release === "string" && data.release.trim()) {
          setUpdateAvailable(data.release !== currentRelease);
        }
      } catch {
        // Temporary network failures and incomplete responses can be retried.
      } finally {
        window.clearTimeout(timeout);
        request = undefined;
      }
    }

    void checkRelease();
    const interval = window.setInterval(checkRelease, checkInterval);
    document.addEventListener("visibilitychange", checkRelease);
    window.addEventListener("focus", checkRelease);

    return () => {
      active = false;
      request?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", checkRelease);
      window.removeEventListener("focus", checkRelease);
    };
  }, []);

  if (!updateAvailable) return null;

  return (
    <Alert
      status="info"
      role="status"
      position="fixed"
      bottom={4}
      insetEnd={4}
      maxW="calc(100% - 2rem)"
      w="auto"
      zIndex="toast"
      borderRadius="md"
      boxShadow="md"
    >
      <AlertIcon />
      <Flex gap={3} align="center" wrap="wrap">
        <Text>{t("common.releaseUpdate.message")}</Text>
        <Button size="sm" onClick={() => window.location.reload()}>
          {t("common.releaseUpdate.refresh")}
        </Button>
      </Flex>
    </Alert>
  );
}
