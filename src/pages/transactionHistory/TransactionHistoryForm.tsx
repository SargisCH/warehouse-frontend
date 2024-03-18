import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Box,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { useGetClientQuery } from "api/client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  useUpdateTransactionHistoryMutation,
  useCreateTransactionHistoryMutation,
  TransactionHistoryItem,
  useLazyGetTransactionHistoryByIdQuery,
  TransactionType,
} from "api/transactionHistory";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import { links } from "routes";
import dayjs from "dayjs";
import { useGetInventorySupplierQuery } from "api/inventorySupplier";
type OptionType = {
  label: string;
  value: string;
};
const transactionTypeOptions = [
  {
    label: TransactionType.IN,
    value: TransactionType.IN,
  },
  {
    label: TransactionType.OUT,
    value: TransactionType.OUT,
  },
];
const TransactionHistoryForm = () => {
  const [amount, setAmount] = useState<number>();
  const [selectedClient, setSelectedClient] = useState<OptionType>();
  const [selectedSupplier, setSelectedSupplier] = useState<OptionType>();
  const [selectedType, setSelectedType] = useState<{
    label: TransactionType;
    value: TransactionType;
  }>();
  const params = useParams() as any;
  const [date, setDate] = useState(new Date());
  const [createTransactionHistory] = useCreateTransactionHistoryMutation();
  const [updateTransactionHistory] = useUpdateTransactionHistoryMutation();
  const [getTransactionHistoryById] = useLazyGetTransactionHistoryByIdQuery();
  const { data: clients = [] } = useGetClientQuery();
  const { data: suppliers = [] } = useGetInventorySupplierQuery();
  const history = useHistory();
  useEffect(() => {
    (async () => {
      if (params.transactionHistoryId) {
        const res = await getTransactionHistoryById({
          transactionHistoryId: params.transactionHistoryId,
        });
        setAmount(res.data.amount);
        const client = clients.find((c) => c.id === res.data.clientId);
        if (client) {
          setSelectedClient({
            label: client.name,
            value: String(client.id),
          });
        }
        const supplier = suppliers.find(
          (c) => c.id === res.data.inventorySupplierId,
        );
        if (supplier) {
          setSelectedSupplier({
            label: supplier.name,
            value: String(supplier.id),
          });
        }
        if (dayjs(res.data.date).isValid()) {
          setDate(dayjs(res.data.date).toDate());
        }
        setSelectedType({
          label: res.data.transactionType,
          value: res.data.transactionType,
        });
      }
    })();
  }, [
    params.transactionHistoryId,
    clients,
    suppliers,
    getTransactionHistoryById,
  ]);

  const saveCredit = async () => {
    const data: TransactionHistoryItem = {
      amount,
      date: date,
      transactionType: selectedType.value,
    };
    if (selectedType.value === TransactionType.OUT) {
      data.inventorySupplierId = Number(selectedSupplier.value);
    } else if (selectedType.value === TransactionType.IN) {
      data.clientId = Number(selectedClient.value);
    }
    if (params.transactionHistoryId) {
      await updateTransactionHistory({
        ...data,
        id: params.transactionHistoryId,
      });
    } else {
      await createTransactionHistory(data as TransactionHistoryItem);
    }
    history.push(links.transactionHistories);
  };
  return (
    <Flex direction="column">
      <Flex gap="20px">
        <Flex gap="20px">
          <FormControl>
            <FormLabel>Amount</FormLabel>
            <NumberInput value={amount} onChange={(v) => setAmount(Number(v))}>
              <NumberInputField placeholder="Amount" />
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel>Transaction Type</FormLabel>
            <Select
              value={selectedType}
              onChange={setSelectedType}
              options={transactionTypeOptions.map((tr) => ({
                label: tr.label,
                value: tr.value,
              }))}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Date</FormLabel>
            <DatePicker
              selected={date}
              onChange={(date: Date) => setDate(date)}
            />
          </FormControl>
          {selectedType?.value === TransactionType.OUT ? (
            <FormControl>
              <FormLabel>Supplier</FormLabel>
              <Select
                value={selectedSupplier}
                onChange={setSelectedSupplier}
                options={suppliers.map((tr) => ({
                  label: tr.name,
                  value: String(tr.id),
                }))}
              />
            </FormControl>
          ) : (
            <FormControl>
              <FormLabel>Client</FormLabel>
              <Select
                value={selectedClient}
                onChange={setSelectedClient}
                options={clients.map((cl) => ({
                  label: cl.name,
                  value: String(cl.id),
                }))}
              />
            </FormControl>
          )}
        </Flex>
      </Flex>
      <Box mt={5}>
        <Button colorScheme="teal" onClick={() => saveCredit()}>
          Save
        </Button>
      </Box>
    </Flex>
  );
};

export default TransactionHistoryForm;
