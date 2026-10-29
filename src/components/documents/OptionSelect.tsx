import { FormControl, FormLabel } from "@chakra-ui/react";
import Select from "react-select";
import { OptionType } from "types";

type Props = {
  label?: string;
  placeholder?: string;
  options: OptionType[];
  // Single: the selected value. Multi: the selected values.
  value: string | string[];
  onChange: (value: any) => void;
  isMulti?: boolean;
  isDisabled?: boolean;
  width?: string;
};

/** A react-select wired to plain string values, with an optional label. */
export function OptionSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  isMulti,
  isDisabled,
  width = "220px",
}: Props) {
  const selected = isMulti
    ? options.filter((o) => (value as string[]).includes(o.value))
    : (options.find((o) => o.value === value) ?? null);
  return (
    <FormControl width={width}>
      {label ? <FormLabel fontSize="sm">{label}</FormLabel> : null}
      <Select
        isClearable
        isMulti={isMulti}
        isDisabled={isDisabled}
        placeholder={placeholder ?? label}
        options={options}
        value={selected as any}
        onChange={(picked: any) =>
          onChange(
            isMulti
              ? (picked ?? []).map((o: OptionType) => o.value)
              : (picked?.value ?? ""),
          )
        }
      />
    </FormControl>
  );
}
