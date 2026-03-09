import oneClickService, { excludeFees as oneClickExcludeFees } from "../oneclick";
import fraxZeroService, { FraxZeroService, excludeFees as fraxZeroExcludeFees } from ".";
import { csl } from "@/utils/log";
import { ethers } from "ethers";
import RainbowWallet from "@/libs/wallets/rainbow/wallet";
import { FRAXZERO_GAS_USED, FRAXZERO_MIDDLE_CHAIN_REFOUND_ADDRESS, FRAXZERO_MIDDLE_TOKEN_FRXUSD, FRAXZERO_MIDDLE_TOKEN_USDC, FRAXZERO_PERMIT_TO_FRXUSD_SPENDER, FRAXZERO_REDEEM_USDC_CONTRACT } from "./config";
import { getPrice } from "@/utils/format/price";
import { FRAXZERO_REDEEM_MINT_ABI } from "./contract";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";
import { SendType } from "@/libs/wallets/types";

export class OneClick2FraxZeroService extends FraxZeroService {
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

    csl("OneClick2FraxZeroService quote", "gray-600", "params: %o", params);

    const isFromEthereumUSDC = fromToken.chainId === 1 && fromToken.symbol === FRAXZERO_MIDDLE_TOKEN_USDC.symbol;
    const isToEthereumFrxUSD = toToken.chainId === 1 && toToken.symbol === FRAXZERO_MIDDLE_TOKEN_FRXUSD.symbol;
    const isToSolana = toToken.chainName === "Solana";
    const isToFraxtal = toToken.chainId === 252;
    const isSend = !isToEthereumFrxUSD && !isToSolana && !isToFraxtal;

