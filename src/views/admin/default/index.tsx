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

// Chakra imports

import { Box, Icon, SimpleGrid, Text, useColorModeValue } from "@chakra-ui/react";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import { MdBarChart } from "react-icons/md";
import QuickLinks from "views/admin/default/components/QuickLinks";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setUserData } from "store/slices/userSlice";
import { useGetUserMutation } from "api/auth";
import { RootState } from "store/store";
import { useTranslation } from "react-i18next";

export default function UserReports() {
  const [getUser, { data: userData }] = useGetUserMutation();
  const { t } = useTranslation();

  const userEmail = useSelector((state: RootState) => state.user.email || "");
  const dispatch = useDispatch();
  useEffect(() => {
    getUser(userEmail);
  }, [userEmail, getUser]);
  useEffect(() => {
    if (userData?.email) {
      dispatch(setUserData(userData));
    }
  }, [dispatch, userData]);
  const balance = useSelector(
    (state: RootState) => state.user?.tenant?.balance ?? 0,
  );
  const currency = useSelector(
    (state: RootState) => state.user?.tenant?.currency || "",
  );

  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const textColor = useColorModeValue("secondaryGray.900", "white");

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="20px" mb="20px">
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon w="32px" h="32px" as={MdBarChart} color={brandColor} />
              }
            />
          }
          name={t("common.balance")}
          value={`${balance} ${currency}`}
        />
      </SimpleGrid>
      <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px">
        {t("common.quickLinks")}
      </Text>
      <QuickLinks />
    </Box>
  );
}
