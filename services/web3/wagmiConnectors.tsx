import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
// import { rainbowkitBurnerWallet } from "burner-connector"; // Keep this removed or commented out
import * as chains from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";

// const { onlyLocalBurnerWallet, targetNetworks } = scaffoldConfig; // Commenting out unused vars for now

// Simplified wallets array - Removed the conditional burner wallet logic
const wallets = [
  metaMaskWallet,
  walletConnectWallet,
  ledgerWallet,
  coinbaseWallet,
  rainbowWallet,
  safeWallet,
  // Removed conditional spread for burner wallet
];

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets(
  [
    {
      groupName: "Supported Wallets",
      wallets, // Use the simplified wallets array
    },
  ],
  {
    appName: "scaffold-eth-2", // Consider updating appName if needed
    projectId: scaffoldConfig.walletConnectProjectId,
  },
);
