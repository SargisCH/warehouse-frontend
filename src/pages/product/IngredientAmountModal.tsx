import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import Select from "react-select";

export default function IngredientAmountModal({
  setIngredientsAmount,
  selectedIngredients,
  inventoryAmounts,
}: {
  setIngredientsAmount: (amounts: {
    [key: string | number]: { amount: number; unit: string };
  }) => void;
  selectedIngredients: Array<{ label: string; value: string }>;
  inventoryAmounts: {
    [key: string | number]: { amount: number; unit: string };
  };
}) {
  const [amounts, setAmounts] = useState<{
    [key: string]: number;
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
    const defaultData: { [key: string]: { label: string; value: string } } = {};
    selectedIngredients.forEach((ing) => {
      defaultData[ing.value] = {
        value: inventoryAmounts[ing.value].unit,
        label: inventoryAmounts[ing.value].unit.toUpperCase(),
      };
    });
    return defaultData;
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const close = () => {
    const ingredientsAMount: {
      [key: string]: { amount: number; unit: string };
    } = {};
    Object.keys(amounts).forEach((key) => {
      ingredientsAMount[key] = { amount: amounts[key], unit: units[key].value };
    });
    setIngredientsAmount(ingredientsAMount);
    onClose();
  };
  return (
    <>
      <Button onClick={onOpen}>Set Ingredients amount</Button>

      <Modal isOpen={isOpen} onClose={close}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedIngredients.map((ing, index) => {
              return (
                <Flex key={ing.value}>
                  <FormControl>
                    <FormLabel colorScheme="black">{ing.label}</FormLabel>
                    <Input
                      type="number"
                      placeholder={ing.label}
                      value={amounts[ing.value]}
                      onChange={(e) => {
                        setAmounts({
                          ...amounts,
                          [ing.value]: Number(e.target.value),
                        });
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>In Stock Unit</FormLabel>
                    <Select
                      value={units[ing.value]}
                      onChange={(valueSelected) => {
                        setUnits({ ...units, [ing.value]: valueSelected });
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
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={close}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
