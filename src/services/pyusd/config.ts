import { LAYERZZERO_CHAINS } from "../utils";
import type { OftChainConfig } from "../oft/types";

export const PYUSD_SYMBOL = "PYUSD";
export const PYUSD0_SYMBOL = "PYUSD0";
export const PYUSD_DVN_COUNT = 3;
export const PYUSD_HUB_CHAIN = "Arbitrum";
// Arbitrum MultiHopComposer that forwards a standard OFT SendParam to the final chain.
export const PYUSD_ARBITRUM_MULTI_HOP_COMPOSER = "0xcbB2eE2c5592959F6A3A4a60f3948Ff100c65468";
export const PYUSD_ARBITRUM_HUB_OFT = "0x3CD2b89C49D130C08f1d683225b2e5DeB63ff876";

export interface PyusdChainConfig extends OftChainConfig {
  contractAddress: string;
  oftHubOft?: string;
}

const DEFAULT_LZ_RECEIVE_GAS = 80000;
const DEFAULT_COMPOSE_GAS = 500000;
const ARB_HUB_LZ_RECEIVE_GAS = 350000;
const ARB_HUB_LZ_RECEIVE_VALUE = 2500000;
const ARB_HUB_COMPOSE_GAS = 650000;

export const resolvePyusdMultiHopComposerAddress = (_dstEid: number): string => {
  return PYUSD_ARBITRUM_MULTI_HOP_COMPOSER;
};

export const resolvePyusdMultiHopHopQuote = (_dstEid: number) => {
  return {
    hubLzReceiveOptionGas: ARB_HUB_LZ_RECEIVE_GAS,
    hubLzReceiveOptionValue: ARB_HUB_LZ_RECEIVE_VALUE,
    composeOptionGas: ARB_HUB_COMPOSE_GAS,
    destinationLzReceiveRequired: false,
  };
};

