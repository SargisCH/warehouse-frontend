import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Box,
  Spinner,
} from "@chakra-ui/react";
import {
  useDeleteClientMutation,
  useLazyGetClientByIdQuery,
  useUpdateClientMutation,
  useCreateClientMutation,
  ClientType,
} from "api/client";
import { useGetManagerQuery, useLazyGetClientScheduleQuery } from "api/manager";
import AlertDialog from "components/alertDialog/AlertDialog";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import { links } from "routes";
import { Weekday } from "types";

const weekDays: Weekday[] = [
  Weekday.MONDAY,
  Weekday.TUESDAY,
  Weekday.WEDNESDAY,
  Weekday.THURSDAY,
  Weekday.FRIDAY,
  Weekday.SATURDAY,
  Weekday.SUNDAY,
];

type OptionType = {
  label: string;
  value: string;
};
const options: OptionType[] = [
  { label: "Limited Company", value: "lts" },
  { label: "PE", value: "pe" },
];
type WeekdayOptionArray = Array<{
  label: Weekday;
  value: Weekday;
}>;

const UpsertClient = () => {
  const [name, setName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otherPhoneNumber, setOtherPhoneNumber] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [taxId, setTaxId] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [legalAddress, setLegalAddress] = useState("");
  const [address, setAddress] = useState("");
  const [selectedCompanyType, setSelectedCompanyType] = useState<OptionType>();
  const [contactPerson, setContactPerson] = useState("");
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [manager, setManager] = useState<OptionType>();
  const [selectedWeekdays, setSelectedWeekdays] =
    useState<WeekdayOptionArray>();
  const params = useParams() as any;

  const [createClient] = useCreateClientMutation();
  const [updateClient] = useUpdateClientMutation();
  const [deleteClient] = useDeleteClientMutation();
  const [getClientSchedule] = useLazyGetClientScheduleQuery();
  const { data: managersArray = [] } = useGetManagerQuery();
  const history = useHistory();
  const [getClientById] = useLazyGetClientByIdQuery();
  useEffect(() => {
    (async () => {
      if (params.clientId) {
        setIsLoading(true);
        const res = await getClientById({
          clientId: params.clientId,
        });
        setName(res.data.name);
        setCompanyCode(res.data.companyCode);
        setCompanyId(res.data.companyId);
        setTaxId(res.data.taxId);
        setSelectedCompanyType(
          options.find((op) => op.value === res.data.companyType),
        );
        setEmail(res.data.email);
        setPhoneNumber(res.data.phoneNumber);
        setOtherPhoneNumber(res.data.otherPhoneNumber);
        setLegalAddress(res.data.legalAddress);
        setAddress(res.data.address);
        setContactPerson(res.data.contactPerson);
        setAccountNumber(res.data.accountNumber);
        setBankAccountNumber(res.data.bankAccountNumber);

        const managerFound = managersArray.find(
          (m: Partial<{ id: number }>) => {
            return m.id === res.data.managerId;
          },
        );
        if (managerFound) {
          setManager({
            label: managerFound.name,
            value: String(managerFound.id),
          });

          const scheduleRes = await getClientSchedule({
            managerId: managerFound.id,
            clientId: params.clientId,
          });
          if (scheduleRes.data.dayPlan) {
            setSelectedWeekdays(
              scheduleRes.data.dayPlan?.map((d: Weekday) => ({
                label: d,
                value: d,
              })),
            );
          }
        }
        setTimeout(() => {
          setIsLoading(false);
        }, 100);

        //setCurrency(productItemRes.data.currency);
      }
    })();
  }, [params.clientId, getClientById, managersArray]);

  const saveClient = async () => {
    const data: ClientType = {
      name,
      companyId,
      companyCode,
      companyType: selectedCompanyType.value,
      taxId: taxId,
      email,
      phoneNumber,
      otherPhoneNumber,
      legalAddress,
      address,
      contactPerson,
      bankAccountNumber,
      accountNumber,
      managerId: Number(manager.value),
      dayPlan: selectedWeekdays.map((d) => d.value),
    };
    if (params.clientId) {
      await updateClient({
        ...data,
        id: params.clientId,
      });
    } else {
      await createClient(data);
    }
    history.push(links.clients);
  };
  if (isLoading) {
    return (
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    );
  }
  return (
    <Box>
      <Flex direction="column" gap="20px">
        <Flex gap="20px">
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Code</FormLabel>
            <Input
              type="text"
              placeholder="Company Code"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Id</FormLabel>
            <Input
              type="text"
              placeholder="Id"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            />
          </FormControl>
        </Flex>
        <Flex gap="20px">
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Company Type</FormLabel>
            <Select
              value={selectedCompanyType}
              onChange={setSelectedCompanyType}
              options={options}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Bank Account</FormLabel>
            <Input
              type="text"
              placeholder="Bank Account"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
            />
          </FormControl>
        </Flex>
        <Flex gap="20px">
          <FormControl>
            <FormLabel>Account Number</FormLabel>
            <Input
              type="text"
              placeholder="Bank Account"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Tax Id</FormLabel>
            <Input
              type="text"
              placeholder="Tax Id"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Legal Address</FormLabel>
            <Input
              type="text"
              placeholder="Legal Address"
              value={legalAddress}
              onChange={(e) => setLegalAddress(e.target.value)}
            />
          </FormControl>
        </Flex>
        <Flex gap="20px">
          <FormControl>
            <FormLabel>Address</FormLabel>
            <Input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Phone Number</FormLabel>
            <Input
              type="text"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Other Phone Number</FormLabel>
            <Input
              type="text"
              placeholder="Other Phone Number"
              value={otherPhoneNumber}
              onChange={(e) => setOtherPhoneNumber(e.target.value)}
            />
          </FormControl>
        </Flex>
      </Flex>
      <Flex gap="20px" mt="10px">
        <FormControl>
          <FormLabel>Contact Person</FormLabel>
          <Input
            type="text"
            placeholder="Contact Person"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Assign Manager</FormLabel>
          <Select
            value={manager}
            onChange={setManager}
            options={managersArray.map((m) => ({
              label: m.name,
              value: String(m.id),
            }))}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Day plan</FormLabel>
          <Select
            value={selectedWeekdays}
            onChange={(newValue) =>
              setSelectedWeekdays(newValue as WeekdayOptionArray)
            }
            options={weekDays.map((d) => ({ label: d, value: d }))}
            isMulti
          />
        </FormControl>
      </Flex>
      <Box mt={5}>
        <Button colorScheme="teal" onClick={() => saveClient()}>
          Save
        </Button>
        {params.clientId ? (
          <Button
            ml={4}
            colorScheme="red"
            onClick={() => setIsDeleteDialogOpened(true)}
          >
            Delete
          </Button>
        ) : null}
      </Box>
      {isDeleteDialogOpened ? (
        <AlertDialog
          handleConfirm={async () => {
            await deleteClient(params.clientId);
            history.push(links.clients);
          }}
          isOpen={isDeleteDialogOpened}
          onClose={() => setIsDeleteDialogOpened(false)}
          bodyText={`Are you sure? You can't undo this action afterwards.`}
          headerText={`Delete Inventory Supplier`}
        />
      ) : null}
    </Box>
  );
};

export default UpsertClient;
