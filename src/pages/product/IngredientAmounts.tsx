import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Select from "react-select";

type OptionType = { label: string; value: string };
type OptionMap = { [key: string]: OptionType };
export default function IngredientAmounts({
  setIngredientsAmount,
  selectedIngredients,
  inventoryAmounts,
}: {
  setIngredientsAmount: (amounts: {
    [key: string | number]: { amount: number; unit: string };
  }) => void;
  selectedIngredients: Array<OptionType>;
  inventoryAmounts: {
    [key: string | number]: { amount: number; unit: string };
  };
}) {
  const [amounts, setAmounts] = useState<{
    [key: string]: number | string;
  }>(() => {
    const defaultData: { [key: string]: number } = {};
    selectedIngredients.forEach((ing) => {
      defaultData[ing.value] = inventoryAmounts[ing.value].amount ?? 0;
    });
    return defaultData;
  });
  const [units, setUnits] = useState<{
    [key: string]: { label: string; value: string };
  }>(() => {
    const defaultData: OptionMap = {};
    selectedIngredients.forEach((ing) => {
      defaultData[ing.value] = {
        value: inventoryAmounts[ing.value].unit,
        label: inventoryAmounts[ing.value].unit.toUpperCase(),
      };
    });
    return defaultData;
  });

  const handleIngredientAmountsUpdate = (
    amountsArg: {
      [key: string]: number | string;
    } = amounts,
    unitsArg: {
      [key: string]: OptionType;
    } = units || {},
  ) => {
    const ingredientsAMount: {
      [key: string]: { amount: number; unit: string };
    } = {};
    Object.keys(amounts).forEach((key) => {
      ingredientsAMount[key] = {
        amount: Number(amountsArg[key]),
        unit: unitsArg[key] && unitsArg[key].value,
      };
    });
    setIngredientsAmount(ingredientsAMount);
  };
  return (
    <>
      <Box>
        {selectedIngredients.map((ing) => {
          return (
            <Flex key={ing.value}>
              <FormControl>
                <FormLabel colorScheme="black">{ing.label} amount</FormLabel>
                <NumberInput
                  value={amounts[ing.value]}
                  onChange={(value) => {
                    setAmounts({
                      ...amounts,
                      [ing.value]: value,
                    });
                    handleIngredientAmountsUpdate({
                      ...amounts,
                      [ing.value]: value,
                    });
                  }}
                >
                  <NumberInputField placeholder={ing.label} />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>In Stock Unit</FormLabel>
                <Select
                  value={units[ing.value]}
                  onChange={(valueSelected) => {
                    setUnits({ ...units, [ing.value]: valueSelected });
                    handleIngredientAmountsUpdate(undefined, {
                      ...units,
                      [ing.value]: valueSelected,
                    });
                  }}
                  options={[
                    { label: "KG", value: "kg" },
                    { label: "Gram", value: "G" },
                  ]}
                />
              </FormControl>
            </Flex>
          );
        })}
      </Box>
    </>
  );
}
