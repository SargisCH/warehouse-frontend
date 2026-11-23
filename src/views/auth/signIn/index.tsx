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
import { NavLink, useHistory } from "react-router-dom";
// Chakra imports
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Amplify } from "aws-amplify";
import {
  fetchAuthSession,
  signIn as amplifySignIn,
  signOut,
} from "aws-amplify/auth";
// Custom components
import DefaultAuth from "layouts/auth/Default";
// Assets
import illustration from "assets/img/auth/auth.png";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { Field, Form, Formik } from "formik";
import { useGetUserMutation } from "api/auth";
import { useDispatch } from "react-redux";
import { setUserData } from "store/slices/userSlice";
import FullPageLoader from "components/fullPageLoader/FullPageLoader";

function SignIn() {
  const { t } = useTranslation();
  // Chakra color mode
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const dispatch = useDispatch();
  const [getUser, { data, status: resStatus }] = useGetUserMutation();
  const history = useHistory();
  useEffect(() => {
    if (data && data.email && resStatus === "fulfilled") {
      dispatch(setUserData(data));
      history.push("/admin/default");
    }
  }, [resStatus, data, dispatch]);
  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
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
            {t("common.auth.signIn")}
          </Heading>
          <Text
            mb="36px"
            ms="4px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md"
          >
            {t("common.auth.signInHint")}
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
          <Formik
            initialValues={{ email: "", password: "" }}
            onSubmit={async (values, actions) => {
              actions.setStatus(undefined);
              try {
                const email = values.email.trim();
                const credentials = {
                  username: email,
                  password: values.password,
                };
                const ampData = await amplifySignIn(credentials).catch(
                  async (error) => {
                    if (error?.name !== "UserAlreadyAuthenticatedException")
                      throw error;
                    const session = await fetchAuthSession();
                    const signedInEmail =
                      session.tokens?.idToken?.payload?.email;
                    if (
                      session.tokens?.accessToken &&
                      typeof signedInEmail === "string" &&
                      signedInEmail.toLowerCase() === email.toLowerCase()
                    ) {
                      return {
                        isSignedIn: true,
                        nextStep: { signInStep: "DONE" as const },
                      };
                    }
                    // Switching accounts must authenticate the newly entered credentials.
                    await signOut();
                    return amplifySignIn(credentials);
                  }
                );
                if (
                  ampData.nextStep.signInStep ===
                  "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
                ) {
                  history.push(`/auth/change-password/${values.email}`);
                } else if (ampData.isSignedIn) {
                  const user = await getUser(email).unwrap();
                  if (!user?.email)
                    throw new Error(
                      t("common.auth.accountLoadFailed")
                    );
                } else {
                  actions.setStatus(
                    t("common.auth.additionalVerification")
                  );
                }
              } catch (e: any) {
                const message = e?.data?.message || e?.message;
                actions.setStatus(
                  Array.isArray(message)
                    ? message.join(", ")
                    : message ||
                        t("common.auth.signInFailed")
                );
              } finally {
                actions.setSubmitting(false);
              }
            }}
          >
            {(props) =>
              props.isSubmitting ? (
                <FullPageLoader />
              ) : (
                <Form>
                  {props.status && (
                    <Text role="alert" color="red.600" mb="16px">
                      {props.status}
                    </Text>
                  )}
                  <Field name="email">
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
                        <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="password">
                    {({ field, form }: { field: any; form: any }) => (
                      <FormControl
                        mt={"10px"}
                        isInvalid={
                          form.errors.password && form.touched.password
                        }
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
                          {form.errors.password}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Flex justifyContent="space-between" align="center" mb="24px">
                    <FormControl display="flex" alignItems="center">
                      <Checkbox
                        id="remember-login"
                        colorScheme="brandScheme"
                        me="10px"
                      />
                      <FormLabel
                        htmlFor="remember-login"
                        mb="0"
                        fontWeight="normal"
                        color={textColor}
                        fontSize="sm"
                      >
                        {t("common.auth.rememberMe")}
                      </FormLabel>
                    </FormControl>
                    <NavLink to="/auth/forgot-password">
                      <Text
                        color={textColorBrand}
                        fontSize="sm"
                        w="124px"
                        fontWeight="500"
                      >
                        {t("common.auth.forgotPasswordLink")}
                      </Text>
                    </NavLink>
                  </Flex>
                  <Button
                    type="submit"
                    fontSize="sm"
                    variant="brand"
                    fontWeight="500"
                    w="100%"
                    h="50"
                    mb="24px"
                    isLoading={props.isSubmitting}
                  >
                    {t("common.auth.signIn")}
                  </Button>
                </Form>
              )
            }
          </Formik>
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="start"
            maxW="100%"
            mt="0px"
          >
            <Text color={textColorDetails} fontWeight="400" fontSize="14px">
              {t("common.auth.noAccount")}
              <NavLink to="/auth/sign-up">
                <Text
                  color={textColorBrand}
                  as="span"
                  ms="5px"
                  fontWeight="500"
                >
                  {t("common.auth.createAccount")}
                </Text>
              </NavLink>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;
