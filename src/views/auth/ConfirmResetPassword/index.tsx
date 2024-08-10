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
import {
  confirmResetPassword,
  confirmSignIn,
  resetPassword,
  ResetPasswordOutput,
} from "aws-amplify/auth";
import { useGetUserMutation } from "api/auth";
import { useDispatch } from "react-redux";
import { setUserData } from "store/slices/userSlice";

export default function ConfirmResetPassword() {
  // Chakra color mode
  const params = useParams<{ username: string }>();
  const dispatch = useDispatch();
  const history = useHistory();
  function handleResetPasswordNextSteps(output: ResetPasswordOutput) {
    const { nextStep } = output;
    switch (nextStep.resetPasswordStep) {
      case "CONFIRM_RESET_PASSWORD_WITH_CODE":
        const codeDeliveryDetails = nextStep.codeDeliveryDetails;
        // Collect the confirmation code from the user and pass to confirmResetPassword.
        break;
      case "DONE":
        console.log("Successfully reset password.");
        break;
    }
  }
  return (
    <Formik
      initialValues={{ code: null, newPassword: "" }}
      onSubmit={async (values, actions) => {
        actions.setSubmitting(false);
        alert(JSON.stringify(values, null, 2));
        await confirmResetPassword({
          username: params.username,
          confirmationCode: values.code,
          newPassword: values.newPassword,
        });
        history.push("/auth/sign-in");
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
                Confirm Reset password
              </Heading>
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
              <Field name="code">
                {({ field, form }: { field: any; form: any }) => (
                  <FormControl
                    isInvalid={form.errors.code && form.touched.code}
                  >
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      mb="8px"
                    >
                      Verification code <Text>*</Text>
                    </FormLabel>
                    <Input
                      {...field}
                      isRequired={true}
                      fontSize="sm"
                      ms={{ base: "0px", md: "0px" }}
                      type="text"
                      placeholder="code"
                      fontWeight="500"
                      size="lg"
                    />
                    <FormErrorMessage>{form.errors.code}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="newPassword">
                {({ field, form }: { field: any; form: any }) => (
                  <FormControl
                    isInvalid={
                      form.errors.newPassword && form.touched.newPassword
                    }
                  >
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      mb="8px"
                    >
                      New password <Text>*</Text>
                    </FormLabel>
                    <Input
                      {...field}
                      isRequired={true}
                      fontSize="sm"
                      ms={{ base: "0px", md: "0px" }}
                      type="password"
                      placeholder="new password"
                      fontWeight="500"
                      size="lg"
                    />
                    <FormErrorMessage>
                      {form.errors.newPassword}
                    </FormErrorMessage>
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
                  save
                </Button>
              </FormControl>
            </Flex>
          </Flex>
        </Form>
      )}
    </Formik>
  );
}
