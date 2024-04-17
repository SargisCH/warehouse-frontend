import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Box,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { useGetClientQuery, useLazyGetClientQuery } from "api/client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  useLazyGetCreditByIdQuery,
  useUpdateCreditMutation,
  useCreateCreditMutation,
  CreditItem,
} from "api/credit";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import { links } from "routes";
import dayjs from "dayjs";
import {
  useGetInventorySupplierQuery,
  useLazyGetInventorySupplierQuery,
} from "api/inventorySupplier";
import { CreditType, TransactionStatus } from "types";
type OptionType = {
  label: string;
  value: string;
};

const CreditForm = () => {
  const [amount, setAmount] = useState<number>();
  const [type, setType] = useState<CreditType>();
  const [status, setStatus] = useState<TransactionStatus>();
  const [selectedClient, setSelectedClient] = useState<OptionType>();
  const [selectedSupplier, setSelectedSupplier] = useState<OptionType>();
  const params = useParams() as any;
  const [clients, setClients] = useState<Array<{ name: string; id: number }>>(
    [],
  );
  const [suppliers, setSuppliers] = useState<
    Array<{ name: string; id: number }>
  >([]);
  const [date, setDate] = useState(new Date());
  const [createCredit] = useCreateCreditMutation();
  const [updateCredit] = useUpdateCreditMutation();
  const history = useHistory();
  const [getCreditById] = useLazyGetCreditByIdQuery();
  const [getClientQuery] = useLazyGetClientQuery();
  const [getInventorySupplierQuery] = useLazyGetInventorySupplierQuery();

  useEffect(() => {
    (async () => {
      if (params.creditId) {
        const res = await getCreditById({
          creditId: params.creditId,
        });
        if (res.data.clientId) {
          const clientsRes = await getClientQuery();
          const client = clientsRes.data.find(
            (c: Partial<{ name: string; id: number }>) =>
              c.id === res.data.clientId,
          );
          if (client) {
            setSelectedClient({
              label: client.name,
              value: String(client.id),
            });
          }
        } else if (res.data.inventorySupplierId) {
          const suppliersRes = await getInventorySupplierQuery();
          const supplier = suppliersRes.data.find(
            (s: Partial<{ name: string; id: number }>) =>
              s.id === res.data.inventorySupplierId,
          );
          if (supplier) {
            setSelectedSupplier({
              label: supplier.name,
              value: String(supplier.id),
            });
          }
        }
        setAmount(res.data.amount);
        setType(res.data.type);
        setStatus(res.data.status);

        if (dayjs(res.data.date).isValid()) {
          setDate(dayjs(res.data.date).toDate());
        }
      }
    })();
  }, [params.creditId, getCreditById]);

  const saveCredit = async () => {
    const data: Partial<CreditItem> = {
      amount,
      clientId: Number(selectedClient?.value),
      date: date,
      type,
      status,
    };
    if (params.creditId) {
      await updateCredit({
        ...data,
        id: params.creditId,
      });
    } else {
      await createCredit(data as CreditItem);
    }
    history.push(links.credits);
  };
  return (
    <Flex direction="column">
      <Box gap="20px">
        <Box gap="20px">
          <Flex alignItems={"center"} gap="20px">
            <FormControl>
              <FormLabel>Name</FormLabel>
              <NumberInput
                value={amount}
                onChange={(v) => setAmount(Number(v))}
              >
                <NumberInputField placeholder="Amount" />
              </NumberInput>
            </FormControl>
            {selectedClient?.value ? (
              <FormControl>
                <FormLabel>Client</FormLabel>
                <Select
                  value={selectedClient}
                  onChange={setSelectedClient}
                  options={clients.map((cl: { name: string; id: number }) => ({
                    label: cl.name,
                    value: String(cl.id),
                  }))}
                />
              </FormControl>
            ) : (
              <FormControl>
                <FormLabel>Supplier</FormLabel>
                <Select
                  value={selectedSupplier}
                  onChange={setSelectedSupplier}
                  options={suppliers.map((s: { name: string; id: number }) => ({
                    label: s.name,
                    value: String(s.id),
                  }))}
                />
              </FormControl>
            )}
            <FormControl>
              <FormLabel>Order date</FormLabel>
              <DatePicker
                selected={date}
                onChange={(date: Date) => setDate(date)}
              />
            </FormControl>
          </Flex>
        </Box>
        <Box mt="20px">
          <Flex gap="20px">
            <FormControl alignItems={"center"}>
              <FormLabel>Type</FormLabel>
              <Select
                isDisabled={true}
                value={{ label: type, value: type }}
                onChange={(op) => {
                  setType(op.value);
                }}
                options={[
                  {
                    label: CreditType.TO_PAY,
                    value: CreditType.TO_PAY,
                  },
                  {
                    label: CreditType.TO_RECEIVE,
                    value: CreditType.TO_RECEIVE,
                  },
                ]}
              />
            </FormControl>
            <FormControl alignItems={"center"}>
              <FormLabel>Status</FormLabel>
              <Select
                value={{ label: status, value: status }}
                onChange={(op) => {
                  setStatus(op.value);
                }}
                options={[
                  {
                    label: TransactionStatus.PENDING,
                    value: TransactionStatus.PENDING,
                  },
                  {
                    label: TransactionStatus.FAILED,
                    value: TransactionStatus.FAILED,
                  },
                  {
                    label: TransactionStatus.FINISHED,
                    value: TransactionStatus.FINISHED,
                  },
                ]}
              />
            </FormControl>
          </Flex>
        </Box>
      </Box>
      <Box mt={5}>
        <Button colorScheme="teal" onClick={() => saveCredit()}>
          Save
        </Button>
      </Box>
    </Flex>
  );
};

export default CreditForm;
