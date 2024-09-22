// @ts-nocheck comment
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Divider,
  HStack,
  Tag,
  Image,
  Wrap,
  WrapItem,
  SpaceProps,
  useColorModeValue,
  Container,
  VStack,
  Button,
  useToast,
  Center,
  Flex,
  Tooltip,
} from "@chakra-ui/react";
import { Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { AddIcon } from "@chakra-ui/icons";
import { RiTokenSwapFill } from "react-icons/ri";
import { MdOutlineGroups3 } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";
import daomanagerabi from "../../utils/abis/daomanagerabi.json";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { desc } from "framer-motion/client";

const DaosCard = ({
  daoName,
  tokenName,
  joiningThreshold,
  tokenSymbol,
  creatorName,
  totalDaoMember,
  daoId,
  channel,
}) => {
  const toast = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();
  const avatar = session?.user?.image;
  console.log(avatar, "avatar");
  const userId = avatar?.split("/")[4];
  console.log(userId);
  console.log(totalDaoMember, "totalDaoMember");
  console.log(channel, "channel");

  const joinDiscord = async ({ userId, channelId }) => {
    try {
      const response = await fetch("/api/add-member-discord", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelId: channelId,
          userId: userId,
          permissions: {
            id: userId,
            type: 1,
            allow: "1024",
            deny: "0",
          },
        }),
      });
      toast({
        title: "Thank you for joining DAO",
        description: "You have been added to the private DAO Discord channel",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(
        "Error updating Discord permissions:",
        error.response?.data || error.message
      );
      toast({
        title: "Failed to join DAO channel on Discord",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw new Error("Failed to update Discord permissions");
    }
  };

  const joinDao = async () => {
    try {
      if (window.ethereum._state.accounts.length !== 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_DAOMANAGER_ADDRESS,
          daomanagerabi,
          signer
        );
        const accounts = await provider.listAccounts();
        const tx = await contract.joinDao(daoId, accounts[0]);
        await tx.wait();

        toast({
          title: "Congratulations!",
          description:
            "You have successfully joined the DAO. Pls wait while we add you to the private DAO Discord channel",
          status: "info",
          duration: 5000,
          isClosable: true,
        });

        //Add user to discord channel
        await joinDiscord({ userId: userId, channelId: channel });
      }
    } catch (error) {
      toast({
        title: "Sorry!",
        description:
          "You don't meet required token requirements to join this DAO",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  return (
    <Center>
      <Box
        marginTop={{ base: "1", sm: "8" }}
        display="flex"
        flexDirection={{ base: "column", sm: "row" }}
        justifyContent="center"
        mb={8}
        marginLeft={{ base: "0", sm: "5%" }}
        width={{ base: "100%", sm: "65%" }}
        rounded={{ base: "none", sm: "xl" }}
        boxShadow={{ base: "lg", sm: "xxl" }}
        borderWidth="1px"
        overflow="hidden"
        // on hover raise the card

        _hover={{
          boxShadow: "xl",
          transform: "translateY(-4px)",
        }}
      >
        <Box
          display="flex"
          flex="1"
          marginRight="3"
          position="relative"
          alignItems="center"
        >
          {/* <Box
            width={{ base: "100%", sm: "85%" }}
            zIndex="2"
            marginLeft={{ base: "0", sm: "5%" }}
            marginTop="5%"
          > */}
          <Box textDecoration="none" _hover={{ textDecoration: "none" }}>
            <Image
              borderRadius="lg"
              src="/assets/dao.png"
              alt="Cover Image"
              //   objectFit="contain"
              _placeholder={blur}
              width={{ base: "100%", sm: "100%" }}
              rounded={{ base: "none", sm: "xl" }}
              height={{ base: "100%", sm: "100%" }}
              zIndex="2"
              alignItems={"center"}
              display={"flex"}
              alignContent={"center"}
              justifyContent={"center"}
            />
          </Box>
          {/* </Box> */}
          <Box zIndex="1" width="100%" position="absolute" height="100%">
            <Box
              bgGradient={useColorModeValue(
                "radial(orange.600 1px, transparent 1px)",
                "radial(orange.300 1px, transparent 1px)"
              )}
              backgroundSize="20px 20px"
              opacity="0.4"
              height="100%"
            />
          </Box>
        </Box>
        <Box
          display="flex"
          flex="1"
          flexDirection="column"
          justifyContent="center"
          marginTop={{ base: "3", sm: "0" }}
        >
          <Heading marginTop="1">
            <Center>
              <Text textDecoration="none" _hover={{ textDecoration: "none" }}>
                {daoName}
              </Text>
            </Center>
          </Heading>
          <Center>
            {" "}
            <Text
              as="p"
              marginTop="6"
              color={useColorModeValue("gray.700", "gray.200")}
              fontSize="lg"
            >
              Minimum Tokens Required: {joiningThreshold.toString() / 1e18}{" "}
              {tokenSymbol}
            </Text>
          </Center>
          <Flex
            justifyContent={"space-between"}
            marginLeft={10}
            marginRight={10}
            marginTop={6}
            alignItems={"center"}
          >
            <Text
              as="p"
              marginTop="2"
              color={useColorModeValue("gray.700", "gray.200")}
              fontSize="lg"
            >
              {tokenName}
            </Text>
            <Text
              as="p"
              marginTop="2"
              color={useColorModeValue("gray.700", "gray.200")}
              fontSize="lg"
            >
              <RiTokenSwapFill size={35} color="teal" />
            </Text>
            <Text
              as="p"
              marginTop="2"
              color={useColorModeValue("gray.700", "gray.200")}
              fontSize="lg"
            >
              {tokenSymbol}
            </Text>
          </Flex>
          <Flex
            justifyContent={"space-between"}
            marginLeft={10}
            marginRight={10}
            marginTop={6}
          >
            {" "}
            <Flex
              flexDir={"column"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Tooltip label="Total Members">
                <Text
                  as="p"
                  marginTop="2"
                  color={useColorModeValue("gray.700", "gray.200")}
                  fontSize="lg"
                >
                  <MdOutlineGroups3 size={30} />
                </Text>
              </Tooltip>
              <Text
                as="p"
                marginTop="2"
                color={useColorModeValue("gray.700", "gray.200")}
                fontSize="lg"
              >
                {totalDaoMember}
              </Text>
            </Flex>
            <Flex
              flexDir={"column"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Tooltip label="Admin">
                <Text
                  as="p"
                  marginTop="2"
                  color={useColorModeValue("gray.700", "gray.200")}
                  fontSize="lg"
                >
                  <RiAdminLine size={25} />
                </Text>
              </Tooltip>
              <Text
                as="p"
                marginTop="2"
                color={useColorModeValue("gray.700", "gray.200")}
                fontSize="lg"
              >
                {creatorName}
              </Text>
            </Flex>
          </Flex>
          <Button margin={6} mb={2} onClick={joinDao}>
            <AddIcon mx="2px" /> Join DAO
          </Button>
          <Button
            marginRight={6}
            marginLeft={6}
            marginBottom={2}
            mt={2}
            onClick={() => router.push(`/dao/${daoId}`)}
          >
            View More <ExternalLinkIcon mx="2px" />
          </Button>
        </Box>
      </Box>
    </Center>
  );
};

export default DaosCard;
