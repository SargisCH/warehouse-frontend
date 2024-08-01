import {
  AlertDialog as AlertDialogChakra,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useRef } from "react";

export default function AlertDialog({
  confirmText = "Yes",
  cancelText = "No",
  isOpen,
  onClose,
  bodyText,
  headerText,
  handleConfirm,
  oneButton,
}: {
  confirmText?: string;
  cancelText?: string;
  isOpen: boolean;
  onClose: () => void;
  bodyText: string;
  headerText: string;
  handleConfirm: () => void;
  oneButton?: boolean;
}) {
  const cancelRef = useRef();

  return (
    <>
      <AlertDialogChakra
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {headerText}
          </AlertDialogHeader>

          <AlertDialogBody>{bodyText}</AlertDialogBody>

          <AlertDialogFooter>
            {!oneButton ? (
              <Button ref={cancelRef} onClick={onClose}>
                {cancelText}
              </Button>
            ) : null}

            <Button colorScheme="red" onClick={handleConfirm} ml={3}>
              {confirmText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogChakra>
    </>
  );
}