export const PYUSD_LZ_CONFIG: Record<string, PyusdChainConfig> = {
  Ethereum: {
    contractAddress: "0x6c3ea9036406852006290770bedfcaba0e23a0e8",
    oft: "0xa2c323fe5a74adffad2bf3e007e36bb029606444",
    ...LAYERZZERO_CHAINS["Ethereum"],
    confirmations: 15,
    lzReceiveOptionGas: DEFAULT_LZ_RECEIVE_GAS,
    composeOptionGas: DEFAULT_COMPOSE_GAS,
    oftApprovalRequired: false,
  },
  Arbitrum: {
    contractAddress: "0x46850ad61c2b7d64d08c9c754f45254596696984",
    oft: "0xfab5891ed867a1195303251912013b92c4fc3a1d",
    oftMultiHopComposer: PYUSD_ARBITRUM_MULTI_HOP_COMPOSER,
    oftHubOft: PYUSD_ARBITRUM_HUB_OFT,
    ...LAYERZZERO_CHAINS["Arbitrum"],
    confirmations: 40,
    lzReceiveOptionGas: DEFAULT_LZ_RECEIVE_GAS,
    composeOptionGas: DEFAULT_COMPOSE_GAS,
    oftApprovalRequired: false,
  },
  Solana: {
    contractAddress: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    oft: "paxosVkYuJBKUQoZGAidRA47Qt4uidqG5fAt5kmr1nR",
    programId: "paxosVkYuJBKUQoZGAidRA47Qt4uidqG5fAt5kmr1nR",
    escrow: "6JHAfeFjJLrn9enjvBUsmqLSy8B8Wyobr4uXuPVKyjhT",
    oftPDA: "AuVW19qwit2bxZqcspGZLsbq2ZiqosvryTNXE8UZSeGh",
    innerTokenProgramId: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
    addressLookupTable: "AokBxha6VMLLgf97B5VYHEtqztamWmYERBmmFvjuTzJB",
    ...LAYERZZERO_CHAINS["Solana"],
    confirmations: 128,
    lzReceiveOptionGas: 200000,
    composeOptionGas: DEFAULT_COMPOSE_GAS,
    oftApprovalRequired: false,
  },
  Sei: {
    contractAddress: "0x142cdc44890978b506e745bb3bd11607b7f7faef",
    oft: "0x3cd2b89c49d130c08f1d683225b2e5deb63ff876",
    ...LAYERZZERO_CHAINS["Sei"],
    confirmations: 2000,
    lzReceiveOptionGas: DEFAULT_LZ_RECEIVE_GAS,
    composeOptionGas: DEFAULT_COMPOSE_GAS,
    oftApprovalRequired: false,
  },
  Avalanche: {
    contractAddress: "0x142cdc44890978B506e745bB3Bd11607B7f7faEf",
    oft: "0x3cd2b89c49d130c08f1d683225b2e5deb63ff876",
    ...LAYERZZERO_CHAINS["Avalanche"],
    confirmations: 12,
    lzReceiveOptionGas: DEFAULT_LZ_RECEIVE_GAS,
    composeOptionGas: DEFAULT_COMPOSE_GAS,
    oftApprovalRequired: false,
  },
  Optimism: {
    contractAddress: "0xA0C9b923f4551f1EC1A49665943160B18704Ce06",
    oft: "0x4edc2460b0891955e2d11ee3103cd705a6d6288a",
    ...LAYERZZERO_CHAINS["Optimism"],
    confirmations: 20,
    lzReceiveOptionGas: DEFAULT_LZ_RECEIVE_GAS,
    composeOptionGas: DEFAULT_COMPOSE_GAS,
    oftApprovalRequired: false,
  },
  Polygon: {
    contractAddress: "0x99aF3EeA856556646C98c8B9b2548Fe815240750",
    oft: "0x26d27d5af2f6f1c14f40013c8619d97aaf015509",
    ...LAYERZZERO_CHAINS["Polygon"],
    confirmations: 512,
    lzReceiveOptionGas: DEFAULT_LZ_RECEIVE_GAS,
    composeOptionGas: DEFAULT_COMPOSE_GAS,
    oftApprovalRequired: false,
  },
  Fraxtal: {
    contractAddress: "0x99aF3EeA856556646C98c8B9b2548Fe815240750",
    oft: "0x26d27d5af2f6f1c14f40013c8619d97aaf015509",
    ...LAYERZZERO_CHAINS["Fraxtal"],
    confirmations: 5,
    lzReceiveOptionGas: DEFAULT_LZ_RECEIVE_GAS,
    composeOptionGas: DEFAULT_COMPOSE_GAS,
    oftApprovalRequired: false,
  },
  Tron: {
    contractAddress: "TKkvjWuAYrNQkbo3onBDhCU77WtNPByD5a",
    oft: "TA652PxzLaESnb4nx7dwvk9Yq94BgYVSkd",
    ...LAYERZZERO_CHAINS["Tron"],
    confirmations: 5,
    lzReceiveOptionGas: 300000,
    composeOptionGas: DEFAULT_COMPOSE_GAS,
    oftApprovalRequired: false,
  },
};

export const PYUSD_HUB_CONFIG = PYUSD_LZ_CONFIG[PYUSD_HUB_CHAIN];

export const isPyusdNativeToken = (token?: { symbol?: string }) => token?.symbol === PYUSD_SYMBOL;

export const isPyusd0Token = (token?: { symbol?: string }) => token?.symbol === PYUSD0_SYMBOL;

export const isPyusdMeshToken = (token?: { symbol?: string }) => {
  return isPyusdNativeToken(token) || isPyusd0Token(token);
};

export const isPyusdHubOriginComposerRoute = (fromToken: any, toToken: any) => {
  return (
    fromToken.chainName === PYUSD_HUB_CHAIN
    && isPyusdNativeToken(fromToken)
    && isPyusd0Token(toToken)
  );
};

