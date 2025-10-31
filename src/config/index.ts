import type { WalletType } from "@/stores/use-wallets";

// Used to call the quota api when the wallet is not connected
export const BridgeDefaultWallets: Record<WalletType, string> = {
  near: "stableflow.near",
  sol: "2bRTgL16xgu6VkSRY7TJcLRuT93T1pLtaYeChhyhfFcX",
  evm: "0x10b06e6A12E86f8C2b55B5073fA3dB39b120C7F5",
  tron: "TG4cfJGzvmpWxYyQKSosCWTacKCxEwSiKw",
  aptos: "0x93493b07d031c4f18ad1e874575761be7e47d4cea5c81d538600e8ec72d6ab1c",
};

// Scan-to-Pay source wallet chain (the chain from which users scan the QR code)
export const SCAN_PAY_SOURCE_CHAIN: WalletType = "tron";
