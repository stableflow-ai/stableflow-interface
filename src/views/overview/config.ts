import { getStableflowTokenLogo } from "@/utils/format/logo";

export const tokens = [
  { symbol: "USDT", icon: getStableflowTokenLogo("USDT"), available: true },
  { symbol: "USDC", icon: getStableflowTokenLogo("USDC"), available: true },
  { symbol: "frxUSD", icon: getStableflowTokenLogo("frxUSD"), available: true },
  { symbol: "USD1", icon: getStableflowTokenLogo("USD1"), available: false },
];