    const toProviders = toToken.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, toToken.chainId));
    const toProvider = new ethers.FallbackProvider(toProviders);

    let middleChainWallet = wallets?.evm?.wallet;
    let middleChainRecipientAddress = wallets?.evm?.account;
    if (!middleChainWallet) {
      const providers = FRAXZERO_MIDDLE_TOKEN_USDC.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc));
      const provider = new ethers.FallbackProvider(providers);
      middleChainWallet = new RainbowWallet(provider, {});
    }
    if (!middleChainRecipientAddress) {
      middleChainRecipientAddress = FRAXZERO_MIDDLE_CHAIN_REFOUND_ADDRESS;
    }

    // use OneClick to bridge to Ethereum USDC first
    let firstStepResult: any;
    if (!isFromEthereumUSDC) {
      // estimate gas
      let gasLimit = FRAXZERO_GAS_USED.MINT.SEND;
      if (isToEthereumFrxUSD) {
        gasLimit = FRAXZERO_GAS_USED.MINT.TO_ETHEREUM;
      }
      if (isToSolana) {
        gasLimit = FRAXZERO_GAS_USED.MINT.TO_SOL;
      }
      if (isToFraxtal) {
        gasLimit = FRAXZERO_GAS_USED.MINT.TO_FRAXTAL;
      }
      gasLimit = gasLimit * 120n / 100n;

      const { usd, wei, amount } = await middleChainWallet.getEstimateGas({
        gasLimit,
        price: getPrice(prices, toToken.nativeToken.symbol),
        nativeToken: toToken.nativeToken,
        provider: toProvider,
      });
      const secondStepGasToAmount = Big(usd || 0).div(getPrice(prices, fromToken.symbol) || 1).toFixed(fromToken.decimals);

      csl("OneClick2FraxZeroService quote", "gray-600", "EstimateGas usd: %o, wei: %o, amount: %o", usd, wei, amount);

      // Mint should be a 1:1 conversion from Ethereum USDC to Ethereum frxUSD.
      // The ratio can be obtained from the contract.
      const { totalAssetsOut } = await middleChainWallet.previewMintFrxUSD({
        amountWei: Big(amountWei || 0).div(10 ** fromToken.decimals).times(10 ** FRAXZERO_MIDDLE_TOKEN_USDC.decimals).toFixed(0, 0),
        fromToken: FRAXZERO_MIDDLE_TOKEN_USDC,
        abi: FRAXZERO_REDEEM_MINT_ABI,
        usdcCustodianAddress: FRAXZERO_REDEEM_USDC_CONTRACT,
      });

      // estimate lz message fee
      const secondStepResult = await super.quote({
        ...params,
        fromToken: FRAXZERO_MIDDLE_TOKEN_FRXUSD,
        wallet: middleChainWallet,
        amountWei: totalAssetsOut.toString(),
      });
      csl("OneClick2FraxZeroService quote", "gray-600", "secondStepResult: %o", secondStepResult);

      let secondStepLzMsgFeeUsd = secondStepResult?.fees?.nativeFeeUsd;
      // add 20% buffer
      secondStepLzMsgFeeUsd = Big(secondStepLzMsgFeeUsd || 0).times(1.2);
      csl("OneClick2FraxZeroService quote", "gray-600", "secondStepLzMsgFeeUsd: %o", secondStepLzMsgFeeUsd.toString());
      const secondStepLzMsgFeeAmount = Big(secondStepLzMsgFeeUsd).div(getPrice(prices, fromToken.symbol) || 1).toFixed(fromToken.decimals);

      const totalAppFeesAmount = Big(secondStepGasToAmount).plus(secondStepLzMsgFeeAmount);
      csl("OneClick2FraxZeroService quote", "gray-600", "totalAppFeesAmount: %o", totalAppFeesAmount.toString());
      const oneClickFeeRatio = Big(totalAppFeesAmount)
        .div(Big(totalAppFeesAmount).plus(Big(params.amountWei).div(10 ** fromToken.decimals).toFixed(fromToken.decimals)))
        .times(10000)
        .toFixed(0, Big.roundUp);
      csl("OneClick2FraxZeroService quote", "gray-600", "oneClickFeeRatio: %o", oneClickFeeRatio.toString());

      if (Big(oneClickFeeRatio).gt(10000)) {
        return { errMsg: `Amount is too low, at least ${totalAppFeesAmount}` };
      }

      firstStepResult = await oneClickService.quote({
        ...params,
        toToken: FRAXZERO_MIDDLE_TOKEN_USDC,
        destinationAsset: FRAXZERO_MIDDLE_TOKEN_USDC.assetId,
        swapType: "EXACT_OUTPUT",
        isProxy: true,
        recipient: middleChainRecipientAddress,
        appFees: [
          {
            recipient: "reffer.near",
            // No bridge fee will be charged temporarily
            fee: +oneClickFeeRatio, // 10000 = 100% 1000 = 10% 100=1% 1=0.01%
          },
        ],
      });

      let totalFeesUsd = Big(0);
      let _destinationGasFeeUsd = Big(firstStepResult.fees?.destinationGasFeeUsd || 0).minus(secondStepLzMsgFeeUsd);
      if (Big(_destinationGasFeeUsd).lt(0)) {
        _destinationGasFeeUsd = Big(0);
      }
      const fees = {
        ...firstStepResult.fees,
        destinationGasFeeUsd: numberRemoveEndZero(Big(_destinationGasFeeUsd).toFixed(20)),
      };
      for (const feeKey in secondStepResult.fees) {
        if (fraxZeroExcludeFees.includes(feeKey)) {
          continue;
        }
        fees[feeKey] = secondStepResult.fees[feeKey];
      }
      for (const feeKey in fees) {
        if (oneClickExcludeFees.includes(feeKey)) {
          continue;
        }
        totalFeesUsd = Big(totalFeesUsd || 0).plus(fees[feeKey] || 0);
      }

      return {
        ...firstStepResult,
        needPermit: true,
        permitSpender: FRAXZERO_PERMIT_TO_FRXUSD_SPENDER,
        permitToken: FRAXZERO_MIDDLE_TOKEN_USDC,
        permitAmountWei: firstStepResult?.quote?.amountOut,
        permitAdditionalData: {},
        fees,
        totalFeesUsd: numberRemoveEndZero(Big(totalFeesUsd).toFixed(20)),
        estimateTime: secondStepResult.estimateTime + firstStepResult.estimateTime,
        outputAmount: secondStepResult.outputAmount,
        quoteParam: {
          ...firstStepResult.quoteParam,
          toToken: params.toToken,
          middleToken: FRAXZERO_MIDDLE_TOKEN_USDC,
          recipient: params.recipient,
        },
        sendParam: {
          ...firstStepResult.sendParam,
          isFromEthereumUSDC,
          isToEthereumFrxUSD,
          isToSolana,
          isToFraxtal,
          isSend,
          middleChainWallet,
          switchChainAsync,
        },
      };
    }
    // If is from Ethereum USDC, skip the first step
    // mint and bridge use contract directly
    else {

    }

    return { errMsg: "waiting dev..." };
  }

  public override async send(params: any) {
    const {
      wallet,
      isFromEthereumUSDC,
      isToEthereumFrxUSD,
      isToSolana,
      isToFraxtal,
      isSend,
      middleChainWallet,
      switchChainAsync,
      ...rest
    } = params;

    if (!isFromEthereumUSDC) {
      return wallet.send(SendType.SEND, rest);
    }

    return middleChainWallet.sendBatchCall(rest);
  }
}

export default new OneClick2FraxZeroService();
