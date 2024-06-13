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
import { useVerifyEmailMutation } from "api/auth";
import { useHistory, useParams } from "react-router-dom";
export default function VerifyEmail() {
  const history = useHistory();
  // Chakra color mode
  const [verifyEmailRequest, { data = {} }] = useVerifyEmailMutation();
  const params = useParams<{ email: string }>();
  console.log("data verified", data);
  useEffect(() => {
    if (data.verified) {
      history.push("/auth/");
    }
  }, [data.verified, history]);
  if (!params.email) return null;
  return (
    <Formik
      initialValues={{ code: "" }}
      onSubmit={(values, actions) => {
        setTimeout(() => {
          actions.setSubmitting(false);
          verifyEmailRequest({ ...values, email: params.email });
        }, 1000);
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
                Sign Up
              </Heading>
              <Text mb="36px" ms="4px" fontWeight="400" fontSize="md">
                Enter your details to sign up!
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
                      Code<Text>*</Text>
                    </FormLabel>
                    <Input
                      {...field}
                      isRequired={true}
                      fontSize="sm"
                      ms={{ base: "0px", md: "0px" }}
                      type="text"
                      placeholder="Code"
                      fontWeight="500"
                      size="lg"
                    />
                    <FormErrorMessage>{form.errors.code}</FormErrorMessage>
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
                  Sign Up
                </Button>
              </FormControl>
            </Flex>
          </Flex>
        </Form>
      )}
    </Formik>
  );
}
