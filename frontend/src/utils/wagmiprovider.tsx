// @ts-nocheck comment
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { Chain } from "wagmi/chains";

import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

const airDAO: Chain = {
  id: 22040,
  name: "AirDAO",
  network: "AirDAO Testnet",
  iconUrl:
    "https://5ire.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F844afe5f-3320-4342-8de3-3a3f72b47e5c%2FYqPdVlSA_400x400.jpeg?table=block&id=3b0c51d9-c1e3-46b7-8722-597f68dd6167&spaceId=3b3e9e83-94fd-4ad6-a9a2-f0376069eab0&width=250&userId=&cache=v2",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "AMB",
    symbol: "AMB",
  },
  rpcUrls: {
    default: {
      http: ["https://network.ambrosus-test.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "AirDAO Testnet",
      url: "https://testnet.airdao.io/explorer",
    },
  },
  testnet: true,
};

const { chains, provider } = configureChains(
  [airDAO],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function WagmiConnect(props: any) {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider
          chains={chains}
          theme={darkTheme({
            accentColor: "#1E88E5",
            borderRadius: "large",
            overlayBlur: "small",
          })}
          coolMode
        >
          {props.children}
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}

export default WagmiConnect;
