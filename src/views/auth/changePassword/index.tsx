import React, { useEffect } from "react";
// Chakra imports
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik"; // Custom components
// Assets
import { useHistory, useParams } from "react-router-dom";
import { confirmSignIn } from "aws-amplify/auth";
import { useGetUserMutation } from "api/auth";
import { useDispatch } from "react-redux";
import { setUserData } from "store/slices/userSlice";

export default function ChangePassword() {
  // Chakra color mode
  const params = useParams<{ email: string }>();
  const dispatch = useDispatch();
  const history = useHistory();
  const [getUser, { data, status: resStatus }] = useGetUserMutation();
  useEffect(() => {
    if (resStatus === "fulfilled") {
      dispatch(setUserData(data));
      history.push("/admin/default");
    }
  }, [resStatus, data, dispatch, history]);
  if (!params.email) return null;
  return (
    <Formik
      initialValues={{ password: "" }}
      onSubmit={async (values, actions) => {
        actions.setSubmitting(false);
        alert(JSON.stringify(values, null, 2));
        actions.setSubmitting(false);
        try {
          const ampData = await confirmSignIn({
            challengeResponse: values.password,
          });
          if (ampData.isSignedIn) {
            getUser(params.email);
          }
        } catch (e) {
          const errorMessage = JSON.stringify(e);
          if (errorMessage.includes("SignInException")) {
            history.push("/auth/signin");
          }
        }
      }}
    >
      {(props) => (
        <Form>
          <Flex
            maxW={{ base: "100%", md: "max-content" }}
            w="100%"
            mx={{ base: "auto", lg: "0px" }}
            me="auto"
            h="100%"
            alignItems="start"
            justifyContent="center"
            mb={{ base: "30px", md: "60px" }}
            px={{ base: "25px", md: "0px" }}
            mt={{ base: "40px", md: "14vh" }}
            flexDirection="column"
          >
            <Box me="auto">
              <Heading fontSize="36px" mb="10px">
                Change password
              </Heading>
              <Text mb="36px" ms="4px" fontWeight="400" fontSize="md">
                Enter new password
              </Text>
            </Box>
            <Flex
              zIndex="2"
              direction="column"
              w={{ base: "100%", md: "420px" }}
              maxW="100%"
              background="transparent"
              borderRadius="15px"
              mx={{ base: "auto", lg: "unset" }}
              me="auto"
              mb={{ base: "20px", md: "auto" }}
            >
              <Field name="password">
                {({ field, form }: { field: any; form: any }) => (
                  <FormControl
                    isInvalid={form.errors.password && form.touched.password}
                  >
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      mb="8px"
                    >
                      Password<Text>*</Text>
                    </FormLabel>
                    <Input
                      {...field}
                      isRequired={true}
                      fontSize="sm"
                      ms={{ base: "0px", md: "0px" }}
                      type="password"
                      placeholder="New Password"
                      fontWeight="500"
                      size="lg"
                    />
                    <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <FormControl>
                <Button
                  fontSize="sm"
                  variant="brand"
                  fontWeight="500"
                  w="100%"
                  h="50"
                  type="submit"
                  mt="24px"
                  isLoading={props.isSubmitting}
                >
                  Change password
                </Button>
              </FormControl>
            </Flex>
          </Flex>
        </Form>
      )}
    </Formik>
  );
}
