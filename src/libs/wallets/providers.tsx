import React, { Suspense, lazy } from "react";
import OKXConnectProvider from "./okxconnect";

// Dynamic import wallet providers with error handling
const RainbowProvider = lazy(() =>
  import("./rainbow/provider").catch(() => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>
  }))
);
const SolanaProvider = lazy(() =>
  import("./solana/provider").catch(() => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>
  }))
);
const NEARProvider = lazy(() =>
  import("./near/provider").catch(() => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>
  }))
);
const TronProvider = lazy(() =>
  import("./tron/provider").catch(() => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>
  }))
);
const AptosProvider = lazy(() =>
  import("./aptos/provider").catch(() => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>
  }))
);
const TonProvider = lazy(() =>
  import("./ton/provider").catch(() => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>
  }))
);

const LoadingSpinner = () => {
  return (
    <div className="w-full h-dvh flex justify-center items-center">
      <img
        src="https://assets.dapdap.net/stableflow/logos/logo-stableflow.svg"
        alt="Loading"
        className="w-30 h-30 object-center object-contain animate-pulse"
      />
    </div>
  );
};

// Loading component with individual Suspense boundaries
const WalletProviderLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <RainbowProvider>
      <SolanaProvider>
        <NEARProvider>
          <TronProvider>
            <AptosProvider>
              <TonProvider>
                {children}
              </TonProvider>
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
