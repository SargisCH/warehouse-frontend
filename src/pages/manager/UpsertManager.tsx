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
  useCreateManagerMutation,
  useUpdateManagerMutation,
  ManagerType,
  useLazyGetManagerByIdQuery,
  Schedule,
} from "api/manager";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { links } from "routes";

const UpsertManager = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [schedule, setSchedule] = useState<Schedule[]>();
  const [isLoading, setIsLoading] = useState<boolean>();
  const params = useParams() as any;

  const [createManager] = useCreateManagerMutation();
  const [updateManager] = useUpdateManagerMutation();
  const [getManagerById] = useLazyGetManagerByIdQuery();
  const history = useHistory();
  useEffect(() => {
    (async () => {
      if (params.managerId) {
        setIsLoading(true);
        const res = await getManagerById({
          managerId: params.managerId,
        });
        setName(res.data.name);
        setEmail(res.data.email);
        setPhoneNumber(res.data.phoneNumber);
        if (res.data.schedule) {
          setSchedule(res.data.schedule);
        }
        setTimeout(() => {
          setIsLoading(false);
        }, 100);

        //setCurrency(productItemRes.data.currency);
      }
    })();
  }, [params.managerId, getManagerById]);

  const saveClient = async () => {
    const data: ManagerType = {
      name,
      email,
      phoneNumber,
    };
    if (params.managerId) {
      await updateManager({
        ...data,
        id: params.managerId,
      });
    } else {
      await createManager(data);
    }
    history.push(links.managers);
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
    <Flex direction="column">
      <Flex direction={"column"} gap="20px">
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
            <FormLabel>Email</FormLabel>
            <Input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
        </Flex>
        <Flex>
          {schedule?.length ? (
            <table>
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Day Plan</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((s) => {
                  return (
                    <tr>
                      <td>{s.client.name}</td>
                      <td>{s.dayPlan.join(",")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : null}
        </Flex>
      </Flex>
      <Box mt={5}>
        <Button colorScheme="teal" onClick={() => saveClient()}>
          Save
        </Button>
      </Box>
    </Flex>
  );
};

export default UpsertManager;
