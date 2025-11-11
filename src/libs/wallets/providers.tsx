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

// Loading component with individual Suspense boundaries
const WalletProviderLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>
    <RainbowProvider>
      <Suspense fallback={null}>
        <SolanaProvider>
          <Suspense fallback={null}>
            <NEARProvider>
              <Suspense fallback={null}>
                <TronProvider>
                  <Suspense fallback={null}>
                    <AptosProvider>
                      {children}
                    </AptosProvider>
                  </Suspense>
                </TronProvider>
              </Suspense>
            </NEARProvider>
          </Suspense>
        </SolanaProvider>
      </Suspense>
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
