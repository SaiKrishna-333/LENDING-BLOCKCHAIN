"use client";

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WCONNECT_KEY!;

// 2. Set chains (Hardhat Local for development)
const hardhatLocal = {
  chainId: 1337,
  name: "Hardhat Local",
  currency: "ETH",
  explorerUrl: "",
  rpcUrl: "http://127.0.0.1:8545",
};

// 3. Create a metadata object
const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: false,
  defaultChainId: 1337,
});

// 5. Create a AppKit instance
createWeb3Modal({
  ethersConfig,
  chains: [hardhatLocal],
  projectId,
  enableAnalytics: false,
});

export function AppKit({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
