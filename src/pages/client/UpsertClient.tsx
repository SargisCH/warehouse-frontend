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
import { useTranslation } from "react-i18next";
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

type WeekdayOptionArray = Array<{
  label: Weekday;
  value: Weekday;
}>;

const UpsertClient = () => {
  const [name, setName] = useState("");
  const [legalName, setLegalname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otherPhoneNumber, setOtherPhoneNumber] = useState("");
  const [taxId, setTaxId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [legalAddress, setLegalAddress] = useState("");
  const [address, setAddress] = useState("");
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
  const { t } = useTranslation();
  useEffect(() => {
    (async () => {
      if (params.clientId) {
        setIsLoading(true);
        const res = await getClientById({
          clientId: params.clientId,
        });
        setName(res.data.name);
        setLegalname(res.data.legalName);
        setTaxId(res.data.taxId);
        setEmail(res.data.email);
        setPhoneNumber(res.data.phoneNumber);
        setOtherPhoneNumber(res.data.otherPhoneNumber);
        setLegalAddress(res.data.legalAddress);
        setAddress(res.data.address);
        setAccountNumber(res.data.accountNumber);

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
  }, [params.clientId, getClientById, managersArray, getClientSchedule]);

  const saveClient = async () => {
    const data: ClientType = {
      name,
      legalName,
      taxId: taxId,
      email,
      phoneNumber,
      otherPhoneNumber,
      legalAddress,
      address,
      accountNumber,
    };
    if (manager?.value) {
      data.managerId = Number(manager.value);
    }
    if (selectedWeekdays?.length > 0) {
      data.dayPlan = selectedWeekdays.map((d) => d.value);
    }

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
            <FormLabel>{t("common.client.name")}</FormLabel>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>{t("common.client.legalName")}</FormLabel>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setLegalname(e.target.value)}
            />
          </FormControl>
        </Flex>
        <Flex gap="20px">
          <FormControl>
            <FormLabel>{t("common.client.email")}</FormLabel>
            <Input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
        </Flex>
        <Flex gap="20px">
          <FormControl>
            <FormLabel>{t("common.client.accountNumber")}</FormLabel>
            <Input
              type="text"
              placeholder="Bank Account"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>{t("common.client.legalId")}</FormLabel>
            <Input
              type="text"
              placeholder="Tax Id"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>{t("common.client.legalAddress")}</FormLabel>
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
            <FormLabel>{t("common.client.address")}</FormLabel>
            <Input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>{t("common.client.phoneNumber")}</FormLabel>
            <Input
              type="text"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>{t("common.client.otherPhoneNumber")}</FormLabel>
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
          <FormLabel>{t("common.client.assignManager")}</FormLabel>
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
          <FormLabel>{t("common.client.dayPlan")}</FormLabel>
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
