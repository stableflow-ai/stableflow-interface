import React, { Suspense, lazy } from "react";

const fallbackProvider = (children: React.ReactNode) => <>{children}</>;
const makeLazy = (importFn: () => Promise<any>) =>
  lazy(() => importFn().catch(() => ({ default: ({ children }: { children: React.ReactNode }) => fallbackProvider(children) })));

// @okxconnect/core + @okxconnect/universal-provider moved out of main bundle
const OKXConnectProvider = makeLazy(() => import("./okxconnect"));
const RainbowProvider = makeLazy(() => import("./rainbow/provider"));
const SolanaProvider = makeLazy(() => import("./solana/provider"));
const NEARProvider = makeLazy(() => import("./near/provider"));
const TronProvider = makeLazy(() => import("./tron/provider"));
const AptosProvider = makeLazy(() => import("./aptos/provider"));
const TonProvider = makeLazy(() => import("./ton/provider"));

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

export default function WalletsProvider({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OKXConnectProvider>
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
      </OKXConnectProvider>
    </Suspense>
  );
}
