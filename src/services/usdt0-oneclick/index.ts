import { SendType } from "@/libs/wallets/types";
import { allUsdtChains } from "@/config/tokens";

import oneClickService, { excludeFees as oneClickExcludeFees } from "../oneclick";
import usdt0Service, { excludeFees as usdt0ExcludeFees } from "../usdt0";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";
import { MIDDLE_CHAIN_REFOUND_ADDRESS } from "./config";

export const MIDDLE_TOKEN_CHAIN = allUsdtChains["arb"];

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
      refundTo: MIDDLE_CHAIN_REFOUND_ADDRESS,
    });

    if (!dry) {
      usdt0Params.recipient = oneClickResult.quote.depositAddress;
    }

    const usdt0Result = await usdt0Service.quote(usdt0Params);

    console.log("oneClickResult: %o", oneClickResult);
    console.log("usdt0Result: %o", usdt0Result);

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
      fees,
      totalFeesUsd: numberRemoveEndZero(Big(totalFeesUsd).toFixed(20)),
      estimateTime: usdt0Result.estimateTime + oneClickResult.estimateTime,
      outputAmount: oneClickResult.outputAmount,
      quoteParam: {
        ...usdt0Result.quoteParam,
        toToken: params.toToken,
        middleToken: MIDDLE_TOKEN_CHAIN,
        recipient: params.recipient,
        depositAddress: oneClickResult.quote.depositAddress,
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
    
    // First, get the status of layerzero
    const usdt0Result = await usdt0Service.getStatus(params);

    // Only get the oneclick status if the first step is successful
    if (usdt0Result.status !== "SUCCESS") {
      return usdt0Result;
    }
    
    return oneClickService.getStatus({
      depositAddress: history?.depositAddress,
    });
  }
}

export default new Usdt0OneClickService();
