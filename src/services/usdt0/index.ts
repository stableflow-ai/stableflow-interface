import { zeroPadValue } from "ethers";
import { USDT0_CONFIG, USDT0_DVN_COUNT } from "./config";
import { OFT_ABI } from "./contract";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";
import { getPrice } from "@/utils/format/price";
import axios from "axios";

export const PayInLzToken = false;

const excludeFees: string[] = []; // "estimateGasUsd"

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

    // Dynamically calculate estimated time
    const estimateTime = calculateEstimateTime(originChain, destinationChain);

    const result: any = {
      needApprove: true,
      sendParam: void 0,
      quoteParam: {
        ...params,
        originLayerzeroAddress: originLayerzero.oft,
        destinationLayerzeroAddress: destinationLayerzero.oft,
      },
      fees: {},
      totalFeesUsd: void 0,
      estimateSourceGas: void 0,
      estimateTime, // seconds - dynamically calculated using LayerZero formula
      outputAmount: numberRemoveEndZero(Big(amountWei || 0).div(10 ** params.fromToken.decimals).toFixed(params.fromToken.decimals, 0)),
    };

    const oftContract = wallet.getContract({
      contractAddress: originLayerzero.oft,
      abi: OFT_ABI,
    });

    // 1. check if need approve
    result.needApprove = await oftContract.approvalRequired();
    console.log("%cApprovalRequired: %o", "background:blue;color:white;", result.needApprove);

    // 2. quote send
    const sendParam = {
      dstEid: destinationLayerzero.eid,
      to: zeroPadValue(recipient, 32),
      amountLD: amountWei,
      minAmountLD: 0n,
      extraOptions: "0x0003",
      composeMsg: "0x",
      oftCmd: "0x"
    };

    const oftData = await oftContract.quoteOFT.staticCall(sendParam);
    const [, , oftReceipt] = oftData;
    sendParam.minAmountLD = oftReceipt[1] * (1000000n - BigInt(slippageTolerance * 10000)) / 1000000n;

    const msgFee = await oftContract.quoteSend.staticCall(sendParam, PayInLzToken);

    console.log("%cMsgFee: %o", "background:blue;color:white;", msgFee);

    result.sendParam = {
      contract: oftContract,
      param: [
        sendParam,
        {
          nativeFee: msgFee[0],
          lzTokenFee: msgFee[1],
        },
        recipient,
        { value: msgFee[0] }
      ],
    };

    // 3. estimate gas
    const nativeFeeUsd = Big(msgFee[0]?.toString() || 0).div(10 ** fromToken.nativeToken.decimals).times(getPrice(prices, fromToken.nativeToken.symbol));
    result.fees.nativeFeeUsd = numberRemoveEndZero(Big(nativeFeeUsd).toFixed(20));
    result.fees.lzTokenFeeUsd = numberRemoveEndZero(Big(msgFee[1]?.toString() || 0).div(10 ** fromToken.decimals).toFixed(20));
    try {
      const gasLimit = await oftContract.send.estimateGas(
        sendParam,
        {
          nativeFee: msgFee[0],
          lzTokenFee: msgFee[1],
        },
        recipient,
        { value: msgFee[0] }
      );
      const feeData = await wallet.provider.getFeeData();
      const gasPrice = feeData.maxFeePerGas || feeData.gasPrice || BigInt("20000000000"); // Default 20 gwei
      const estimateGas = BigInt(gasLimit) * BigInt(gasPrice);
      const estimateGasUsd = Big(estimateGas.toString()).div(10 ** fromToken.nativeToken.decimals).times(getPrice(prices, fromToken.nativeToken.symbol));

      result.fees.estimateGasUsd = numberRemoveEndZero(Big(estimateGasUsd).toFixed(20));
      result.estimateSourceGas = estimateGas;
    } catch (error) {
      console.log("usdt0 estimate gas failed: %o", error);
    }

    // calculate total fees
    for (const feeKey in result.fees) {
      if (excludeFees.includes(feeKey)) {
        continue;
      }
      result.totalFeesUsd = Big(result.totalFeesUsd || 0).plus(result.fees[feeKey] || 0);
    }
    result.totalFeesUsd = numberRemoveEndZero(Big(result.totalFeesUsd).toFixed(20));

    return result;
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
