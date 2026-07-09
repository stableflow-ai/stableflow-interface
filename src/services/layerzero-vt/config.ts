import { LAYERZERO_VT_API_URL } from "@/config/api";

export const VT_API_BASE_URL = LAYERZERO_VT_API_URL;

/**
 * VT API chainKey mapping (chainName -> chainKey).
 * Do NOT reuse LAYERZZERO_CHAINS directly — VT uses different keys in some cases
 * (e.g. Avalanche: "avalanche" here vs "avax" in OFT config).
 */
export const VT_CHAIN_KEY_MAP: Record<string, string> = {
  Ethereum: "ethereum",
  Arbitrum: "arbitrum",
  Avalanche: "avalanche",
  Polygon: "polygon",
  Optimism: "optimism",
  "BNB Chain": "bsc",
  Base: "base",
  Berachain: "berachain",
  Solana: "solana",
  Tron: "tron",
  "X Layer": "xlayer",
  Plasma: "plasma",
  Mantle: "mantle",
  MegaETH: "megaeth",
  Ink: "ink",
  Stable: "stable",
  Celo: "celo",
  Sei: "sei",
  Flare: "flare",
  Fraxtal: "frax",
  Ton: "ton",
  Katana: "katana",
  Gnosis: "gnosis",
};

export const getVtChainKey = (chainName: string): string | undefined => {
  return VT_CHAIN_KEY_MAP[chainName];
};

export const isVtEvmRoute = (fromToken: { chainType?: string; }, toToken: { chainType?: string; }) => {
  return fromToken.chainType === "evm" && toToken.chainType === "evm";
};

// VT quotes API fee labels (https://docs.layerzero.network/v2/developers/value-transfer-api/api-reference/quotes)
export const VT_FEE_LABEL_MAP: Record<string, string> = {
  AoriFeesUsd: "Aori Fees",
  MESSAGEUsd: "Messaging Fee",
  GENERALUsd: "Bridge Fee",
  DST_NATIVE_DROPUsd: "Destination Gas Drop",
  CCTP_RECEIVEUsd: "CCTP Receive Fee",
  StargateUsd: "Stargate Fee",
  bridgeFeeUsd: "Bridge Fee",
};

/*
 * Hybrid route architecture (NOT implemented — design reference only):
 *
 * Route 1 — PYUSD <-> USDT/USDT0/USDC (~50% chain coverage):
 *   Forward:  Pyusd OFT (src -> ethereum) -> VT API (ethereum PYUSD -> dst stable)
 *   Reverse:  VT API (src stable -> ethereum PYUSD) -> Pyusd OFT (ethereum -> dst)
 *   Future services: PyusdLayerzeroVt / LayerzeroVtPyusd (see usdt0-oneclick pattern)
 *
 * Route 2 — PYUSD <-> USDT/USDT0/USDC/EURe (~full coverage via Near Intents):
 *   Forward:  Pyusd OFT -> VT (ethereum PYUSD -> ethereum USDC, recipient = nearintents deposit_address)
 *             -> Near Intents (ethereum USDC -> dst)
 *   Reverse:  Near Intents (src -> ethereum USDC) -> VT (ethereum USDC -> PYUSD)
 *             -> Pyusd OFT (ethereum -> dst)
 *   Future services: PyusdLayerzeroVtOneClick / OneClickLayerzeroVtPyusd
 *
 * Route 3 — PYUSD <-> frxUSD (full coverage via FraxZero):
 *   Forward:  Pyusd OFT -> VT (PYUSD -> USDC) -> mint frxUSD -> FraxZero (ethereum -> dst)
 *   Reverse:  FraxZero (src -> ethereum frxUSD) -> redeem USDC -> VT (USDC -> PYUSD) -> Pyusd OFT
 *   Future services: PyusdLayerzeroVtFraxZero / FraxZeroLayerzeroVtPyusd
 *
 * frxUSD routes are NOT supported by VT API directly.
 */
