// @ts-nocheck comment
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import daomanagerabi from "../../utils/abis/daomanagerabi.json";
import governancetokenabi from "../../utils/abis/governancetokenabi.json";
import {
  Box,
  Container,
  GridItem,
  AbsoluteCenter,
  Spinner,
} from "@chakra-ui/react";
import DaosCard from "../../components/DaosCard/DaosCard";

const Explore = () => {
  const [daos, setDaos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const onLoad = async () => {
    if (window.ethereum._state.accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userSideInstance = new ethers.Contract(
        process.env.NEXT_PUBLIC_DAOMANAGER_ADDRESS,
        daomanagerabi,
        signer
      );
      const tempTotalDaos = Number(await userSideInstance.totalDaos());
      let tempDaos = [];

      for (let i = 1; i <= tempTotalDaos; i++) {
        const tempDaoInfo = await userSideInstance.daoIdtoDao(i);
        const tempCreatorId = Number(tempDaoInfo.creator);
        const tempCreatorInfo = await userSideInstance.userIdtoUser(
          tempCreatorId
        );
        const tempTokenAddress = tempDaoInfo.governanceTokenAddress;

        const governanceTokenInstance = new ethers.Contract(
          tempTokenAddress,
          governancetokenabi,
          signer
        );

        const tempTokenName = await governanceTokenInstance.name();
        const tempTokenSymbol = await governanceTokenInstance.symbol();

        const totalDaoMembers = await userSideInstance.getAllDaoMembers(
          tempDaoInfo.daoId
        );

        tempDaos.push({
          daoInfo: tempDaoInfo,
          creatorInfo: tempCreatorInfo,
          tokenName: tempTokenName,
          tokenSymbol: tempTokenSymbol,
          totalDaoMembers: totalDaoMembers.length,
        });
      }

      setDaos(tempDaos);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    onLoad();
  }, []);

  return (
    <Box>
      {isLoading ? (
        <>
          <AbsoluteCenter>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="orange.500"
              size="xl"
            />
          </AbsoluteCenter>
          <AbsoluteCenter style={{ marginTop: "60px", whiteSpace: "nowrap" }}>
            <h2>Loading Public DAOs</h2>
          </AbsoluteCenter>
        </>
      ) : (
        <Container
          maxW={"7xl"}
          p="12"
          templateRows="repeat(2, 1fr)"
          templateColumns="repeat(4, 1fr)"
          gap={4}
        >
          {daos &&
            daos
              .filter((dao) => dao.daoInfo.isPrivate === false)
              .map((dao) => (
                <GridItem key={dao.daoInfo.daoId} rowSpan={1}>
                  <DaosCard
                    daoName={dao.daoInfo.daoName}
                    joiningThreshold={dao.daoInfo.joiningThreshold}
                    creatorName={dao.creatorInfo.userName}
                    tokenName={dao.tokenName}
                    tokenSymbol={dao.tokenSymbol}
                    totalDaoMember={dao.totalDaoMembers}
                    daoId={dao.daoInfo.daoId}
                    channel={dao.daoInfo.discordID}
                  />
                </GridItem>
              ))}
        </Container>
      )}
    </Box>
  );
};

export default Explore;
