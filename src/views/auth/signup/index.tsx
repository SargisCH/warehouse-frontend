/* eslint-disable */
/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
  
                                                                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                                                                        
========================================================= 
* Horizon UI - v1.1.0 
========================================================= 
  
* Product Page: https://www.horizon-ui.com/ 
* Copyright 2022 Horizon UI (https://www.horizon-ui.com/) 
  
* Designed and Coded by Simmmple 
  
========================================================= 
  
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. 
  
*/

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
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik"; // Custom components
import DefaultAuth from "layouts/auth/Default";
// Assets
import illustration from "assets/img/auth/auth.png";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { useSignUpMutation } from "api/auth";
import { useHistory } from "react-router-dom";
function validateEmail(value: string) {
  let error;
  if (!value) {
    error = "Email is required";
  }
  return error;
}
function validatePassword(value: string) {
  let error;
  if (!value) {
    error = "Password is required";
  }
  return error;
}
function validateCompanyName(value: string) {
  let error;
  if (!value) {
    error = "Comapny name is required";
  }
  return error;
}
export default function SignUp() {
  // Chakra color mode
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const [signUp, signUpResult] = useSignUpMutation();
  const history = useHistory();

  console.log("result", signUpResult);

  useEffect(() => {
    if (signUpResult.isSuccess) {
      history.push(`/auth/verify-email/${signUpResult.data.email}`);

    }
  }, [signUpResult.isSuccess]);



  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Formik
        initialValues={{ email: "", companyName: "", password: "" }}
        onSubmit={(values, actions) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            actions.setSubmitting(true);
            signUp({ ...values });
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
                <Heading color={textColor} fontSize="36px" mb="10px">
                  Sign Up
                </Heading>
                <Text
                  mb="36px"
                  ms="4px"
                  color={textColorSecondary}
                  fontWeight="400"
                  fontSize="md"
                >
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
                <Field name="email" validate={validateEmail}>
                  {({ field, form }: { field: any; form: any }) => (
                    <FormControl
                      isInvalid={form.errors.email && form.touched.email}
                    >
                      <FormLabel
                        display="flex"
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        mb="8px"
                      >
                        Email<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <Input
                        {...field}
                        isRequired={true}
                        fontSize="sm"
                        ms={{ base: "0px", md: "0px" }}
                        type="email"
                        placeholder="mail@simmmple.com"
                        fontWeight="500"
                        size="lg"
                      />
                      <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="companyName" validate={validateCompanyName}>
                  {({ field, form }: { field: any; form: any }) => (
                    <FormControl
                      isInvalid={
                        form.errors.companyName && form.touched.companyName
                      }
                    >
                      <FormLabel
                        display="flex"
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        mb="8px"
                      >
                        Company Name<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <Input
                        {...field}
                        isRequired={true}
                        fontSize="sm"
                        ms={{ base: "0px", md: "0px" }}
                        type="text"
                        placeholder="Company Name"
                        fontWeight="500"
                        size="lg"
                      />
                      <FormErrorMessage>
                        {form.errors.companyName}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="password" validate={validatePassword}>
                  {({ field, form }: { field: any; form: any }) => (
                    <FormControl
                      mt={"10px"}
                      isInvalid={form.errors.password && form.touched.password}
                    >
                      <FormLabel
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        display="flex"
                      >
                        Password<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <InputGroup size="md">
                        <Input
                          {...field}
                          isRequired={true}
                          fontSize="sm"
                          placeholder="Min. 8 characters"
                          size="lg"
                          type={show ? "text" : "password"}
                          name="password"
                        />
                        <InputRightElement
                          display="flex"
                          alignItems="center"
                          mt="4px"
                        >
                          <Icon
                            color={textColorSecondary}
                            _hover={{ cursor: "pointer" }}
                            as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                            onClick={handleClick}
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>
                        {form.errors.password}
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
                    Sign Up
                  </Button>
                </FormControl>
              </Flex>
            </Flex>
          </Form>
        )}
      </Formik>
    </DefaultAuth>
  );
}
