import { createDAppKit } from "@mysten/dapp-kit-react";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { getChainRpcUrl } from "@/config/chains";

export const suiDAppKit = createDAppKit({
  networks: ["mainnet"],
  defaultNetwork: "mainnet",
  createClient: (network) =>
    new SuiGrpcClient({
      network,
      baseUrl: getChainRpcUrl("Sui").rpcUrl ?? getJsonRpcFullnodeUrl("mainnet"),
    }),
  autoConnect: true,
  enableBurnerWallet: false,
  walletInitializers: [],
  slushWalletConfig: null,
  storage: typeof window !== "undefined" ? localStorage : undefined,
  storageKey: "stableflow.ai_sui_dapp_kit",
});

declare module "@mysten/dapp-kit-react" {
  interface Register {
    dAppKit: typeof suiDAppKit;
  }
}
