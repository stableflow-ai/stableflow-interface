import { csl } from "@/utils/log";
import { FraxZeroService, excludeFees as fraxExcludeFees } from ".";
import { FRAXZERO_MIDDLE_CHAIN_REFOUND_ADDRESS, FRAXZERO_MIDDLE_TOKEN_USDC, FRAXZERO_MIDDLE_TOKEN_FRXUSD, FRAXZERO_REDEEM_USDC_CONTRACT, FRAXZERO_REDEEM_RWA_CONTRACT, FRAXZERO_REDEEM_AND_MINT_CONTRACT, FRAXZERO_GAS_USED } from "./config";
import RainbowWallet from "@/libs/wallets/rainbow/wallet";
import { ethers } from "ethers";
import oneClickService, { excludeFees as oneClickExcludeFees } from "../oneclick";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";
import { SendType } from "@/libs/wallets/types";
import { FRAXZERO_REDEEM_MINT_ABI } from "./contract";
import { getPrice } from "@/utils/format/price";

export class FraxZero2OneClickService extends FraxZeroService {
  public override async quote(params: any) {
    const {
      wallet,
      amountWei,
      refundTo,
      recipient,
      fromToken,
      toToken,
      slippageTolerance,
      prices,
      wallets,
      switchChainAsync,
    } = params;

    csl("FraxZero2OneClickService quote", "yellow-500", "params: %o", params);

    const _quoteType = `FraxZero2OneClick ${fromToken?.chainName}->${toToken?.chainName}`;
    const _t0 = performance.now();
    let _t = _t0;

    const isFromEthereumFrxUSD = fromToken.chainId === 1 && fromToken.symbol === FRAXZERO_MIDDLE_TOKEN_FRXUSD.symbol;
    const isToEthereumUSDC = toToken.chainId === 1 && toToken.symbol === FRAXZERO_MIDDLE_TOKEN_USDC.symbol;

    const providers = FRAXZERO_MIDDLE_TOKEN_FRXUSD.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, FRAXZERO_MIDDLE_TOKEN_FRXUSD.chainId));
    const provider = new ethers.FallbackProvider(providers);

    let middleChainWallet = wallets?.evm?.wallet;
    let middleChainRecipientAddress = wallets?.evm?.account;
    if (!middleChainWallet) {
      middleChainWallet = new RainbowWallet(provider, {});
    }
    if (!middleChainRecipientAddress) {
      middleChainRecipientAddress = FRAXZERO_MIDDLE_CHAIN_REFOUND_ADDRESS;
    }

    // fraxzero quote result
    let firstStepResult: any;
    if (!isFromEthereumFrxUSD) {
      _t = performance.now();
      // bridge to Ethereum
      firstStepResult = await super.quote({
        ...params,
        toToken: FRAXZERO_MIDDLE_TOKEN_FRXUSD,
        recipient: middleChainRecipientAddress,
      });
      csl(_quoteType, "gray-900", "super.quote (FraxZero bridge): %sms", (performance.now() - _t).toFixed(0));
    }
    csl("FraxZero2OneClickService quote", "yellow-600", "firstStepResult: %o", firstStepResult);
    const ethereumFrxUSDAmountWei = isFromEthereumFrxUSD ? amountWei : Big(firstStepResult.outputAmount || 0).times(10 ** FRAXZERO_MIDDLE_TOKEN_FRXUSD.decimals).toFixed(0, Big.roundDown);

    // oneclick quote result
    let thirdStepResult: any;
    if (!isToEthereumUSDC) {
      let oneClickFeeRatio = "0";
      if (!isFromEthereumFrxUSD) {
        _t = performance.now();
        const { usd, wei, amount } = await middleChainWallet.getEstimateGas({
          gasLimit: FRAXZERO_GAS_USED.REDEEM * 120n / 100n,
          price: getPrice(prices, FRAXZERO_MIDDLE_TOKEN_FRXUSD.nativeToken.symbol),
          nativeToken: FRAXZERO_MIDDLE_TOKEN_FRXUSD.nativeToken,
          provider,
        });
        csl(_quoteType, "gray-900", "middleChainWallet.getEstimateGas (redeem): %sms", (performance.now() - _t).toFixed(0));
        const secondStepGasToAmount = Big(usd).div(getPrice(prices, FRAXZERO_MIDDLE_TOKEN_USDC.symbol) || 1).toFixed(FRAXZERO_MIDDLE_TOKEN_USDC.decimals);
        oneClickFeeRatio = Big(secondStepGasToAmount)
          .div(Big(secondStepGasToAmount).plus(Big(ethereumFrxUSDAmountWei).div(10 ** FRAXZERO_MIDDLE_TOKEN_USDC.decimals).toFixed(FRAXZERO_MIDDLE_TOKEN_USDC.decimals)))
          .times(10000)
          .toFixed(0, Big.roundUp);
      }

      // estimate redeem amount
      let ethereumUSDCAmountWei = ethereumFrxUSDAmountWei;
      try {
        _t = performance.now();
        const { totalAssetsOut } = await middleChainWallet.preivewRedeemFrxUSD({
          amountWei: ethereumFrxUSDAmountWei,
          fromToken: FRAXZERO_MIDDLE_TOKEN_FRXUSD,
          abi: FRAXZERO_REDEEM_MINT_ABI,
          usdcCustodianAddress: FRAXZERO_REDEEM_USDC_CONTRACT,
          rwaCustodianAddress: FRAXZERO_REDEEM_RWA_CONTRACT,
        });
        csl(_quoteType, "gray-900", "previewRedeemFrxUSD: %sms", (performance.now() - _t).toFixed(0));
        ethereumUSDCAmountWei = totalAssetsOut.toString();
      } catch (error) {
        csl("FraxZero2OneClickService quote", "red-500", "estimate redeem amount failed: %o", error);
      }

      // from ethereum USDC to toToken
      _t = performance.now();
      thirdStepResult = await oneClickService.quote({
        ...params,
        amountWei: ethereumUSDCAmountWei,
        fromToken: FRAXZERO_MIDDLE_TOKEN_USDC,
        originAsset: FRAXZERO_MIDDLE_TOKEN_USDC.assetId,
        swapType: "FLEX_INPUT",
        isProxy: false,
        refundTo: middleChainRecipientAddress,
        wallet: middleChainWallet,
        appFees: [
          {
            recipient: "reffer.near",
            // No bridge fee will be charged temporarily
            fee: +oneClickFeeRatio, // 10000 = 100% 1000 = 10% 100=1% 1=0.01%
          },
        ],
      });
      csl(_quoteType, "gray-900", "oneClickService.quote: %sms", (performance.now() - _t).toFixed(0));
    }
    csl("FraxZero2OneClickService quote", "yellow-600", "thirdStepResult: %o", thirdStepResult);

    // redeem from ethereum frxUSD to ethereum USDC
    _t = performance.now();
    const secondStepResult = await middleChainWallet.redeemFrxUSD({
      ...params,
      fromToken: FRAXZERO_MIDDLE_TOKEN_FRXUSD,
      amountWei: ethereumFrxUSDAmountWei,
      toToken: FRAXZERO_MIDDLE_TOKEN_USDC,
      refundTo: middleChainRecipientAddress,
      recipient: !isToEthereumUSDC ? (thirdStepResult?.quote?.depositAddress || middleChainRecipientAddress) : recipient,
      abi: FRAXZERO_REDEEM_MINT_ABI,
      usdcCustodianAddress: FRAXZERO_REDEEM_USDC_CONTRACT,
      rwaCustodianAddress: FRAXZERO_REDEEM_RWA_CONTRACT,
      redeemAndMintContractAddress: FRAXZERO_REDEEM_AND_MINT_CONTRACT,
    });
    csl(_quoteType, "gray-900", "middleChainWallet.redeemFrxUSD: %sms", (performance.now() - _t).toFixed(0));
    csl("FraxZero2OneClickService quote", "yellow-600", "secondStepResult: %o", secondStepResult);

    const withOneClick = (_result: any) => {
      let totalFeesUsd = Big(0);
      let estimateTime = _result?.estimateTime || 0;
      let finalOutputAmount = _result?.outputAmount || "0";
      let depositAddress = thirdStepResult?.quote?.depositAddress;

      const fees = {
        ..._result?.fees,
      };
      if (!isToEthereumUSDC) {
        for (const feeKey in thirdStepResult?.fees) {
          if (oneClickExcludeFees.includes(feeKey)) {
            continue;
          }
          fees[feeKey] = thirdStepResult.fees[feeKey];
        }
        estimateTime = estimateTime + (thirdStepResult?.estimateTime || 0);
        finalOutputAmount = thirdStepResult?.outputAmount || "0";
      }
      for (const feeKey in fees) {
        if (fraxExcludeFees.includes(feeKey)) {
          continue;
        }
        totalFeesUsd = Big(totalFeesUsd || 0).plus(fees[feeKey] || 0);
      }

      const inputAmount = Big(amountWei).div(10 ** fromToken.decimals).toFixed(fromToken.decimals, Big.roundDown);
      const amountInUsd = Big(inputAmount).times(getPrice(prices, fromToken.symbol));
      const priceImpact = Big(amountInUsd).minus(Big(finalOutputAmount).times(getPrice(prices, toToken.symbol))).div(amountInUsd);
      const exchangeRate = Big(finalOutputAmount).div(inputAmount);

      return {
        fees,
        totalFeesUsd: numberRemoveEndZero(Big(totalFeesUsd).toFixed(20)),
        estimateTime,
        outputAmount: finalOutputAmount,
        priceImpact: numberRemoveEndZero(Big(priceImpact).toFixed(4)),
        exchangeRate: numberRemoveEndZero(Big(exchangeRate).toFixed(6, Big.roundDown)),
        quoteParam: {
          ..._result?.quoteParam,
          fromToken,
          amountWei,
          toToken,
          refundTo,
          recipient,
          middleToken: FRAXZERO_MIDDLE_TOKEN_USDC,
          middleToken2: FRAXZERO_MIDDLE_TOKEN_FRXUSD,
          isFromEthereumFrxUSD,
          isToEthereumUSDC,
          depositAddress,
        },
      };
    };

    // Redeem from the frontend
    if (isFromEthereumFrxUSD) {

      const oneClickResult = withOneClick(secondStepResult);

      csl(_quoteType, "gray-900", "total (isFromEthereumFrxUSD): %sms", (performance.now() - _t0).toFixed(0));
      return {
        ...secondStepResult,
        ...oneClickResult,
      };
    }

    // Redeem is done by the backend, and the frontend calls FraxZero to bridge to Ethereum frxUSD
    const oneClickResult = withOneClick(firstStepResult);
    csl(_quoteType, "gray-900", "total: %sms", (performance.now() - _t0).toFixed(0));
    return {
      ...firstStepResult,
      ...oneClickResult,
      recipient,
      needPermit: true,
      permitSpender: FRAXZERO_REDEEM_AND_MINT_CONTRACT,
      permitToken: FRAXZERO_MIDDLE_TOKEN_FRXUSD,
      permitAmountWei: ethereumFrxUSDAmountWei,
      permitAdditionalData: {},
    };
  }
}

export default new FraxZero2OneClickService();
