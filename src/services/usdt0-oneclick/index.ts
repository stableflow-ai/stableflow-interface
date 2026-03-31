import { SendType } from "@/libs/wallets/types";

import oneClickService, { excludeFees as oneClickExcludeFees } from "../oneclick";
import usdt0Service, { excludeFees as usdt0ExcludeFees } from "../usdt0";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";
import { MIDDLE_CHAIN_REFOUND_ADDRESS, MIDDLE_TOKEN_CHAIN } from "./config";
import { ethers } from "ethers";
import RainbowWallet from "@/libs/wallets/rainbow/wallet";
import { csl } from "@/utils/log";
import { ExecTime } from "@/utils/exec-time";

export class Usdt0OneClickService {
  public async quote(params: any) {
    const {
      dry,
      wallets,
      fromToken,
    } = params;

    const execTime = new ExecTime({ type: "Usdt0OneClickService", logStyle: "lime-700" });

    let middleChainWallet = wallets?.evm?.wallet;
    if (!middleChainWallet) {
      const providers = fromToken.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, fromToken.chainId));
      const provider = new ethers.FallbackProvider(providers);
      middleChainWallet = new RainbowWallet(provider, {});
    }

    const usdt0Params = {
      ...params,
      toToken: MIDDLE_TOKEN_CHAIN,
      destinationChain: MIDDLE_TOKEN_CHAIN.chainName,
    };

    execTime.breakpoint();
    const oneClickResult = await oneClickService.quote({
      ...params,
      fromToken: MIDDLE_TOKEN_CHAIN,
      originAsset: MIDDLE_TOKEN_CHAIN.assetId,
      swapType: "FLEX_INPUT",
      isProxy: false,
      refundTo: MIDDLE_CHAIN_REFOUND_ADDRESS,
      wallet: middleChainWallet,
    });
    execTime.log("oneClickService.quote");

    if (oneClickResult.errMsg) {
      return oneClickResult;
    }

    if (!dry) {
      usdt0Params.recipient = oneClickResult.quote.depositAddress;
    } else {
      usdt0Params.recipient = MIDDLE_CHAIN_REFOUND_ADDRESS;
    }

    execTime.breakpoint();
    const usdt0Result = await usdt0Service.quote(usdt0Params);
    execTime.log("usdt0Service.quote");

    csl("Usdt0OneClickService quote", "rose-600", "oneClickResult: %o", oneClickResult);
    csl("Usdt0OneClickService quote", "rose-600", "usdt0Result: %o", usdt0Result);

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

    execTime.logTotal("Usdt0OneClickService.quote");

    return {
      ...usdt0Result,
      fees,
      totalFeesUsd: numberRemoveEndZero(Big(totalFeesUsd).toFixed(20)),
      estimateTime: usdt0Result.estimateTime + oneClickResult.estimateTime,
      outputAmount: oneClickResult.outputAmount,
      priceImpact: oneClickResult.priceImpact,
      exchangeRate: oneClickResult.exchangeRate,
      quoteParam: {
        ...usdt0Result.quoteParam,
        toToken: params.toToken,
        middleToken: MIDDLE_TOKEN_CHAIN,
        recipient: params.recipient,
        depositAddress: oneClickResult.quote.depositAddress,
      },
    };
  }

  public async estimateTransaction(params: any, quoteData: any) {
    const { } = params;

    return usdt0Service.estimateTransaction(params, quoteData);
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
