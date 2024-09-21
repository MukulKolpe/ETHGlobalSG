//@ts-nocheck comment
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import lighthouse from "@lighthouse-web3/sdk";
import daomanagerabi from "@/utils/abis/daomanagerabi.json";
import DaoDetails from "@/components/DaoPageModals/DaoDetails/DaoDetails";
import FileShare from "@/components/DaoPageModals/FileShare/FileShare";
import ProposalTab from "@/components/DaoPageModals/ProposalTab/ProposalTab";
import ProposalModal from "@/components/DaoPageModals/ProposalModal/proposalModal";
import VoteModal from "@/components/DaoPageModals/VoteModal/VoteModal";
import InviteModal from "@/components/DaoPageModals/InviteModal.tsx/InviteModal";
import VoteResults from "@/components/DaoPageModals/VoteResults/VoteResults";
import {
  useDisclosure,
  useToast,
  Center,
  Flex,
  chakra,
  Grid,
  GridItem,
  VStack,
  Divider,
  Box,
  Heading,
  Text,
  AbsoluteCenter,
} from "@chakra-ui/react";
import { CheckCircleIcon, NotAllowedIcon } from "@chakra-ui/icons";
import GovernanceTokenAbi from "@/utils/abis/governancetokenabi.json";
import { Spinner } from "@chakra-ui/react";

