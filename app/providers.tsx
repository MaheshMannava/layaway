'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  console.warn("WalletConnect Project ID not found. Please add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your .env.local file.");
  // Handle missing ID - throwing an error might be better in production
  // For now, we proceed, but WalletConnect might not work
}

const chainsToUse = [mainnet, sepolia] as const;

const config = getDefaultConfig({
  appName: 'BTC Layaway',
  projectId: projectId || 'FALLBACK_PROJECT_ID',
  chains: chainsToUse,
  ssr: true,
});

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
 