export const isPyusdMultiHopRoute = (fromToken: any, toToken: any) => {
  if (!isPyusdMeshToken(fromToken) || !isPyusdMeshToken(toToken)) {
    return false;
  }

  if (
    (fromToken.chainName === "Solana" && isPyusd0Token(toToken))
    || (isPyusd0Token(fromToken) && toToken.chainName === "Solana")
  ) {
    return false;
  }

  if (isPyusdHubOriginComposerRoute(fromToken, toToken)) {
    return false;
  }

  // Destination is the Arbitrum bridge hub: the mesh delivers directly (native mesh, or the
  // PYUSD0 adapter releases native PYUSD on Arbitrum). No composer / second hop is needed.
  if (toToken.chainName === PYUSD_HUB_CHAIN) {
    return false;
  }

  // Native PYUSD <-> PYUSD0 routes use Arbitrum MultiHopComposer (Solana excluded above).
  if (
    (isPyusdNativeToken(fromToken) && isPyusd0Token(toToken))
    || (isPyusd0Token(fromToken) && isPyusdNativeToken(toToken))
  ) {
    return true;
  }

  return false;
};

/** Native PYUSD mesh chains, reachable from the Arbitrum hub only via the native Arb OFT. */
const PYUSD_NATIVE_MESH_CHAIN_KEYS = new Set<string>(["ethereum", "solana"]);

export const resolvePyusdHubQuoteOftAddress = (
  hubConfig: OftChainConfig,
  destinationConfig?: OftChainConfig,
): string | undefined => {
  // Native PYUSD mesh destinations (eth/sol) are only peered to the native Arb OFT, not the
  // PYUSD0 hub adapter. PYUSD0 destinations continue to use the PYUSD0 hub adapter.
  if (destinationConfig && PYUSD_NATIVE_MESH_CHAIN_KEYS.has(destinationConfig.chainKey)) {
    return hubConfig.oft;
  }
  return (hubConfig as PyusdChainConfig).oftHubOft || hubConfig.oftMultiHopComposer || hubConfig.oft;
};

const isPyusdArbSolRoute = (fromToken: any, toToken: any) => {
  return (
    isPyusdNativeToken(fromToken)
    && isPyusdNativeToken(toToken)
    && (
      (fromToken.chainName === "Arbitrum" && toToken.chainName === "Solana")
      || (fromToken.chainName === "Solana" && toToken.chainName === "Arbitrum")
    )
  );
};

export const getPyusdRouteBlockReason = (fromToken: any, toToken: any): string | null => {
  if (
    (fromToken.chainName === "Solana" && isPyusd0Token(toToken))
    || (isPyusd0Token(fromToken) && toToken.chainName === "Solana")
  ) {
    return "No routes found";
  }

  if (isPyusdArbSolRoute(fromToken, toToken)) {
    return "No routes found";
  }

  return null;
};

export const isPyusdRouteBlocked = (fromToken: any, toToken: any) => {
  return getPyusdRouteBlockReason(fromToken, toToken) !== null;
};

/*
 * Hybrid route architecture (NOT implemented — design reference only):
 *
 * Route 1 — PYUSD <-> USDT/USDT0/USDC (~50% chain coverage):
 *   Forward:  Pyusd OFT (src -> ethereum) -> VT API (ethereum PYUSD -> dst stable)
 *   Reverse:  VT API (src stable -> ethereum PYUSD) -> Pyusd OFT (ethereum -> dst)
 *
 * Route 2 — PYUSD <-> USDT/USDT0/USDC/EURe (~full coverage via Near Intents):
 *   Forward:  Pyusd OFT -> VT (ethereum PYUSD -> ethereum USDC, recipient = nearintents deposit_address)
 *             -> Near Intents (ethereum USDC -> dst)
 *   Reverse:  Near Intents (src -> ethereum USDC) -> VT (ethereum USDC -> PYUSD)
 *             -> Pyusd OFT (ethereum -> dst)
 *
 * Route 3 — PYUSD <-> frxUSD (full coverage via FraxZero):
 *   Forward:  Pyusd OFT -> VT (PYUSD -> USDC) -> mint frxUSD -> FraxZero (ethereum -> dst)
 *   Reverse:  FraxZero (src -> ethereum frxUSD) -> redeem USDC -> VT (USDC -> PYUSD) -> Pyusd OFT
 *
 * See also: src/services/layerzero-vt/config.ts for VT-side hybrid route notes.
 */
