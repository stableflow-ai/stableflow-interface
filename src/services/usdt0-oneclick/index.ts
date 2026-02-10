import axios from "axios";
import { SendType } from "@/libs/wallets/types";
import { usdtChains } from "@/config/tokens/usdt";

import oneClickService, { excludeFees as oneClickExcludeFees } from "../oneclick";
import usdt0Service, { excludeFees as usdt0ExcludeFees } from "../usdt0";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";

export const MIDDLE_TOKEN_CHAIN = usdtChains["arb"];

class Usdt0OneClickService {
  public async quote(params: any) {
    const {
      dry,
    } = params;

    const usdt0Params = {
      ...params,
      toToken: MIDDLE_TOKEN_CHAIN,
      destinationChain: MIDDLE_TOKEN_CHAIN.chainName,
    };

    const oneClickResult = await oneClickService.quote({
      ...params,
      fromToken: MIDDLE_TOKEN_CHAIN,
      originAsset: MIDDLE_TOKEN_CHAIN.assetId,
      swapType: "FLEX_INPUT",
      isProxy: false,
    });

    if (!dry) {
      usdt0Params.recipient = oneClickResult.quote.depositAddress;
    }

    const usdt0Result = await usdt0Service.quote(usdt0Params);

    let totalFeesUsd = Big(0);
    const fees = {
      ...usdt0Result.fees,
    };
    for (const feeKey in oneClickResult.fees) {
      if (oneClickExcludeFees.includes(feeKey)) {
        continue;
      }
      fees[feeKey] = oneClickResult.fees[feeKey];
    }
    for (const feeKey in fees) {
      if (usdt0ExcludeFees.includes(feeKey)) {
        continue;
      }
      totalFeesUsd = Big(totalFeesUsd || 0).plus(fees[feeKey] || 0);
    }

    return {
      ...usdt0Result,
      totalFeesUsd: numberRemoveEndZero(Big(totalFeesUsd).toFixed(20)),
      estimateTime: usdt0Result.estimateTime + oneClickResult.estimateTime,
      outputAmount: oneClickResult.outputAmount,
      quoteParam: {
        ...usdt0Result.quoteParam,
        toToken: params.toToken,
        middleToken: MIDDLE_TOKEN_CHAIN,
      },
    };
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

export default new Usdt0OneClickService();
