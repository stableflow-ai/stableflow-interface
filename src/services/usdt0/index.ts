import { USDT0_CONFIG, USDT0_DVN_COUNT } from "./config";
import { OFT_ABI } from "./contract";
import axios from "axios";

export const PayInLzToken = false;

const excludeFees: string[] = ["estimateGasUsd"];

/**
 * Calculate USDT0 cross-chain estimated time using LayerZero formula
 * Formula: Total Time ≈ (sourceBlockTime × blockConfirmations) + (destinationBlockTime × (2 blocks + DVN count))
 * 
 * @param originChain Source chain name (e.g., "Ethereum", "Arbitrum")
 * @param destinationChain Destination chain name
 * @returns Estimated time in seconds, returns default value 32 if config is missing
 */
function calculateEstimateTime(originChain: string, destinationChain: string): number {
  const originConfig = USDT0_CONFIG[originChain];
  const destinationConfig = USDT0_CONFIG[destinationChain];

  // Return default value if config is missing
  if (!originConfig || !destinationConfig) {
    console.warn(`Missing config for chains: origin=${originChain}, destination=${destinationChain}, using default 32s`);
    return 32;
  }

  // Validate required configuration fields
  if (
    typeof originConfig.blockTime !== 'number' ||
    typeof originConfig.confirmations !== 'number' ||
    typeof destinationConfig.blockTime !== 'number'
  ) {
    console.warn(`Invalid config for chains: origin=${originChain}, destination=${destinationChain}, using default 32s`);
    return 32;
  }

  const sourceBlockTime = originConfig.blockTime;
  const blockConfirmations = originConfig.confirmations;
  const destinationBlockTime = destinationConfig.blockTime;
  const dvnCount = USDT0_DVN_COUNT;

  // Calculate: source chain part + destination chain part
  const sourceTime = sourceBlockTime * blockConfirmations;
  const destinationTime = destinationBlockTime * (2 + dvnCount);
  const totalTime = Math.ceil(sourceTime + destinationTime);

  console.log(`USDT0 estimate time calculation:`, {
    originChain,
    destinationChain,
    sourceBlockTime,
    blockConfirmations,
    destinationBlockTime,
    dvnCount,
    sourceTime,
    destinationTime,
    totalTime,
  });

  return totalTime;
}

class Usdt0Service {
  public async quote(params: any) {
    const {
      wallet,
      originChain,
      destinationChain,
      amountWei,
      recipient,
      fromToken,
      slippageTolerance,
      prices,
    } = params;

    const originLayerzero = USDT0_CONFIG[originChain];
    const destinationLayerzero = USDT0_CONFIG[destinationChain];

    let originLayerzeroAddress = originLayerzero.oft;
    let destinationLayerzeroAddress = destinationLayerzero.oft;

    // Dynamically calculate estimated time
    const estimateTime = calculateEstimateTime(originChain, destinationChain);

    if (fromToken.chainType === "evm") {
      const result = await wallet.quoteOFT({
        abi: OFT_ABI,
        dstEid: destinationLayerzero.eid,
        recipient,
        amountWei,
        slippageTolerance,
        payInLzToken: PayInLzToken,
        fromToken,
        prices,
        originLayerzeroAddress,
        destinationLayerzeroAddress,
        excludeFees,
      });

      result.estimateTime = estimateTime;

      return result;
    }

    if (fromToken.chainType === "tron") {
      
    }
  }

  public async send(params: any) {
    const {
      contract,
      param,
    } = params;

    const tx = await contract.send(...param);

    const txReceipt = await tx.wait();
    if (txReceipt.status !== 1) {
      throw new Error("Transaction failed");
    }
    return txReceipt.hash;
  }

  public async getStatus(params: any) {
    return axios({
      url: `https://scan.layerzero-api.com/v1/messages/tx/${params.hash}`,
      method: "GET",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json"
      },
    });
  }
}

export default new Usdt0Service();
