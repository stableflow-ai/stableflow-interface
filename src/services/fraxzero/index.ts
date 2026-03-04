import axios from "axios";
import { SendType } from "@/libs/wallets/types";
import { Service } from "@/services/constants";
import { FRAXZERO_CONFIG, FRAXZERO_REQUIRED_DVN_COUNT } from "./config";
import { FRAXZERO_ABI } from "./contract";
import { calculateEstimateTime } from "../utils";
import { OFT_ABI } from "../usdt0/contract";

export const PayInLzToken = false;

export const excludeFees: string[] = ["estimateGasUsd"];

class FraxZeroService {
  public async quote(params: any) {
    const {
      wallet,
      amountWei,
      refundTo,
      recipient,
      fromToken,
      toToken,
      slippageTolerance,
      prices,
    } = params;

    const originLayerzero = FRAXZERO_CONFIG[fromToken.chainName];
    const destinationLayerzero = FRAXZERO_CONFIG[toToken.chainName];

    const isFromEthereumOrFraxtal = fromToken.chainId === 1 || fromToken.chainId === 252;
    const isToEthereumOrFraxtal = toToken.chainId === 1 || toToken.chainId === 252;
    const isFraxtal = fromToken.chainId === 252 || toToken.chainId === 252;

    const estimateTime = calculateEstimateTime({
      requiredDvnCount: FRAXZERO_REQUIRED_DVN_COUNT,
      originConfig: originLayerzero,
      destinationConfig: destinationLayerzero,
    });

    if (isFraxtal) {
      const result = await wallet.quote(Service.Usdt0, {
        ...params,
        abi: OFT_ABI,
        dstEid: destinationLayerzero.eid,
        payInLzToken: PayInLzToken,
        originLayerzeroAddress: isFromEthereumOrFraxtal ? originLayerzero.lockbox : fromToken.contractAddress,
        destinationLayerzeroAddress: isToEthereumOrFraxtal ? destinationLayerzero.lockbox : toToken.contractAddress,
        excludeFees,
        originLayerzero,
        destinationLayerzero,
      });

      result.estimateTime = estimateTime;

      return result;
    }

    const result = await wallet.quote(Service.FraxZero, {
      ...params,
      abi: FRAXZERO_ABI,
      originLayerzero,
      destinationLayerzero,
      excludeFees,
    });

    result.estimateTime = estimateTime;

    return result;
  }

  public async send(params: any) {
    const {
      wallet,
      ...rest
    } = params;

    return wallet.send(SendType.SEND, rest);
  }

  public async getStatus(params: any): Promise<{ status: string; toTxHash?: string }> {
    const { hash, history, fromWallet } = params;
    const result = { status: "PENDING_DEPOSIT" };

    // If it's Tron, get the transaction status first
    if (history?.fromToken?.chainType === "tron" && fromWallet) {
      const response = await fromWallet.getTransactionResult(hash);

      if (!response || !response.receipt || !response.receipt.result) {
        return result;
      }

      if (response.receipt.result !== "SUCCESS") {
        result.status = "FAILED";
        return result;
      }
    }

    try {
      const txhash = history?.fromToken?.chainType === "tron" ? `0x${hash}` : hash;
      const response = await axios({
        url: `https://scan.layerzero-api.com/v1/messages/tx/${txhash}`,
        method: "GET",
        timeout: 30000,
        headers: {
          "Content-Type": "application/json"
        },
      });
      const data = response.data.data[0];
      // INFLIGHT | CONFIRMING | DELIVERED | BLOCKED | FAILED
      const status = data.status.name;
      const toTxHash = data.destination?.tx?.txHash;
      let finalStatus = "PENDING_DEPOSIT";
      if (status === "DELIVERED") {
        finalStatus = "SUCCESS";
      }
      if (status === "FAILED" || status === "BLOCKED") {
        finalStatus = "FAILED";
      }

      return {
        status: finalStatus,
        toTxHash,
      };
    } catch (error) {
      console.error("usdt0 get status failed: %o", error);
      return {
        status: "PENDING_DEPOSIT",
      };
    }
  }
}

export default new FraxZeroService();
