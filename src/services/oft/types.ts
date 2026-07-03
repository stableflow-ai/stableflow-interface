import type { LayerZeroChainConfig } from "../utils/layerzero";

export interface OftChainConfig extends LayerZeroChainConfig {
  contractAddress?: string;
  oft?: string;
  oftLegacy?: string;
  oftAdapter?: string;
  oftMultiHopComposer?: string;
  oftTetherTokenOFTExtension?: string;
  confirmations: number;
  lzReceiveOptionGas?: number;
  lzReceiveOptionGasLegacy?: number;
  composeOptionGas?: number;
  oftApprovalRequired?: boolean;
  oftLegacyApprovalRequired?: boolean;
  programId?: string;
  mint?: string;
  escrow?: string;
  oftPDA?: string;
  innerTokenProgramId?: string;
  addressLookupTable?: string;
}

export interface OftHopQuoteParams {
  sendParam: any;
  hubConfig: OftChainConfig;
  hubChain: import("@/config/chains").TokenChain;
  destinationConfig?: OftChainConfig;
  resolveHubQuoteOftAddress?: (
    hubConfig: OftChainConfig,
    destinationConfig?: OftChainConfig,
  ) => string | undefined;
  /** When set, use this value for compose executor option instead of hopMsgFee */
  composeOptionValue?: bigint;
  /** First-hop compose executor gas limit on the hub chain */
  composeOptionGas?: number;
  hubLzReceiveOptionGas?: number;
  hubLzReceiveOptionValue?: number;
  /** Always attach destination lzReceive options in the second-hop compose payload */
  destinationLzReceiveRequired?: boolean;
  destinationLzReceiveOptionGas?: number;
  destinationLzReceiveOptionValue?: number;
}
