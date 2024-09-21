// @ts-nocheck comment
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Icon,
  Heading,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
  HamburgerIcon,
  CloseIcon,
  AddIcon,
  WarningTwoIcon,
} from "@chakra-ui/icons";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { ethers } from "ethers";
import { Link } from "@chakra-ui/next-js";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const account = useAccount();
  const { data: session, status } = useSession();

  return (
    <>
      <Box bg={useColorModeValue("white", "gray.800")} px={10}>
        <Flex
          h={16}
          alignItems="center"
          justifyContent="space-between"
          mx="auto"
        >
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack
            spacing={8}
            alignItems={"center"}
            fontSize="26px"
            fontWeight="0"
            ml="2"
            color="brand.00"
          >
            <Link href="/" mt={4}>
              {/* <Image
                src="/assets/logo.png"
                alt="Logo"
                width={170}
                height={300}
              /> */}
              DAOTown
            </Link>
          </HStack>
          <Flex alignItems={"center"}>
            <div style={{ display: "flex" }}>
              {account.isConnected && (
                <>
                  <HStack
                    as={"nav"}
                    spacing={4}
                    display={{ base: "none", md: "flex" }}
                    marginRight={4}
                  >
                    <Link href="/onboarding">
                      <Button w="full" variant="ghost">
                        Onboarding
                      </Button>
                    </Link>
                  </HStack>
                  {session?.user && (
                    <>
                      <HStack
                        as={"nav"}
                        spacing={4}
                        display={{ base: "none", md: "flex" }}
                        marginRight={4}
                      >
                        <Link href="/register">
                          <Button w="full" variant="ghost">
                            Register
                          </Button>
                        </Link>
                      </HStack>
                      <HStack
                        as={"nav"}
                        spacing={4}
                        display={{ base: "none", md: "flex" }}
                        marginRight={4}
                      >
                        <Link href="/create-dao">
                          <Button w="full" variant="ghost">
                            Create DAO
                          </Button>
                        </Link>
                      </HStack>
                      <HStack
                        as={"nav"}
                        spacing={4}
                        display={{ base: "none", md: "flex" }}
                        marginRight={4}
                      >
                        <Link href="/explore">
                          <Button w="full" variant="ghost">
                            Explore
                          </Button>
                        </Link>
                      </HStack>

                      <HStack
                        as={"nav"}
                        spacing={4}
                        display={{ base: "none", md: "flex" }}
                        marginRight={4}
                      >
                        <Link href="/profile">
                          <Button w="full" variant="ghost">
                            Profile
                          </Button>
                        </Link>
                      </HStack>
                    </>
                  )}
                </>
              )}

              <HStack>
                <ConnectButton
                  accountStatus={{
                    smallScreen: "avatar",
                    largeScreen: "full",
                  }}
                />
              </HStack>
            </div>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            {account.isConnected && (
              <>
                <Stack as={"nav"} spacing={4}>
                  <Link href="/onboarding">
                    <Button w="full" variant="ghost">
                      Onboarding
                    </Button>
                  </Link>
                </Stack>

                {session?.user && (
                  <>
                    <Stack as={"nav"} spacing={4}>
                      <Link href="/register">
                        <Button w="full" variant="ghost">
                          Register
                        </Button>
                      </Link>
                    </Stack>
                    <Stack as={"nav"} spacing={4}>
                      <Link href="/create-dao">
                        <Button w="full" variant="ghost">
                          Create DAO
                        </Button>
                      </Link>
                    </Stack>
                    <Stack as={"nav"} spacing={4}>
                      <Link href="/explore">
                        <Button w="full" variant="ghost">
                          Explore
                        </Button>
                      </Link>
                    </Stack>

                    <Stack as={"nav"} spacing={4}>
                      <Link href="/profile">
                        <Button w="full" variant="ghost">
                          Profile
                        </Button>
                      </Link>
                    </Stack>
                  </>
                )}
              </>
            )}
          </Box>
        ) : null}
      </Box>
    </>
  );
}
