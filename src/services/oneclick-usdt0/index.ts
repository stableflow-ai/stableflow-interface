import oneClickService, { excludeFees as oneClickExcludeFees } from "../oneclick";
import usdt0Service, { excludeFees as usdt0ExcludeFees } from "../usdt0";
import cctpService from "../cctp";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";
import { MIDDLE_CHAIN_REFOUND_ADDRESS, MIDDLE_TOKEN_CHAIN } from "../usdt0-oneclick/config";
import { ethers } from "ethers";
import RainbowWallet from "@/libs/wallets/rainbow/wallet";
import { BridgeDefaultWallets } from "@/config";
import { getPrice } from "@/utils/format/price";

class OneClickUsdt0Service {
  public async quote(params: any) {
    const {
      wallets,
      fromToken,
      prices,
    } = params;

    let middleChainWallet = wallets?.evm?.wallet;
    let destinationRecipientAddress = wallets?.evm?.account;
    if (!middleChainWallet) {
      const providers = fromToken.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc));
      const provider = new ethers.FallbackProvider(providers);
      middleChainWallet = new RainbowWallet(provider, {});
    }
    if (!destinationRecipientAddress) {
      destinationRecipientAddress = BridgeDefaultWallets.evm;
    }

    // First, call the usdt0 quote method
    // Retrieve sendParam, fees, and estimated costs
    // usdt0 is the second step, so the source chain is arb
    // The refund address is MIDDLE_CHAIN_REFOUND_ADDRESS
    // Since the first step uses oneclick with EXACT_OUTPUT mode,
    // params.amountWei is the input amount for the second step
    const usdt0Params = {
      ...params,
      fromToken: MIDDLE_TOKEN_CHAIN,
      originChain: MIDDLE_TOKEN_CHAIN.chainName,
      refundTo: MIDDLE_CHAIN_REFOUND_ADDRESS,
      wallet: middleChainWallet,
    };

    const usdt0Result = await usdt0Service.quote(usdt0Params);

    // LZ message fee to USD
    const usdt0MessageFeeUsd = usdt0Result.fees.nativeFeeUsd;
    // add 20% buffer
    const usdt0MessageFeeAmount = Big(usdt0MessageFeeUsd || 0).div(getPrice(prices, MIDDLE_TOKEN_CHAIN.symbol) || 1).times(1.2).toFixed(MIDDLE_TOKEN_CHAIN.decimals);

    if (usdt0Result.errMsg) {
      return usdt0Result;
    }

    // OneClick charges a proportional fee
    // The OneClick fee ratio is calculated based on usdt0MessageFeeAmount
    const oneClickFeeRatio = Big(usdt0MessageFeeAmount || 0)
      .div(Big(params.amountWei).div(10 ** fromToken.decimals).toFixed(fromToken.decimals))
      .times(10000)
      .toFixed(0, Big.roundUp);

    console.log("usdt0MessageFeeAmount: %o", usdt0MessageFeeAmount);
    console.log("amount: %o", Big(params.amountWei).div(10 ** fromToken.decimals).toFixed(fromToken.decimals));
    console.log("oneClickFeeRatio: %o", oneClickFeeRatio);

    if (Big(oneClickFeeRatio).gt(10000)) {
      return { errMsg: `Amount is too low, at least ${usdt0MessageFeeAmount}` };
    }

    // Call oneclick quote method again
    // The destination chain is arb
    // Since the exact amount transferred by oneclick needs to be signed, EXACT_OUTPUT mode must be used
    // In EXACT_OUTPUT mode, the output amount equals the expected value
    const oneClickResult = await oneClickService.quote({
      ...params,
      toToken: MIDDLE_TOKEN_CHAIN,
      destinationAsset: MIDDLE_TOKEN_CHAIN.assetId,
      swapType: "EXACT_OUTPUT",
      isProxy: true,
      recipient: destinationRecipientAddress,
      appFees: [
        {
          recipient: "reffer.near",
          // No bridge fee will be charged temporarily
          fee: +oneClickFeeRatio, // 10000 = 100% 1000 = 10% 100=1% 1=0.01%
        },
      ],
    });

    let totalFeesUsd = Big(0);
    const fees = {
      ...oneClickResult.fees,
    };
    for (const feeKey in usdt0Result.fees) {
      if (usdt0ExcludeFees.includes(feeKey)) {
        continue;
      }
      fees[feeKey] = usdt0Result.fees[feeKey];
    }
    for (const feeKey in fees) {
      if (oneClickExcludeFees.includes(feeKey)) {
        continue;
      }
      totalFeesUsd = Big(totalFeesUsd || 0).plus(fees[feeKey] || 0);
    }

    return {
      ...oneClickResult,
      fees,
      totalFeesUsd: numberRemoveEndZero(Big(totalFeesUsd).toFixed(20)),
      estimateTime: usdt0Result.estimateTime + oneClickResult.estimateTime,
      outputAmount: usdt0Result.outputAmount,
      quoteParam: {
        ...oneClickResult.quoteParam,
        toToken: params.toToken,
        middleToken: MIDDLE_TOKEN_CHAIN,
      },
      usdt0SendParam: usdt0Result.sendParam?.param?.[0],
      usdt0MessageFee: usdt0Result.sendParam?.param?.[1],
    };
  }

  public async send(params: any) {
    return oneClickService.send(params);
  }

  public async getStatus(params: any): Promise<{ status: string; toTxHash?: string }> {
    const { depositAddress } = params;

    // First, get the status of oneclick
    const oneClickResult = await oneClickService.getStatus({ depositAddress });

    if (oneClickResult.status !== "SUCCESS") {
      return oneClickResult;
    }

    // Then get the status of usdt0
    // Since the transaction is initiated on the server side, the frontend cannot obtain the txhash
    // Therefore, it is necessary to call the server-side API to get the result
    return cctpService.getStatus({ hash: depositAddress });
  }
}

export default new OneClickUsdt0Service();
