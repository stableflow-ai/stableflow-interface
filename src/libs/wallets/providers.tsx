import React from "react";
import RainbowProvider from "./rainbow/provider";
import SolanaProvider from "./solana/provider";
import NEARProvider from "./near/provider";

export default function WalletsProvider({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <RainbowProvider>
      <SolanaProvider>
        <NEARProvider>{children}</NEARProvider>
      </SolanaProvider>
    </RainbowProvider>
  );
}
