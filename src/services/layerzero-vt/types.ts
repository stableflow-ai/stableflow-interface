export type VtUserStepType = "TRANSACTION" | "SIGNATURE";

export interface VtEncodedTransaction {
  chainId: number;
  data: string;
  from?: string;
  to: string;
  value?: string;
  gasLimit?: string;
}

export interface VtTransactionUserStep {
  type: "TRANSACTION";
  description: string;
  chainKey: string;
  chainType: "EVM" | "SOLANA" | "STARKNET";
  signerAddress: string;
  transaction: {
    encoded: VtEncodedTransaction;
  };
}

export interface VtSignatureUserStep {
  type: "SIGNATURE";
  description: string;
  chainKey: string;
  signerAddress: string;
  signature: {
    type: "EIP712";
    typedData: {
      primaryType?: string;
      domain: Record<string, unknown>;
      types: Record<string, Array<{ name: string; type: string; }>>;
      message: Record<string, unknown>;
    };
  };
}

export type VtUserStep = VtTransactionUserStep | VtSignatureUserStep;

export interface VtQuote {
  id: string;
  routeSteps: Array<{
    type: string;
    srcChainKey: string;
    description: string;
  }>;
  fees: Array<{
    chainKey: string;
    type: string;
    description: string;
    amount: string;
    address: string;
  }>;
  duration: {
    estimated: string | null;
  };
  feeUsd: string;
  feePercent: string;
  srcAmount: string;
  dstAmount: string;
  dstAmountMin: string;
  srcAmountUsd: string;
  dstAmountUsd: string;
  userSteps: VtUserStep[];
  options?: {
    dstNativeDropAmount: string;
  };
  expiresAt?: string;
}

export interface VtQuotesResponse {
  error: {
    status?: number;
    message?: string;
    issues?: Array<{ message: string; }>;
  } | null;
  quotes: VtQuote[];
  rejectedQuotes: unknown[];
  tokens: Array<{
    chainKey: string;
    address: string;
    decimals: number;
    symbol: string;
    name: string;
    price?: { usd: number; };
  }>;
}

export type VtTransferStatus = "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "UNKNOWN";

export interface VtStatusResponse {
  status: VtTransferStatus;
  explorerUrl?: string;
  executionHistory?: Array<{
    event: string;
    transaction: {
      chainKey: string;
      hash: string;
      timestamp: number;
    };
  }>;
}

export interface VtQuotesRequest {
  srcChainKey: string;
  dstChainKey: string;
  srcTokenAddress: string;
  dstTokenAddress: string;
  srcWalletAddress: string;
  dstWalletAddress: string;
  amount: string;
  options?: {
    amountType?: "EXACT_SRC_AMOUNT";
    feeTolerance?: {
      type: "PERCENT";
      amount: number;
    };
    dstNativeDropAmount?: string;
  };
}
