// @ts-nocheck comment
import React, { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Box,
  Button,
  VStack,
  Text,
  Avatar,
  Flex,
  Spinner,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import { useRouter } from "next/router";

const OnBoarding = () => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const [firstButtonState, setFirstButtonState] = useState("initial");
  const [secondButtonState, setSecondButtonState] = useState("initial");
  const router = useRouter();

  const textColor = useColorModeValue("gray.800", "white");

  const handleSignIn = (buttonSetter) => {
    buttonSetter("signing-in");
    signIn()
      .then(() => buttonSetter("connected"))
      .catch(() => buttonSetter("initial"));
  };

  const renderSignInButton = (buttonState, buttonSetter) => {
    switch (buttonState) {
      case "signing-in":
        return <Spinner size="sm" />;
      case "connected":
        return <Text color="green.500">Connected</Text>;
      default:
        return (
          <>
            <Button
              colorScheme="blue"
              onClick={() => handleSignIn(buttonSetter)}
            >
              Get Started!
            </Button>
            <Text color={textColor} fontSize="lg">
              Connect your World ID and Discord!
            </Text>
          </>
        );
    }
  };

  return (
    <Flex
      minHeight="100vh"
      direction={{ base: "column", md: "row" }}
      alignItems="center"
      justifyContent="center"
      p={{ base: 4, md: 8 }}
    >
      <Flex
        width={{ base: "100%", md: "80%" }}
        maxWidth="1200px"
        direction={{ base: "column", md: "row" }}
        alignItems="center"
        justifyContent="space-between"
      >
        <Box width={{ base: "100%", md: "100%" }} mb={{ base: 8, md: 0 }}>
          <Image
            src="/assets/imageBg.png"
            alt="Background"
            objectFit="cover"
            width="100%"
            height="auto"
          />
        </Box>
        <VStack spacing={6} align="center" width={{ base: "100%", md: "40%" }}>
          {!session && (
            <>{renderSignInButton(firstButtonState, setFirstButtonState)}</>
          )}
          {session?.user && (
            <Flex direction="column" align="start">
              <Text color={textColor} fontSize="sm">
                Signed in as -
              </Text>
              <Text color={textColor} fontWeight="bold" fontSize="md">
                {session.user.email ?? session.user.name}
              </Text>
              <Button
                mt={4}
                colorScheme="red"
                onClick={async () => {
                  signIn("discord", {
                    callbackUrl: `${window.location.origin}/register`,
                  });
                }}
              >
                Connect Discord
              </Button>
              <Button
                mt={4}
                colorScheme="red"
                onClick={() => {
                  signOut();
                }}
              >
                Disconnect
              </Button>
            </Flex>
          )}
        </VStack>
      </Flex>
    </Flex>
  );
};

export default OnBoarding;
