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
type OptionType = {
  label: string;
  value: string;
};
const CreditForm = () => {
  const [amount, setAmount] = useState<number>();
  const [selectedClient, setSelectedClient] = useState<OptionType>();
  const params = useParams() as any;

  const [date, setDate] = useState(new Date());
  const [createCredit] = useCreateCreditMutation();
  const [updateCredit] = useUpdateCreditMutation();
  const history = useHistory();
  const [getCreditById] = useLazyGetCreditByIdQuery();
  const { data: clients = [] } = useGetClientQuery();
  useEffect(() => {
    (async () => {
      if (params.creditId) {
        const res = await getCreditById({
          creditId: params.creditId,
        });
        setAmount(res.data.amount);
        const client = clients.find((c) => c.id === res.data.clientId);
        if (client) {
          setSelectedClient({
            label: client.name,
            value: String(client.id),
          });
        }
        if (dayjs(res.data.date).isValid()) {
          setDate(dayjs(res.data.date).toDate());
        }
      }
    })();
  }, [params.creditId, getCreditById, clients]);

  const saveCredit = async () => {
    const data: Partial<CreditItem> = {
      amount,
      clientId: Number(selectedClient.value),
      date: date,
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
      <Flex gap="20px">
        <Flex gap="20px">
          <FormControl>
            <FormLabel>Name</FormLabel>
            <NumberInput value={amount} onChange={(v) => setAmount(Number(v))}>
              <NumberInputField placeholder="Amount" />
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel>Company Type</FormLabel>
            <Select
              value={selectedClient}
              onChange={setSelectedClient}
              options={clients.map((cl) => ({
                label: cl.name,
                value: String(cl.id),
              }))}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Order date</FormLabel>
            <DatePicker
              selected={date}
              onChange={(date: Date) => setDate(date)}
            />
          </FormControl>
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

export default CreditForm;