const DaoPage = () => {
  const router = useRouter();
  const account = useAccount();
  const [isMember, setIsMember] = useState(false);
  const [size, setSize] = useState("md");
  const [propSignal, setPropSignal] = useState(false);
  const [daoInfo, setDaoInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daoProposals, setDaoProposals] = useState([]);
  const [daoMembers, setDaoMembers] = useState([]);
  const [tokenAddress, setTokenAddress] = useState("");
  const [totalMembers, setTotalMembers] = useState(0);
  const [voteOnce, setvoteOnce] = useState(true);
  const [adminInfo, setAdminInfo] = useState();
  const [votingthreshold, setVotingThreshold] = useState();
  const [proposalArray, setProposalArray] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState();
  const [passingThreshold, setPassingThreshold] = useState();
  const { address } = useAccount();
  const [proposalType, setProposalType] = useState();
  const [proposalForVote, setProposalForVote] = useState(0);
  const [userResponse, setUserResponse] = useState(-1);
  const [yesVotes, setYesVotes] = useState([]);
  const [noVotes, setNoVotes] = useState([]);
  const [abstainVotes, setAbstainVotes] = useState([]);
  const [inviteAddress, setInviteAddress] = useState("");
  const [endTime, setEndTime] = useState();
  const [finalVerdict, setFinalVerdict] = useState("");
  const [docName, setDocName] = useState("");
  const [docDesc, setDocDesc] = useState("");
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [submitSt, setSubmitSt] = useState(false);
  const inputRef = useRef(null);
  const toast = useToast();

  const changeHandler = () => {
    setProfileImage(inputRef.current?.files[0]);
  };

  const progressCallback = (progressData) => {
    let percentageDone =
      100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
    console.log(percentageDone);
  };

  const uploadFile = async (file) => {
    const output = await lighthouse.upload(
      file,
      process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY,
      false,
      null,
      progressCallback
    );
    console.log("File Status:", output);

    setIpfsUrl(output.data.Hash);

    toast({
      title: "Image Uploaded to the IPFS.",
      description: "Congratulations 🎉 ",
      status: "success",
      duration: 1000,
      isClosable: true,
      position: "top-right",
    });

    console.log(
      "Visit at https://gateway.lighthouse.storage/ipfs/" + output.data.Hash
    );
  };

  const inviteMembertoDao = async () => {
    if (window.ethereum._state.accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DAOMANAGER_ADDRESS,
        daomanagerabi,
        signer
      );
      const accounts = await provider.listAccounts();
      const tx = await contract.addMembertoDao(
        daoInfo.daoId,
        inviteAddress,
        accounts[0]
      );
      setSubmitSt(true);
      await tx.wait();
      setSubmitSt(false);
      toast({
        title: "Member Added",
        description: `${inviteAddress} is now part of the DAO.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onStartClose();
    } else {
      console.log("Metamask Not connected");
    }
  };

  const handleSubmit = async () => {
    if (window.ethereum._state.accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DAOMANAGER_ADDRESS,
        daomanagerabi,
        signer
      );
      const accounts = await provider.listAccounts();
      const tx = await contract.uploadDocument(
        docName,
        docDesc,
        daoInfo.daoId,
        ipfsUrl
      );
      setSubmitSt(true);
      await tx.wait();
      setSubmitSt(false);

      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onUploadClose();
    }
  };

  const convertString = (dateString: any) => {
    const date = new Date(dateString);
    const millisecondsSinceEpoch = date.getTime() / 1000;
    return millisecondsSinceEpoch;
  };

  const convertToEpoch = (dateString: any) => {
    const epochValue = new Date(dateString + "T00:00:00Z").getTime() / 1000;
    return epochValue;
  };

  // add proposal
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  // to vote
  const {
    isOpen: isVoteOpen,
    onOpen: onVoteOpen,
    onClose: onVoteClose,
  } = useDisclosure();

  //add new member to dao
  const {
    isOpen: isStartOpen,
    onOpen: onStartOpen,
    onClose: onStartClose,
  } = useDisclosure();

  //view results
  const {
    isOpen: isEndOpen,
    onOpen: onEndOpen,
    onClose: onEndClose,
  } = useDisclosure();

  //open upload file form
  const {
    isOpen: isUploadOpen,
    onOpen: onUploadOpen,
    onClose: onUploadClose,
  } = useDisclosure();

  const handleSizeClick1 = (newSize) => {
    setSize(newSize);
    onAddOpen();
  };

  const handleSizeClick2 = (newSize) => {
    setSize(newSize);
    onVoteOpen();
  };

  const handleSizeClick3 = (newSize) => {
    setSize(newSize);
    onStartOpen();
  };

  const handleSizeClick4 = (newSize) => {
    setSize(newSize);
    onEndOpen();
  };

  const handleSizeClick5 = (newSize) => {
    setSize(newSize);
    onUploadOpen();
  };

  const onLoad = async () => {
    const daoId = router.query.daoId;
    if (daoId) {
      if (window.ethereum._state.accounts.length !== 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const userSideInstance = new ethers.Contract(
          process.env.NEXT_PUBLIC_DAOMANAGER_ADDRESS,
          daomanagerabi,
          signer
        );
        console.log(userSideInstance);
        const tempDaoInfo = await userSideInstance.daoIdtoDao(daoId);
        setDaoInfo(tempDaoInfo);
        const tempDaoMembers = await userSideInstance.getAllDaoMembers(daoId);
        console.log(tempDaoMembers);
        setTotalMembers(tempDaoMembers.length);
        const tempDaoProposals = await userSideInstance.getAllDaoProposals(
          daoId
        );
        console.log(tempDaoProposals);
        const membershipSignal = await userSideInstance.checkMembership(
          daoId,
          account.address
        );
        setIsMember(membershipSignal);
        console.log("Membership signal: " + membershipSignal);
        setLoading(false);
        console.log("Dao Status: " + tempDaoInfo.isPrivate);
        const tempAdminId = await tempDaoInfo.creator;
        const tempAdminInfo = await userSideInstance.userIdtoUser(tempAdminId);
        console.log(tempAdminInfo);
        setAdminInfo(tempAdminInfo);
        loadAllProposals(daoId);
      }
    } else {
      console.log("Dao doesn't exist");
    }
  };

  const authorizeContract = async () => {
    if (window?.ethereum?._state?.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userSideInstance = new ethers.Contract(
        process.env.NEXT_PUBLIC_DAOMANAGER_ADDRESS,
        daomanagerabi,
        signer
      );
      console.log(userSideInstance);
      const accounts = await provider.listAccounts();
      const propInfo = await userSideInstance.proposalIdtoProposal(
        proposalForVote
      );
      const govTokenAdd = propInfo.votingTokenAddress;
      var minThreshold = propInfo.votingThreshold;
      const govTokenContract = new ethers.Contract(
        govTokenAdd,
        GovernanceTokenAbi,
        signer
      );
      const tokenSymbol = await govTokenContract.symbol();
      console.log(tokenSymbol);
      const tx = await govTokenContract.approve(
        process.env.NEXT_PUBLIC_DAOMANAGER_ADDRESS,
        minThreshold
      );
      setSubmitSt(true);
      await tx.wait();
      setSubmitSt(false);
      toast({
        title: "Congrats! Transaction Complete",
        description: `Your vote will be counted soon.`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      const tx2 = await userSideInstance.voteForProposal(
        proposalForVote,
        userResponse,
        account.address
      );
      setSubmitSt(true);
      await tx2.wait();
      setSubmitSt(false);
      toast({
        title: "Congrats.",
        description: `Your vote has been counted.`,
        status: "success",
        duration: 10000,
        isClosable: true,
        position: "top-right",
      });
      onVoteClose();

      await discordUpdate(
        `New Vote: ${account.address} has casted for the proposal ${propInfo.proposalTitleAndDesc}. Cast your vote now`
      );
    }
  };

  useEffect(() => {
    if (router) {
      onLoad();
    }
  }, [router]);

  console.log(proposalArray);

  const loadAllProposals = async (daoId) => {
    if (window.ethereum._state.accounts.length !== 0 && daoId) {
      console.log("Went Inside");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userSideContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DAOMANAGER_ADDRESS,
        daomanagerabi,
        signer
      );

      const totalProposals = Number(
        await userSideContract.getAllDaoProposals(BigInt(daoId))
      );
      let tempProposalId,
        tempProposalInfo,
        governanceTokenContract,
        tokenSymbol,
        tokenName;
      let tempProposalArray = await userSideContract.getAllDaoProposals(daoId);

      console.log(tempProposalArray);
      for (let i = 0; i < tempProposalArray.length; i++) {
        tempProposalInfo = await userSideContract.proposalIdtoProposal(
          tempProposalArray[i]
        );
        console.log(tempProposalInfo);

        governanceTokenContract = new ethers.Contract(
          tempProposalInfo.votingTokenAddress,
          GovernanceTokenAbi,
          signer
        );
        tokenSymbol = await governanceTokenContract.symbol();
        tokenName = await governanceTokenContract.name();
        console.log(tokenSymbol);
        console.log(tokenName);
        console.log(tempProposalInfo);
        setProposalArray((prevState) => [
          ...prevState,
          {
            proposalInfo: tempProposalInfo,
            tokenName: tokenName,
            tokenSymbol: tokenSymbol,
          },
        ]);
      }
      // for (let i = 0; i < totalProposals; i++) {
      //   tempProposalInfo = await userSideContract.proposalIdtoproposal(
      //     tempProposalId
      //   );
      //   governanceTokenContract = new ethers.Contract(
      //     tempProposalInfo.governanceTokenAddress,
      //     GovernanceTokenAbi,
      //     signer
      //   );
      //   tokenSymbol = await governanceTokenContract.symbol();
      //   tokenName = await governanceTokenContract.name();
      //   console.log(tokenSymbol);
      //   console.log(tokenName);
      //   console.log(tempProposalInfo);
      //   setProposalArray((prevState) => [
      //     ...prevState,
      //     {
      //       proposalInfo: tempProposalInfo,
      //       tokenName: tokenName,
      //       tokenSymbol: tokenSymbol,
      //     },
      //   ]);
      // }
      setPropSignal(true);
    }
  };

  const discordUpdate = async (content) => {
    console.log("Updating Discord with message:", content);
    console.log("DAO Discord ID:", daoInfo.discordID);
    try {
      const response = await fetch("/api/message-update-discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          channelId: daoInfo.discordID,
        }),
      });

      console.log(response);
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

  const addProposal = async () => {
    if (window.ethereum._state.accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userSideContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DAOMANAGER_ADDRESS,
        daomanagerabi,
        signer
      );

      console.log(title);
      console.log(description);
      console.log(votingthreshold);
      console.log(daoInfo.daoId.toString());
      console.log(tokenAddress);
      console.log(address);
      console.log(startDate);
      console.log(endTime);
      console.log(passingThreshold);
      console.log(voteOnce);
      console.log(daoInfo);

      const tx = await userSideContract.createProposal(
        proposalType,
        title + "|" + description,
        votingthreshold,
        daoInfo.daoId,
        tokenAddress,
        address,
        startDate,
        endTime,
        passingThreshold,
        voteOnce
      );
      setSubmitSt(true);
      await tx.wait();
      setSubmitSt(false);

      toast({
        title: "Proposal Created",
        description: "Your proposal has been created",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      await discordUpdate(`New Proposal: ${title} has been added to the DAO.`);

      onAddClose();
    }
  };

  let now1 = new Date();
  let timestamp1 = now1.getTime();
  let currentTimestamp = timestamp1 / 1000;

  const filteringDaos = (beginningTime, endingTime) => {
    var now = new Date();
    var timestamp = now.getTime();
    var secondsSinceEpoch = timestamp / 1000;
    console.log(beginningTime);
    if (secondsSinceEpoch < Number(beginningTime)) {
      //to be happening in future
      return -1;
    }
    if (secondsSinceEpoch > Number(endingTime)) {
      //to have happened in past
      return 1;
    }
    return 0;
  };

  const getVotingResults = async (_proposalId) => {
    if (window?.ethereum?._state?.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userSideInstance = new ethers.Contract(
        process.env.NEXT_PUBLIC_DAOMANAGER_ADDRESS,
        daomanagerabi,
        signer
      );
      //const accounts = await provider.listAccounts();
      const yesArray = await userSideInstance.getAllYesVotes(_proposalId);
      const noArray = await userSideInstance.getAllNoVotes(_proposalId);
      const abstainArray = await userSideInstance.getAllAbstainVotes(
        _proposalId
      );
      const totalArray = await userSideInstance.getAllVoters(_proposalId);
      const yesPercentage =
        (yesArray.length /
          (yesArray.length + noArray.length + abstainArray.length)) *
        100;
      console.log(yesPercentage);
      setYesVotes(yesArray);
      setNoVotes(noArray);
      setAbstainVotes(abstainArray);
      const propInfo = await userSideInstance.proposalIdtoProposal(
        proposalForVote
      );
      const winnningThresold = Number(propInfo.passingThreshold);
      if (yesPercentage >= winnningThresold) {
        setFinalVerdict("Proposal has Passed!");
      } else {
        setFinalVerdict("Proposal has been reverted");
      }
    }
  };

  if (loading) {
    return (
      <AbsoluteCenter>
        <Spinner />
      </AbsoluteCenter>
    );
  }

  if (!isMember) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <NotAllowedIcon boxSize={"50px"} color={"red.500"} />
        <Heading as="h2" size="xl" mt={6} mb={2}>
          This DAO is Private
        </Heading>
        <Text color={"gray.500"}>You are not a member is DAO.</Text>
      </Box>
    );
  }

  console.log(voteOnce);
  console.log(daoInfo);

  return (
    <div>
      <Center>
        <Flex flexDir={"row"} justifyContent={"center"} alignItems={"center"}>
          {" "}
          <DaoDetails
            daoInfo={daoInfo}
            totalMembers={totalMembers}
            adminInfo={adminInfo}
            isMember={isMember}
            address={address}
            handleSizeClick1={handleSizeClick1}
            handleSizeClick3={handleSizeClick3}
            submitSt={submitSt}
          />
          {isMember && (
            <>
              <FileShare
                handleSizeClick5={handleSizeClick5}
                isUploadOpen={isUploadOpen}
                onUploadClose={onUploadClose}
                docName={docName}
                setDocName={setDocName}
                docDesc={docDesc}
                setDocDesc={setDocDesc}
                profileImage={profileImage}
                inputRef={inputRef}
                changeHandler={changeHandler}
                uploadIPFS={uploadFile}
                handleSubmit={handleSubmit}
                daoInfo={daoInfo}
                submitSt={submitSt}
              />
            </>
          )}
        </Flex>
      </Center>
      <Divider mt={12} mb={12} />
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(2, 1fr)",
        }}
        gap={4}
      >
        <GridItem colSpan={3}>
          <VStack alignItems="flex-start" spacing="20px">
            <Center>
              <chakra.h2 fontSize="3xl" fontWeight="700" ml={2}>
                All proposals
              </chakra.h2>
            </Center>
          </VStack>
        </GridItem>
      </Grid>
      <ProposalTab
        propSignal={propSignal}
        proposalArray={proposalArray}
        isMember={isMember}
        currentTimestamp={currentTimestamp}
        setProposalForVote={setProposalForVote}
        handleSizeClick2={handleSizeClick2}
        handleSizeClick4={handleSizeClick4}
        getVotingResults={getVotingResults}
        loadAllProposals={loadAllProposals}
        filteringDaos={filteringDaos}
        submitSt={submitSt}
      />

      <ProposalModal
        setTitle={setTitle}
        setDescription={setDescription}
        setVotingThreshold={setVotingThreshold}
        setPassingThreshold={setPassingThreshold}
        setProposalType={setProposalType}
        setTokenAddress={setTokenAddress}
        setStartDate={setStartDate}
        setEndTime={setEndTime}
        setvoteOnce={setvoteOnce}
        addProposal={addProposal}
        isAddOpen={isAddOpen}
        onAddClose={onAddClose}
        submitSt={submitSt}
      />
      <VoteModal
        isVoteOpen={isVoteOpen}
        onVoteClose={onVoteClose}
        proposalForVote={proposalForVote}
        authorizeContract={authorizeContract}
        setUserResponse={setUserResponse}
        userResponse={userResponse}
        submitSt={submitSt}
      />
      <InviteModal
        isStartOpen={isStartOpen}
        onStartClose={onStartClose}
        setInviteAddress={setInviteAddress}
        inviteAddress={inviteAddress}
        inviteMember={inviteMembertoDao}
        submitSt={submitSt}
      />
      <VoteResults
        isEndOpen={isEndOpen}
        onEndClose={onEndClose}
        yesVotes={yesVotes}
        noVotes={noVotes}
        abstainVotes={abstainVotes}
        finalVerdict={finalVerdict}
        submitSt={submitSt}
      />
    </div>
  );
};

export default DaoPage;
