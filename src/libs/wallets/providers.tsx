import React from "react";
import RainbowProvider from "./rainbow/provider";
import SolanaProvider from "./solana/provider";
import NEARProvider from "./near/provider";
import TronProvider from "./tron/provider";

import OKXConnectProvider from "./okxconnect";

export default function WalletsProvider({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <OKXConnectProvider>
      <RainbowProvider>
        <SolanaProvider>
          <NEARProvider>
            <TronProvider>{children}</TronProvider>
          </NEARProvider>
        </SolanaProvider>
      </RainbowProvider>
    </OKXConnectProvider>
  );
}
