import { usdcChains } from "@/config/tokens/usdc";

export const IRIS_API_URL = "https://iris-api.circle.com/v2";

export const MIDDLE_CHAIN_REFUND_ADDRESS = "0x654E7B96E1DE0b54E53D9ae8082fC2219E66dAC3";
export const MIDDLE_TOKEN_CHAIN = usdcChains["arb"];

export const CCTP_DOMAINS: Record<string, number> = {
  Ethereum: 0,
  Arbitrum: 3,
  Polygon: 7,
  Optimism: 2,
  Avalanche: 1,
  Solana: 5,
  Base: 6,
  Pharos: 31,
};

export const CCTP_PROXY_RELAY_CONTRACT = "0x0da5336C5CEb9d15e7659Ae376CC41d86Edd8802";
