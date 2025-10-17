import {
  Box,
  Button,
  Flex,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Spinner,
  Text,
} from "@chakra-ui/react";

import {
  SaleReturnType,
  useConfirmReturnByIdMutation,
  useConfirmReturnMutation,
  useDisposeReturnByIdMutation,
  useDisposeReturnMutation,
  useGetReturnedSaleBySaleIdQuery,
} from "api/client";
import { useEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { links } from "routes";

const defaultDialogProps = {
  title: "",
  description: "",
  confirmCallback: () => {},
  cancelCallback: () => {},
};
export default function ReturnSaleDetails() {
  const params: any = useParams();
  const history = useHistory();
  const { data: returnSaleData = {} as SaleReturnType } =
    useGetReturnedSaleBySaleIdQuery<{
      data: SaleReturnType;
    }>({
      saleId: params.saleId,
    });
  const cancelRef = useRef();
  const [
    confirmById,
    {
      isLoading: confirmByIdLoading,
      isSuccess: isConfirmByIdSuccess,
      error: isConfirmByIdError,
    },
  ] = useConfirmReturnByIdMutation();
  const [
    confirmReturn,
    {
      isLoading: confirmLoading,
      isSuccess: isConfirmSuccess,
      error: isConfirmError,
    },
  ] = useConfirmReturnMutation();
  const [
    disposeReturn,
    {
      isLoading: disposeLoading,
      isSuccess: isDisposeSuccess,
      error: isDisposeError,
    },
  ] = useDisposeReturnMutation();
  const [
    disposeById,
    {
      isLoading: disposeByIdLoading,
      isSuccess: isDisposeByIdSuccess,
      error: isDisposeByIdError,
    },
  ] = useDisposeReturnByIdMutation();
  const sale = returnSaleData.returnItems?.[0].sale;
  const [dialogProps, setDialogProps] = useState<{
    title: string;
    description: string;
    confirmCallback: () => void;
    cancelCallback?: () => void;
  }>(defaultDialogProps);
  const { onOpen, onClose, isOpen } = useDisclosure();
  useEffect(() => {
    if ((isConfirmByIdSuccess || isDisposeByIdSuccess) && isOpen) {
      onClose();
      setDialogProps(defaultDialogProps);
    }
    if ((isConfirmSuccess || isDisposeSuccess) && isOpen) {
      onClose();
      history.push(links.returnSaleList);
    }
  }, [
    history,
    isOpen,
    onClose,
    isConfirmSuccess,
    isConfirmByIdSuccess,
    isDisposeSuccess,
    isDisposeByIdSuccess,
  ]);
  useEffect(() => {
    if (dialogProps.title) {
      onOpen();
    }
  }, [dialogProps, onOpen]);
  useEffect(() => {
    const error = [
      isConfirmError,
      isConfirmByIdError,
      isDisposeError,
      isDisposeByIdError,
    ].find((err) => err);
    if (error) {
      setDialogProps({
        title: "Error",
        description: (error as Error).message,
        confirmCallback: () => {
          setDialogProps(defaultDialogProps);
          onClose();
        },
      });
      onOpen();
    }
  }, [
    onClose,
    dialogProps,
    onOpen,
    setDialogProps,
    isConfirmError,
    isConfirmByIdError,
    isDisposeError,
    isDisposeByIdError,
  ]);
  return (
    <>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Sale id</Th>
            <Th>Product</Th>
            <Th>Amount</Th>
            <Th>Sale Price</Th>
            <Th>Actual price</Th>
            <Th></Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {returnSaleData.returnItems?.map((returnedItem, index) => {
            const soldItem = sale?.saleItems?.find(
              (saleItem) =>
                saleItem.stockProductId === returnedItem.stockProductId,
            );
            return (
              <Tr key={index}>
                <Td>{returnSaleData.saleId}</Td>
                <Td>{returnedItem.stockProduct.product.name}</Td>
                <Td>{returnedItem.amount}</Td>
                <Td>{soldItem.price}</Td>
                <Td>{returnedItem.stockProduct.product.price}</Td>
                <Td>
                  {(() => {
                    if (returnedItem.confirmed)
                      return <Text color={"teal"}>Confirmed</Text>;
                    else if (returnedItem.disposed) return null;
                    return (
                      <Button
                        color={"teal"}
                        onClick={() => {
                          setDialogProps({
                            title: "Warning",
                            description:
                              "Are you sure wnat to confirm the return?",
                            cancelCallback: onClose,
                            confirmCallback: () =>
                              confirmById({
                                saleId: returnSaleData.saleId,
                                returnId: returnedItem.id,
                              }),
                          });
                        }}
                      >
                        Confirm
                      </Button>
                    );
                  })()}
                </Td>
                <Td>
                  {(() => {
                    if (returnedItem.confirmed) return null;
                    else if (returnedItem.disposed)
                      return <Text color={"red.500"}>Disposed</Text>;
                    return (
                      <Button
                        color="red.500"
                        onClick={() => {
                          setDialogProps({
                            title: "Warning",
                            description:
                              "Are you sure wnat to confirm the return?",
                            cancelCallback: onClose,
                            confirmCallback: () =>
                              disposeById({
                                saleId: returnSaleData.saleId,
                                returnId: returnedItem.id,
                              }),
                          });
                        }}
                      >
                        Dispose
                      </Button>
                    );
                  })()}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <Box>
        <Flex>
          <Button
            color={"teal"}
            onClick={() => {
              setDialogProps({
                title: "Warning",
                description: "Are you sure wnat to confirm the return?",
                cancelCallback: onClose,
                confirmCallback: () => confirmReturn(params.saleId),
              });
            }}
          >
            Confirm
          </Button>
          <Button
            color="red.500"
            onClick={() => {
              setDialogProps({
                title: "Warning",
                description: "Are you sure wnat to confirm the return?",
                cancelCallback: onClose,
                confirmCallback: () => disposeReturn(params.saleId),
              });
            }}
          >
            Dispose
          </Button>
        </Flex>
      </Box>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={dialogProps.cancelCallback}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {dialogProps.title}
            </AlertDialogHeader>

            {confirmLoading ||
            disposeLoading ||
            confirmByIdLoading ||
            disposeByIdLoading ? (
              <Spinner />
            ) : (
              <>
                <AlertDialogBody>{dialogProps.description}</AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={dialogProps.confirmCallback}>
                    {dialogProps.cancelCallback ? "Yes" : "OK"}
                  </Button>
                  {dialogProps.cancelCallback ? (
                    <Button
                      colorScheme="red"
                      onClick={dialogProps.cancelCallback}
                      ml={3}
                    >
                      No
                    </Button>
                  ) : null}
                </AlertDialogFooter>
              </>
            )}
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
