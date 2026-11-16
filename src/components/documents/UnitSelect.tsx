import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { useGetUnitsQuery } from "api/unit";

const CREATE_UNIT = "__create_unit__";

export function UnitSelect({
  value,
  onChange,
  onCreate,
  invalid = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onCreate: () => void;
  invalid?: boolean;
}) {
  const { t } = useTranslation();
  const { data: units = [], isLoading, isError } = useGetUnitsQuery();
  const options = units.map((unit) => ({
    label: t(`common.units.${unit.name}`, { defaultValue: unit.name }),
    value: String(unit.id),
  }));
  const createLabel = t("common.unitManagement.create");
  return (
    <Box>
      <Flex gap={2}>
        <Box flex="1" minW={0}>
          <Select
            aria-label={t("common.unit")}
            isLoading={isLoading}
            placeholder={t("common.unitManagement.select")}
            value={options.find((option) => option.value === value) ?? null}
            options={[
              ...options,
              { label: `+ ${createLabel}`, value: CREATE_UNIT },
            ]}
            filterOption={(option, input) =>
              option.value === CREATE_UNIT ||
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            onChange={(option) =>
              option?.value === CREATE_UNIT
                ? onCreate()
                : onChange(option?.value ?? "")
            }
            styles={{
              control: (base) => ({
                ...base,
                ...(invalid ? { borderColor: "red", borderWidth: "2px" } : {}),
              }),
            }}
          />
        </Box>
        <IconButton
          type="button"
          aria-label={createLabel}
          title={createLabel}
          icon={<AddIcon />}
          onClick={onCreate}
        />
      </Flex>
      {isError && (
        <Text color="red.500" role="alert">
          {t("common.unitManagement.loadError")}
        </Text>
      )}
    </Box>
  );
}
