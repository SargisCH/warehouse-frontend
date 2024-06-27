import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Image,
  VStack,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Flex,
} from "@chakra-ui/react";
import { useGetUserMutation, useUpdateSettingsMutation } from "api/auth";
import {
  useCreatePayoutTypeMutation,
  useGetPayoutTypesQuery,
} from "api/payout";
import { useState, ChangeEvent, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { setUserData } from "store/slices/userSlice";
import { RootState } from "store/store";
import Select, { components } from "react-select";
import { Formik, Form, Field } from "formik";
import "./settings.css";

export default function Manager() {
  const { t } = useTranslation();
  const [imageSrc, setImageSrc] = useState(null);
  const [fileType, setFileType] = useState(null);
  const user = useSelector((state: RootState) => {
    return state.user;
  });
  const tenant = user.tenant;
  const history = useHistory();
  const dispatch = useDispatch();
  const [updateSettings, { data, isLoading, isSuccess }] =
    useUpdateSettingsMutation();
  const [createPaymenyType, { isSuccess: isSuccessCreateType }] =
    useCreatePayoutTypeMutation();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: payoutTypes = [], refetch } = useGetPayoutTypesQuery();
  useEffect(() => {
    if (isSuccessCreateType) {
      onClose();
      refetch();
    }
  }, [onClose, isSuccessCreateType, refetch]);
  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFieldValue: (
      field: string,
      value: any,
      shouldValidate?: boolean,
    ) => void,
  ) => {
    const file = event.target.files[0];
    setFileType(file.type);
    setFieldValue("file", file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };
  useEffect(() => {
    if (isSuccess) {
      setImageSrc(null);
      dispatch(setUserData(data));
      history.push("/");
    }
  }, [isSuccess, setImageSrc, dispatch, history, data]);
  const logo = imageSrc || tenant?.logo;

  return (
    <Box
      display={"flex"}
      justifyContent="center"
      flexDirection={"column"}
      alignItems="center"
    >
      <Box>
        <Heading>{t("common.profileSettings")}</Heading>
      </Box>

      <Box mt="10">
        <Formik
          initialValues={{ name: tenant.name, logo: "" }}
          onSubmit={(values) => {
            updateSettings({ ...values, logo: imageSrc, fileType });
          }}
        >
          {({ setFieldValue }) => (
            <Form>
              <VStack spacing={4} justifyContent={"center"} display="flex">
                <FormControl>
                  <FormLabel htmlFor="name">
                    {t("common.companyName")}
                  </FormLabel>
                  <Field as={Input} id="name" name="name" />
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="file">{t("common.fileUpload")}</FormLabel>
                  <Input
                    id="file"
                    name="logo"
                    type="file"
                    onChange={(event) => handleFileChange(event, setFieldValue)}
                  />
                </FormControl>
                {logo ? (
                  <Box>
                    <Image
                      src={logo}
                      alt="preview"
                      boxSize="200px"
                      objectFit="contain"
                    />
                  </Box>
                ) : null}
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isLoading}
                  isDisabled={isLoading}
                >
                  {t("common.save")}
                </Button>
              </VStack>
            </Form>
          )}
        </Formik>
        <Box>
          <table>
            <tr>
              <th>Name</th>
            </tr>
            {payoutTypes
              .filter(
                (payoutType) => payoutType.name !== "other" && payoutType.name,
              )
              .map((payoutType) => (
                <tr>
                  <td>{payoutType.name}</td>
                </tr>
              ))}
          </table>
          <Button colorScheme={"green"} onClick={onOpen} fontSize="14px">
            {t("common.createNewPayoutType")}
          </Button>
        </Box>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create new type</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Formik
                initialValues={{ name: "" }}
                onSubmit={(values) => {
                  createPaymenyType({ name: values.name });
                }}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <Flex alignItems={"center"}>
                      <label htmlFor="name">Name:</label>
                      <Field type="text" id="name" name="name">
                        {({ field }: { field: any }) => (
                          <Input id="name" name="name" {...field} ml={2} />
                        )}
                      </Field>
                    </Flex>
                    <Button
                      mt={2}
                      ml={0}
                      colorScheme={"green"}
                      type="submit"
                      disabled={isSubmitting}
                    >
                      Submit
                    </Button>
                  </Form>
                )}
              </Formik>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
}
