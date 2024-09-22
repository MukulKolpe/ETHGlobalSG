// @ts-nocheck comment
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import daomanagerabi from "../../utils/abis/daomanagerabi.json";
import governancetokenabi from "../../utils/abis/governancetokenabi.json";
import {
  Box,
  Avatar,
  Heading,
  Icon,
  Text,
  Button,
  Stack,
  Badge,
  SimpleGrid,
  Link,
  Flex,
} from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";

const Profile = () => {
  const account = useAccount();
  const [userDaos, setUserDaos] = useState([]);
  const [userInfo, setuserInfo] = useState([]);

  const onLoad = async () => {
    if (window.ethereum._state.accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userSideInstance = new ethers.Contract(
        process.env.NEXT_PUBLIC_DAOMANAGER_ADDRESS,
        daomanagerabi,
        signer
      );
      console.log(userSideInstance);
      const tempUserId = await userSideInstance.userWallettoUserId(
        account.address
      );
      console.log(tempUserId);
      const tempUserInfo = await userSideInstance.userIdtoUser(tempUserId);
      setuserInfo(tempUserInfo);
      const tempUserDaos = await userSideInstance.getAllUserDaos(tempUserId);
      console.log(tempUserDaos);
      let tempDaoInfo,
        tempAdminId,
        tempAdminInfo,
        tempDaoCreatorInfo,
        tempDaoTokenInfo,
        govtTokenName,
        govtTokenSymbol;
      for (let i = 0; i < tempUserDaos.length; i++) {
        tempDaoInfo = await userSideInstance.daoIdtoDao(tempUserDaos[i]);
        console.log(tempDaoInfo);
        tempAdminId = tempDaoInfo.creator;
        tempAdminInfo = await userSideInstance.userIdtoUser(tempAdminId);
        console.log(tempAdminInfo);
        // //token Info
        const governanceTokenInstance = new ethers.Contract(
          tempDaoInfo.governanceTokenAddress,
          governancetokenabi,
          signer
        );
        console.log(governanceTokenInstance);
        govtTokenName = await governanceTokenInstance.name();
        govtTokenSymbol = await governanceTokenInstance.symbol();
        console.log(govtTokenName);
        console.log(govtTokenSymbol);
        setUserDaos((daos) => [
          ...daos,
          {
            daoInfo: tempDaoInfo,
            creatorInfo: tempAdminInfo,
            tokenName: govtTokenName,
            tokenSymbol: govtTokenSymbol,
          },
        ]);
      }
    }
  };

  useEffect(() => {
    onLoad();
  }, []);

  console.log(userDaos);

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      <Stack align="center">
        <Avatar
          size="xl"
          name={userInfo[1]}
          src={`https://gateway.lighthouse.storage/ipfs/${userInfo[4]}`}
        />

        <Heading my={2}>{userInfo[1]}</Heading>
        <Text color="gray.500">{userInfo[2]}</Text>
        <Badge colorScheme="green">Online</Badge>
      </Stack>

      <Box mt={4}>
        <Heading size="md">About Me</Heading>
        <Text>{userInfo[3]}</Text>
      </Box>

      <Box mt={4}>
        {userDaos?.length !== 0 && <Heading size="md">My DAOs</Heading>}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} mt={4}>
          {userDaos?.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              h="200px"
              w="100%"
              bg="teal.800"
              borderWidth="1px"
              borderRadius="lg"
              p={8}
              textAlign="center"
              boxShadow="md"
            >
              <Text fontSize="lg" mb={4} fontWeight="bold" color="white">
                You do not have any membership DAOs yet
              </Text>
              <Link href="/explore">
                <Button colorScheme="green">Join a DAO</Button>
              </Link>
            </Flex>
          ) : (
            userDaos.map((dao) => (
              <Box
                key={dao.daoInfo[0].toString()}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                position="relative"
                h="100%"
              >
                <Heading size="sm">{dao.daoInfo.daoName}</Heading>
                <Text mt={2}>{dao.daoInfo.daoDescription}</Text>
                <Link
                  color="teal.500"
                  href={`/dao/${dao.daoInfo[0].toString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  position="absolute"
                  top="4"
                  right="4"
                  fontSize="xl"
                  _hover={{ textDecoration: "underline" }}
                >
                  <Icon as={FaExternalLinkAlt} ml={2} />
                </Link>
              </Box>
            ))
          )}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default Profile;
