import React, { Suspense, lazy } from "react";
import OKXConnectProvider from "./okxconnect";

// Dynamic import wallet providers
const RainbowProvider = lazy(() => import("./rainbow/provider"));
const SolanaProvider = lazy(() => import("./solana/provider"));
const NEARProvider = lazy(() => import("./near/provider"));
const TronProvider = lazy(() => import("./tron/provider"));
const AptosProvider = lazy(() => import("./aptos/provider"));

// Loading component
const WalletProviderLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>
    <RainbowProvider>
      <SolanaProvider>
        <NEARProvider>
          <TronProvider>
            <AptosProvider>
              {children}
            </AptosProvider>
          </TronProvider>
        </NEARProvider>
      </SolanaProvider>
    </RainbowProvider>
  </Suspense>
);

export default function WalletsProvider({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <OKXConnectProvider>
      <WalletProviderLoader>
        {children}
      </WalletProviderLoader>
    </OKXConnectProvider>
  );
}
