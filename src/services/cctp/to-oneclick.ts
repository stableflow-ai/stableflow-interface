import { SendType } from "@/libs/wallets/types";

import oneClickService, { excludeFees as oneClickExcludeFees } from "../oneclick";
import cctpService from "./index";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";
import { MIDDLE_CHAIN_REFUND_ADDRESS, MIDDLE_TOKEN_CHAIN } from "./config";
import RainbowWallet from "@/libs/wallets/rainbow/wallet";
import { csl } from "@/utils/log";
import { ExecTime } from "@/utils/exec-time";
import { getRouteStatus, Service } from "../constants";
import { evmRpcFallbackProvider } from "@/utils/evm-rpc-providers";

export const excludeFees: string[] = ["estimateGasUsd"];

export class CCTPOneClickService {
  public async quote(params: any) {
    const {
      dry,
      wallets,
      fromToken,
      toToken,
    } = params;

    const execTime = new ExecTime({ type: "CCTPOneClickService", logStyle: "lime-700" });

    let middleChainWallet = wallets?.evm?.wallet;
    const refundTo = wallets?.evm?.account || MIDDLE_CHAIN_REFUND_ADDRESS;
    if (!middleChainWallet) {
      const provider = evmRpcFallbackProvider(fromToken);
      middleChainWallet = new RainbowWallet(provider, {});
    }

    const cctpParams = {
      ...params,
      toToken: MIDDLE_TOKEN_CHAIN,
      destinationChain: MIDDLE_TOKEN_CHAIN.chainName,
      recipient: refundTo,
      refundTo,
    };
    const oneClickParams = {
      ...params,
      fromToken: MIDDLE_TOKEN_CHAIN,
      originAsset: MIDDLE_TOKEN_CHAIN.assetId,
      swapType: "FLEX_INPUT",
      isProxy: false,
      refundTo,
      wallet: middleChainWallet,
    };

    let cctpResult: any;
    let oneClickResult: any;

    if (!dry) {
      // Confirm flow: get depositAddress first, then CCTP quote with mintRecipient
      execTime.breakpoint();
      oneClickResult = await oneClickService.quote({
        ...oneClickParams,
        amountWei: Big(0.01).times(10 ** MIDDLE_TOKEN_CHAIN.decimals).toFixed(0, 0),
      });
      execTime.log("oneClickService.quote confirm: %o", oneClickResult);

      if (oneClickResult.errMsg) {
        return oneClickResult;
      }

      cctpParams.recipient = oneClickResult.quote.depositAddress;
      execTime.breakpoint();
      cctpResult = await cctpService.quote(cctpParams);
      execTime.log("cctpService.quote confirm: %o", cctpResult);

      execTime.breakpoint();
      // Get the actual output amount
      // For reporting backend
      try {
        const oneClickResult2 = await oneClickService.quote({
          ...oneClickParams,
          dry: true,
          amountWei: Big(cctpResult.outputAmount || 0).times(10 ** MIDDLE_TOKEN_CHAIN.decimals).toFixed(0, 0),
        });
        oneClickResult.fees = oneClickResult2.fees;
        oneClickResult.outputAmount = oneClickResult2.outputAmount;
        oneClickResult.estimateTime = oneClickResult2.estimateTime;
        oneClickResult.priceImpact = oneClickResult2.priceImpact;
        oneClickResult.exchangeRate = oneClickResult2.exchangeRate;
        execTime.log("cctpService.quote", "confirm get actual output amount result: %o", oneClickResult2);
      } catch (err) {
        execTime.log("cctpService.quote", "confirm get actual output amount error: %o", err);
      }
    } else {
      // Dry quote: CCTP first, then OneClick FLEX_INPUT
      execTime.breakpoint();
      cctpResult = await cctpService.quote(cctpParams);
      execTime.log("cctpService.quote: %o", cctpResult);

      if (cctpResult.errMsg) {
        return cctpResult;
      }

      oneClickParams.amountWei = Big(cctpResult.outputAmount || 0).times(10 ** MIDDLE_TOKEN_CHAIN.decimals).toFixed(0, 0);
      execTime.breakpoint();
      oneClickResult = await oneClickService.quote(oneClickParams);
      execTime.log("oneClickService.quote: %o", oneClickResult);
    }

    if (oneClickResult.errMsg) {
      return oneClickResult;
    }

    if (cctpResult.errMsg) {
      return cctpResult;
    }

    csl("CCTPOneClickService quote", "rose-600", "oneClickResult: %o", oneClickResult);
    csl("CCTPOneClickService quote", "rose-600", "cctpResult: %o", cctpResult);

    let totalFeesUsd = Big(0);
    const fees = {
      ...cctpResult.fees,
    };
    for (const feeKey in oneClickResult.fees) {
      if (oneClickExcludeFees.includes(feeKey)) {
        continue;
      }
      fees[feeKey] = oneClickResult.fees[feeKey];
    }
    for (const feeKey in fees) {
      if (excludeFees.includes(feeKey)) {
        continue;
      }
      totalFeesUsd = Big(totalFeesUsd || 0).plus(fees[feeKey] || 0);
    }

    execTime.logTotal("CCTPOneClickService.quote");

    const routeStatus = getRouteStatus(Service.CCTPOneClick);

    return {
      ...cctpResult,
      fees,
      totalFeesUsd: numberRemoveEndZero(Big(totalFeesUsd).toFixed(20)),
      estimateTime: cctpResult.estimateTime + oneClickResult.estimateTime,
      outputAmount: oneClickResult.outputAmount,
      priceImpact: oneClickResult.priceImpact,
      exchangeRate: oneClickResult.exchangeRate,
      quoteParam: {
        ...cctpResult.quoteParam,
        toToken: params.toToken,
        middleToken: MIDDLE_TOKEN_CHAIN,
        recipient: params.recipient,
        depositAddress: oneClickResult.quote.depositAddress,
      },
      routeDisabled: routeStatus.disabled,
      sourceQuoteParams: params,
    };
  }

  public async estimateTransaction(params: any, quoteData: any) {
    return cctpService.estimateTransaction(params, quoteData);
  }

  public async send(params: any) {
    const {
      wallet,
      ...rest
    } = params;

    return wallet.send(SendType.SEND, rest);
  }

  public async getStatus(params: any): Promise<{ status: string; toTxHash?: string }> {
    const { history } = params;

    const cctpResult = await cctpService.getStatus(params);

    if (cctpResult.status !== "SUCCESS") {
      return cctpResult;
    }

    return oneClickService.getStatus({
      depositAddress: history?.depositAddress,
    });
  }
}

export default new CCTPOneClickService();
