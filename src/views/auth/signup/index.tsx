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

import { useTranslation } from "react-i18next";
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
    error = "common.auth.emailRequired";
  }
  return error;
}
function validatePassword(value: string) {
  let error;
  if (!value) {
    error = "common.auth.passwordRequired";
  }
  return error;
}
function validateCompanyName(value: string) {
  let error;
  if (!value) {
    error = "common.auth.companyNameRequired";
  }
  return error;
}
export default function SignUp() {
  const { t } = useTranslation();
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
            actions.setSubmitting(true);
            signUp({ ...values });
          }, 1000);
        }}
      >
        {(props) => (
          <Form>
            <Flex
              w={{ base: "100%", lg: "50%" }}
              maxW={{ base: "100%", lg: "50%" }}
              ms="0px"
              me="auto"
              h="100%"
              alignItems="center"
              justifyContent="center"
              mb={{ base: "30px", md: "60px" }}
              px={{ base: "25px", md: "0px" }}
              mt={{ base: "40px", md: "14vh" }}
              flexDirection="column"
            >
              <Box mx="auto" textAlign="center">
                <Heading color={textColor} fontSize="36px" mb="10px">
                  {t("common.auth.signUp")}
                </Heading>
                <Text
                  mb="36px"
                  ms="4px"
                  color={textColorSecondary}
                  fontWeight="400"
                  fontSize="md"
                >
                  {t("common.auth.signUpHint")}
                </Text>
              </Box>
              <Flex
                zIndex="2"
                direction="column"
                w={{ base: "100%", md: "420px" }}
                maxW="100%"
                background="transparent"
                borderRadius="15px"
                mx="auto"
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
                        {t("common.auth.email")}
                        <Text color={brandStars}>*</Text>
                      </FormLabel>
                      <Input
                        {...field}
                        isRequired={true}
                        fontSize="sm"
                        ms={{ base: "0px", md: "0px" }}
                        type="email"
                        placeholder="name@example.com"
                        fontWeight="500"
                        size="lg"
                      />
                      <FormErrorMessage>
                        {form.errors.email && t(form.errors.email)}
                      </FormErrorMessage>
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
                        {t("common.auth.companyName")}
                        <Text color={brandStars}>*</Text>
                      </FormLabel>
                      <Input
                        {...field}
                        isRequired={true}
                        fontSize="sm"
                        ms={{ base: "0px", md: "0px" }}
                        type="text"
                        placeholder={t("common.auth.companyName")}
                        fontWeight="500"
                        size="lg"
                      />
                      <FormErrorMessage>
                        {form.errors.companyName && t(form.errors.companyName)}
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
                        {t("common.auth.password")}
                        <Text color={brandStars}>*</Text>
                      </FormLabel>
                      <InputGroup size="md">
                        <Input
                          {...field}
                          isRequired={true}
                          fontSize="sm"
                          placeholder={t("common.auth.passwordHint")}
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
                        {form.errors.password && t(form.errors.password)}
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
                    {t("common.auth.signUp")}
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
