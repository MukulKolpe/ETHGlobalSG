// @ts-nocheck comment
import React, { useState, useEffect } from "react";
import { Keypair, PrivKey, Message } from "maci-domainobjs";
import { useAccount, useSignMessage } from "wagmi";
import { useRouter } from "next/router";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Radio,
  RadioGroup,
  Stack,
  useToast,
  Box,
  Container,
  Spinner,
  VStack,
  IconButton,
  InputGroup,
  InputRightElement,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { MdEdit } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { LuCross } from "react-icons/lu";
import maciwrapperabi from "../../../utils/abis/maciwrapperabi.json";

enum PollType {
  NOT_SELECTED = 0,
  SINGLE_VOTE = 1,
  MULTIPLE_VOTE = 2,
  WEIGHTED_MULTIPLE_VOTE = 3,
}

enum EMode {
  QV = 0,
  NON_QV = 1,
}

const DaoPage = () => {
  const router = useRouter();
  const { daoId } = router.query;

  const [signatureMessage, setSignatureMessage] = useState("");
  const { signMessageAsync } = useSignMessage({ message: signatureMessage });
  const [keyPair, setKeyPair] = useState(null);
  const [isKpGenerated, setIsKpGenerated] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const [pollAddr, setPollAddr] = useState({
    pollAddr: "",
    pollId: "",
  });

  const [pollData, setPollData] = useState({
    title: "Dummy Title",
    expiry: new Date(),
    pollType: PollType.NOT_SELECTED,
    mode: EMode.QV,
    options: [""],
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [submitState, setSubmitState] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchedPolls, setFetchedPolls] = useState([]);
  const toast = useToast();

  const handleAddOption = () => {
    setPollData({ ...pollData, options: [...pollData.options, ""] });
  };

  const handlePollTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPollData({ ...pollData, pollType: parseInt(e.target.value) });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...pollData.options];
    newOptions[index] = value;
    setPollData({ ...pollData, options: newOptions });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPollData({ ...pollData, title: e.target.value });
  };

  const handleModeChange = (value: string) => {
    setPollData({ ...pollData, mode: value === "0" ? EMode.QV : EMode.NON_QV });
  };

  const handleEditTitleClick = () => {
    setIsEditingTitle(!isEditingTitle);
  };

  const removeOption = (index: number) => {
    const newOptions = [...pollData.options];
    newOptions.splice(index, 1);
    setPollData({ ...pollData, options: newOptions });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newExpiryDate = new Date(e.target.value);
    const duration = Math.round(
      (newExpiryDate.getTime() - new Date().getTime()) / 1000
    );

    if (duration < 60) {
      toast({
        title: "Error",
        description: "Expiry cannot be less than 1 minute from now",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setPollData({ ...pollData, expiry: newExpiryDate });
  };

  const handleSubmit = async () => {
    setSubmitState(true);

    for (const option of pollData.options) {
      if (!option) {
        toast({
          title: "Error",
          description: "Option cannot be blank",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setSubmitState(false);
        return;
      }
    }

    const duration = Math.round(
      (pollData.expiry.getTime() - new Date().getTime()) / 1000
    );
    if (duration < 60) {
      toast({
        title: "Error",
        description: "Expiry cannot be less than 1 minute from now",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setSubmitState(false);
      return;
    }

    if (pollData.pollType === PollType.NOT_SELECTED) {
      toast({
        title: "Error",
        description: "Please select a poll type",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setSubmitState(false);
      return;
    }

    if (!daoId) {
      toast({
        title: "Error",
        description: "DAO ID is missing",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setSubmitState(false);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        "0xec5798703687a08475821DF5C6017980319FEF72",
        maciwrapperabi,
        signer
      );

      const tx = await contract.createPoll(
        pollData.title,
        pollData.options,
        JSON.stringify({ pollType: pollData.pollType }),
        BigInt(duration),
        pollData.mode,
        daoId
      );

      await tx.wait();
      toast({
        title: "Success",
        description: "Poll created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating poll:", error);
      toast({
        title: "Error",
        description: "Failed to create poll",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setIsModalOpen(false);
    setSubmitState(false);
  };

  const generateKeyPair = async () => {
    setIsLoading(true);
    try {
      const signature = await signMessageAsync();
      const userKeyPair = new Keypair(new PrivKey(signature));
      const pubKey = userKeyPair?.pubKey.asContractParam() as {
        x: bigint;
        y: bigint;
      };
      setKeyPair(pubKey);
      setIsKpGenerated(true);
      console.log("Key pair generated:", pubKey);
      toast({
        title: "Success",
        description: "Key pair generated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error generating key pair:", error);
      toast({
        title: "Error",
        description: "Failed to generate key pair",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async () => {
    if (!keyPair) {
      console.error("Key pair not generated");
      toast({
        title: "Error",
        description:
          "Key pair not generated. Please generate a key pair first.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        "0xec5798703687a08475821DF5C6017980319FEF72",
        maciwrapperabi,
        signer
      );

      console.log("Signing up with key pair:", keyPair);

      const tx = await contract.signUp(keyPair, "0x", "0x");
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      setIsSignedIn(true);
      toast({
        title: "Success",
        description: "Signed up successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error signing up:", error);
      toast({
        title: "Error",
        description: "Failed to sign up",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyPolls = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        "0xec5798703687a08475821DF5C6017980319FEF72",
        maciwrapperabi,
        signer
      );

      for (let i = 0; i < 100; i++) {
        const pollId = await contract.daoIdtoPolls(daoId, i);

        if (pollId.error !== undefined) {
          console.log("Poll ID not found");
          break;
        }

        console.log("Poll ID:", pollId);
      }
    } catch (error) {
      console.error("Error fetching my polls:", error);
    }
  };

  const fetchPolls = async () => {
    if (!daoId) {
      console.error("daoId is not available");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        "0xec5798703687a08475821DF5C6017980319FEF72",
        maciwrapperabi,
        signer
      );

      let index = 0;
      let pollsIds = [];
      let shouldContinue = true;

      while (shouldContinue) {
        try {
          const pollId = await contract.daoIdtoPolls(daoId, index);
          pollsIds.push(pollId);
          index++;
        } catch (error) {
          console.error(`Error fetching poll at index ${index}:`, error);
          shouldContinue = false;
        }
      }

      console.log("Polls IDs:", pollsIds);

      for (let i = 0; i < pollsIds.length; i++) {
        try {
          const poll = await contract.fetchPoll(pollsIds[i]);

          // console.log(`Poll ${i}:`, poll);
          setFetchedPolls((prev) => [...prev, poll]);
        } catch (error) {
          console.error(
            `Error fetching details for poll ${pollsIds[i]}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Error fetching polls:", error);
    }
    console.log("Fetched Polls:", fetchedPolls);
  };

  useEffect(() => {
    setSignatureMessage(`Login to ${window.location.origin}`);
    fetchPolls();
  }, []);

  if (!daoId) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      <VStack spacing={4} align="stretch">
        {isLoading && <Spinner />}

        {!isKpGenerated && (
          <Button onClick={generateKeyPair} disabled={isLoading}>
            Generate Key Pair
          </Button>
        )}

        {isKpGenerated && !isSignedIn && (
          <Button onClick={signUp} disabled={isLoading}>
            Sign up
          </Button>
        )}

        <Button
          onClick={() => {
            setIsModalOpen(true);
            fetchPolls();
          }}
          disabled={isLoading}
        >
          Create Poll
        </Button>
        <Button onClick={fetchPolls} mt={4}>
          Get Polls
        </Button>
      </VStack>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>Create a Poll</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Poll Title</FormLabel>
              <Box display="flex" alignItems="center">
                {isEditingTitle ? (
                  <Input
                    value={pollData.title}
                    onChange={handleTitleChange}
                    placeholder="Enter Poll Title"
                  />
                ) : (
                  <Box flex="1">{pollData.title}</Box>
                )}
                <IconButton
                  aria-label={isEditingTitle ? "Save title" : "Edit title"}
                  icon={isEditingTitle ? <RxCross2 /> : <MdEdit />}
                  onClick={handleEditTitleClick}
                  ml={2}
                />
              </Box>
            </FormControl>

            <FormControl mt={4} isRequired>
              <FormLabel>Expiry Date</FormLabel>
              <Input
                type="datetime-local"
                value={pollData.expiry.toISOString().slice(0, 16)}
                onChange={handleDateChange}
              />
            </FormControl>

            <FormControl mt={4} isRequired>
              <FormLabel>Poll Type</FormLabel>
              <Select
                placeholder="Select Poll Type"
                value={pollData.pollType}
                onChange={handlePollTypeChange}
              >
                <option value={PollType.SINGLE_VOTE}>
                  Single Candidate Select
                </option>
                <option value={PollType.MULTIPLE_VOTE}>
                  Multiple Candidate Select
                </option>
                <option value={PollType.WEIGHTED_MULTIPLE_VOTE}>
                  Weighted-Multiple Candidate Select
                </option>
              </Select>
            </FormControl>

            <FormControl mt={4} isRequired>
              <FormLabel>Voting Mode</FormLabel>
              <RadioGroup
                value={pollData.mode.toString()}
                onChange={handleModeChange}
              >
                <Stack direction="row">
                  <Radio value="0">Quadratic Vote</Radio>
                  <Radio value="1">Non Quadratic Vote</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl mt={4} isRequired>
              <FormLabel>Options</FormLabel>
              {pollData.options.map((option, index) => (
                <Box key={index} display="flex" alignItems="center" mt={2}>
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <IconButton
                    aria-label={
                      index === pollData.options.length - 1
                        ? "Add option"
                        : "Remove option"
                    }
                    icon={
                      index === pollData.options.length - 1 ? (
                        <LuCross />
                      ) : (
                        <RxCross2 />
                      )
                    }
                    onClick={() =>
                      index === pollData.options.length - 1
                        ? handleAddOption()
                        : removeOption(index)
                    }
                    ml={2}
                  />
                </Box>
              ))}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSubmit}
              isLoading={submitState}
              loadingText="Creating..."
            >
              Create Poll
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {fetchedPolls.length > 0 && (
        <Box mt={8}>
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            All Polls
          </Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Start Time</Th>
                <Th>End Time</Th>
                <Th>Options</Th>
              </Tr>
            </Thead>
            <Tbody>
              {fetchedPolls.map((poll, index) => (
                <Tr key={index}>
                  <Td>{poll.id?.toString()}</Td>
                  <Td>{poll.name}</Td>
                  <Td>
                    {new Date(
                      poll.startTime?.toNumber() * 1000
                    ).toLocaleString()}
                  </Td>
                  <Td>
                    {new Date(poll.endTime?.toNumber() * 1000).toLocaleString()}
                  </Td>
                  <Td>{poll.options?.join(", ")}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Container>
  );
};

export default DaoPage;
