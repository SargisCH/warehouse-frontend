import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Image,
  VStack,
} from "@chakra-ui/react";
import { useGetUserMutation, useUpdateSettingsMutation } from "api/auth";
import { Field, Form, Formik } from "formik";
import { useState, ChangeEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { setUserData } from "store/slices/userSlice";
import { RootState } from "store/store";

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
  return (
    <Box display={"flex"} justifyContent="center">
      <h1>{t("common.profileSettings")}</h1>
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
                <FormLabel htmlFor="name">{t("common.companyName")}</FormLabel>
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

              <Box>
                <Image
                  src={imageSrc || tenant?.logo}
                  alt="Uploaded Preview"
                  boxSize="200px"
                  objectFit="contain"
                />
              </Box>

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
    </Box>
  );
}
