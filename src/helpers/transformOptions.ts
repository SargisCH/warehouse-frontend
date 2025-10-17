import { OptionType } from "types";
export const transformOptions = <T>(
  data: Array<T>,
  keys: { label: keyof T | ((el: T) => string); value: keyof T },
): OptionType[] => {
  return data.map((el) => ({
    label:
      typeof keys.label === "function"
        ? keys.label(el)
        : String(el[keys.label]),
    value: String(el[keys.value]),
  }));
};
