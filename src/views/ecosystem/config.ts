import type chains from "@/config/chains";
import { Service } from "@/services/constants";

type ChainKey = keyof typeof chains;

export const ECOSYSTEM_STABLECOINS = [
  {
    symbol: "USDT",
    tokenLogo: "USDT",
    gradient: "radial-gradient(44.36% 43.69% at 50% 0%, rgba(41,252,189,0.2) 0%, rgba(255,255,255,0.2) 100%)",
  },
  {
    symbol: "USDC",
    tokenLogo: "USDC",
    gradient: "radial-gradient(44.36% 43.69% at 50% 0%, rgba(106,177,255,0.2) 0%, rgba(255,255,255,0.2) 100%)",
  },
  {
    symbol: "USDT0",
    tokenLogo: "USDT0",
    gradient: "radial-gradient(44.36% 43.69% at 50% 0%, rgba(41,252,122,0.2) 0%, rgba(255,255,255,0.2) 100%)",
  },
  {
    symbol: "frxUSD",
    tokenLogo: "frxUSD",
    gradient: "radial-gradient(44.36% 43.69% at 50% 0%, rgba(180,180,184,0.2) 0%, rgba(255,255,255,0.2) 100%)",
  },
] as const;

export const ECOSYSTEM_NETWORK_ORDER: ChainKey[] = [
  "eth",
  "arb",
  "avax",
  "bsc",
  "op",
  "base",
  "pol",
  "xlayer",
  "bera",
  "plasma",
  "mantle",
  "megaeth",
  "ink",
  "stable",
  "celo",
  "sei",
  "flare",
  "frax",
  "sol",
  "near",
  "tron",
  "aptos",
  "ton",
];

export const ECOSYSTEM_RAILS: Service[] = [
  Service.OneClick,
  Service.Usdt0,
  Service.CCTP,
  Service.Native,
  Service.FraxZero,
];
