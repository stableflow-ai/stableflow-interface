import oneClickService, { excludeFees as oneClickExcludeFees } from "../oneclick";
import cctpService from "./index";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";
import { CCTP_PROXY_RELAY_CONTRACT, MIDDLE_TOKEN_CHAIN } from "./config";
import { MIDDLE_CHAIN_REFUND_ADDRESS } from "../utils";
import RainbowWallet from "@/libs/wallets/rainbow/wallet";
import { getPrice } from "@/utils/format/price";
import { ExecTime } from "@/utils/exec-time";
import { getRouteStatus, OneClickSwapType, Service } from "../constants";
import { evmRpcFallbackProvider } from "@/utils/evm-rpc-providers";
import { isStableToken } from "@/config/tokens";

export class OneClickCCTPService {
  public async quote(params: any) {
    const {
      wallets,
      fromToken,
      prices,
    } = params;

    const execTime = new ExecTime({ type: "OneClickCCTP", logStyle: "lime-500" });

    let middleChainWallet = wallets?.evm?.wallet;
    let destinationRecipientAddress = wallets?.evm?.account;
    if (!middleChainWallet) {
      const provider = evmRpcFallbackProvider(fromToken);
      middleChainWallet = new RainbowWallet(provider, {});
    }
    if (!destinationRecipientAddress) {
      destinationRecipientAddress = MIDDLE_CHAIN_REFUND_ADDRESS;
    }

    let secondStepAmountWei = Big(params.amountWei || 0).div(10 ** fromToken.decimals).times(10 ** MIDDLE_TOKEN_CHAIN.decimals).toFixed(0);
    if (!isStableToken(fromToken)) {
      const inputPrice = getPrice(prices, fromToken.symbol);
      const inputValue = Big(params.amountWei || 0).div(10 ** fromToken.decimals).times(inputPrice);
      secondStepAmountWei = Big(inputValue).times(10 ** MIDDLE_TOKEN_CHAIN.decimals).toFixed(0);
    }

    const cctpParams = {
      ...params,
      amountWei: secondStepAmountWei,
      fromToken: MIDDLE_TOKEN_CHAIN,
      originChain: MIDDLE_TOKEN_CHAIN.chainName,
      refundTo: MIDDLE_CHAIN_REFUND_ADDRESS,
      wallet: middleChainWallet,
    };

    execTime.breakpoint();
    const cctpResult = await cctpService.quote(cctpParams);
    execTime.log("cctpService.quote");

    const cctpFeeBuffer = 1.2;
    const cctpMintFeeUsd = numberRemoveEndZero(Big(cctpResult.fees?.estimateMintGasUsd || 0).times(1 + cctpFeeBuffer).toFixed(20));
    const cctpBridgeFeeUsd = numberRemoveEndZero(Big(cctpResult.fees?.bridgeFeeUsd || 0).times(1 + cctpFeeBuffer).toFixed(20));
    const cctpTotalFeeUsd = Big(cctpMintFeeUsd || 0).plus(cctpBridgeFeeUsd || 0).toFixed(20);

    if (cctpResult.errMsg) {
      return cctpResult;
    }

    const cctpFeeAmountInFromToken = Big(cctpTotalFeeUsd || 0)
      .div(getPrice(prices, fromToken.symbol) || 1)
      .toFixed(fromToken.decimals);
    const fromTokenAmount = Big(params.amountWei).div(10 ** fromToken.decimals).toFixed(fromToken.decimals);
    const oneClickFeeRatio = Big(cctpFeeAmountInFromToken || 0)
      .div(Big(cctpFeeAmountInFromToken || 0).plus(fromTokenAmount))
      .times(10000)
      .toFixed(0, Big.roundUp);

    if (Big(oneClickFeeRatio).gt(10000)) {
      return { errMsg: `Amount is too low, at least ${cctpFeeAmountInFromToken}` };
    }

    execTime.breakpoint();

    const oneClickResult = await oneClickService.quote({
      ...params,
      amountWei: secondStepAmountWei,
      toToken: MIDDLE_TOKEN_CHAIN,
      destinationAsset: MIDDLE_TOKEN_CHAIN.assetId,
      swapType: OneClickSwapType.Output,
      isProxy: true,
      recipient: destinationRecipientAddress,
      appFees: [
        {
          recipient: "reffer.near",
          fee: +oneClickFeeRatio,
        },
      ],
    });
    execTime.log("oneClickService.quote");

    let totalFeesUsd = Big(0);
    let _destinationGasFeeUsd = Big(oneClickResult.fees?.destinationGasFeeUsd || 0).minus(cctpTotalFeeUsd);
    if (Big(_destinationGasFeeUsd).lt(0)) {
      _destinationGasFeeUsd = Big(0);
    }
    const fees = {
      ...oneClickResult.fees,
      destinationGasFeeUsd: numberRemoveEndZero(Big(_destinationGasFeeUsd).toFixed(20)),
      estimateMintGasUsd: cctpMintFeeUsd,
      bridgeFeeUsd: cctpBridgeFeeUsd,
    };
    for (const feeKey in cctpResult.fees) {
      if (["estimateGasUsd"].includes(feeKey)) {
        continue;
      }
      if (!fees[feeKey]) {
        fees[feeKey] = cctpResult.fees[feeKey];
      }
    }
    for (const feeKey in fees) {
      if (oneClickExcludeFees.includes(feeKey)) {
        continue;
      }
      totalFeesUsd = Big(totalFeesUsd || 0).plus(fees[feeKey] || 0);
    }

    const cctpSendParam = cctpResult.sendParam?.param;

    execTime.log("OneClickCCTPService.quote");

    const routeStatus = getRouteStatus(Service.OneClickCCTP);

    return {
      ...oneClickResult,
      needPermit: true,
      permitSpender: CCTP_PROXY_RELAY_CONTRACT,
      permitToken: MIDDLE_TOKEN_CHAIN,
      permitAmountWei: oneClickResult?.quote?.amountOut,
      permitAdditionalData: {
        amount_wei: cctpSendParam?.[0]?.toString(),
        charged_amount: cctpSendParam?.[1]?.toString(),
        destination_domain: cctpSendParam?.[2]?.toString(),
        mint_recipient: cctpParams.recipient,
        burn_token: cctpSendParam?.[4]?.toString(),
        destination_caller: cctpSendParam?.[5]?.toString(),
        max_fee: cctpSendParam?.[6]?.toString(),
        finality_threshold: cctpSendParam?.[7]?.toString(),
        receipt_address: params.recipient,
        source_domain: cctpResult.quoteParam?.sourceDomain,
        destination_domain_id: cctpResult.quoteParam?.destinationDomain,
      },
      fees,
      totalFeesUsd: numberRemoveEndZero(Big(totalFeesUsd).toFixed(20)),
      estimateTime: cctpResult.estimateTime + oneClickResult.estimateTime,
      outputAmount: cctpResult.outputAmount,
      needCreateTokenAccount: cctpResult.needCreateTokenAccount,
      quoteParam: {
        ...oneClickResult.quoteParam,
        toToken: params.toToken,
        middleToken: MIDDLE_TOKEN_CHAIN,
        recipient: params.recipient,
      },
      cctpSendParam,
      routeDisabled: routeStatus.disabled,
      sourceQuoteParams: params,
    };
  }

  public async estimateTransaction(params: any, quoteData: any) {
    return oneClickService.estimateTransaction(params, quoteData);
  }

  public async send(params: any) {
    return oneClickService.send(params);
  }

  public async getStatus(params: any): Promise<{ status: string; toTxHash?: string }> {
    const { depositAddress } = params;

    const oneClickResult = await oneClickService.getStatus({ depositAddress });

    if (oneClickResult.status !== "SUCCESS") {
      return oneClickResult;
    }

    return cctpService.getStatus({ hash: depositAddress });
  }
}

export default new OneClickCCTPService();
