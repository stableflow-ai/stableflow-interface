import type { WalletType } from "@/stores/use-wallets";

// Used to call the quota api when the wallet is not connected
export const BridgeDefaultWallets: Record<WalletType, string> = {
  near: "stableflow.near",
  sol: "2bRTgL16xgu6VkSRY7TJcLRuT93T1pLtaYeChhyhfFcX",
  evm: "0x10b06e6A12E86f8C2b55B5073fA3dB39b120C7F5",
  tron: "TG4cfJGzvmpWxYyQKSosCWTacKCxEwSiKw",
  ton: "UQBkIEVrji29SUwHiB47cF25Aivsw133JBdlX7FdoLEbOiDz",
};
