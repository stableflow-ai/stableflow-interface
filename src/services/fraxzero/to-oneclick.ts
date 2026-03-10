import { csl } from "@/utils/log";
import { FraxZeroService, excludeFees as fraxExcludeFees } from ".";
import { FRAXZERO_MIDDLE_CHAIN_REFOUND_ADDRESS, FRAXZERO_MIDDLE_TOKEN_USDC, FRAXZERO_MIDDLE_TOKEN_FRXUSD, FRAXZERO_PERMIT_TO_USDC_SPENDER, FRAXZERO_REDEEM_USDC_CONTRACT, FRAXZERO_REDEEM_RWA_CONTRACT } from "./config";
import RainbowWallet from "@/libs/wallets/rainbow/wallet";
import { ethers } from "ethers";
import oneClickService, { excludeFees as oneClickExcludeFees } from "../oneclick";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";
import { SendType } from "@/libs/wallets/types";
import { FRAXZERO_REDEEM_MINT_ABI } from "./contract";

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

    csl("FraxZero2OneClickService quote", "gray-500", "params: %o", params);
    const isFromEthereumFrxUSD = fromToken.chainId === 1 && fromToken.symbol === FRAXZERO_MIDDLE_TOKEN_FRXUSD.symbol;
    // If the destination is Ethereum USDC, the user should redeem by themselves, 
    // because at this point we don't go through near-intents and can't collect gas fees.
    const isToEthereumUSDC = toToken.chainId === 1 && toToken.symbol === FRAXZERO_MIDDLE_TOKEN_USDC.symbol;

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

    // Check if the source chain is Ethereum. If it is Ethereum, FraxZero cross-chain is not required; otherwise, it is needed.
    let firstStepResult: any;
    if (!isFromEthereumFrxUSD) {
      // bridge to Ethereum
      firstStepResult = await super.quote({
        ...params,
        toToken: FRAXZERO_MIDDLE_TOKEN_FRXUSD,
      });
    }

    // get oneclick quote
    // oneclick is from Ethereum USDC to destination
    let secondStepResult: any;
    // redeem directly
    if (isToEthereumUSDC) {
      // redeem expects amountWei in frxUSD (18 decimals)
      const frxUsdAmountWei = firstStepResult
        ? Big(firstStepResult.outputAmount || 0).times(10 ** FRAXZERO_MIDDLE_TOKEN_FRXUSD.decimals).toFixed(0, Big.roundDown)
        : params.amountWei;
      secondStepResult = await middleChainWallet.redeemFrxUSD({
        ...params,
        amountWei: frxUsdAmountWei,
        fromToken: FRAXZERO_MIDDLE_TOKEN_FRXUSD,
        refundTo: middleChainRecipientAddress,
        abi: FRAXZERO_REDEEM_MINT_ABI,
        usdcCustodianAddress: FRAXZERO_REDEEM_USDC_CONTRACT,
        rwaCustodianAddress: FRAXZERO_REDEEM_RWA_CONTRACT,
      });
    }
    // bridge by near-intents
    else {
      secondStepResult = await oneClickService.quote({
        ...params,
        amountWei: Big(params.amountWei).div(10 ** fromToken.decimals).times(10 ** FRAXZERO_MIDDLE_TOKEN_USDC.decimals).toFixed(0, 0),
        fromToken: FRAXZERO_MIDDLE_TOKEN_USDC,
        originAsset: FRAXZERO_MIDDLE_TOKEN_USDC.assetId,
        swapType: "FLEX_INPUT",
        isProxy: false,
        refundTo: FRAXZERO_MIDDLE_CHAIN_REFOUND_ADDRESS,
        wallet: middleChainWallet,
      });
    }

    csl("FraxZero2OneClickService quote", "gray-500", "secondStepResult: %o", secondStepResult);

    let totalFeesUsd = Big(0);
    const fees = {
      ...firstStepResult?.fees,
    };
    for (const feeKey in secondStepResult?.fees) {
      if (oneClickExcludeFees.includes(feeKey)) {
        continue;
      }
      fees[feeKey] = secondStepResult.fees[feeKey];
    }
    for (const feeKey in fees) {
      if (fraxExcludeFees.includes(feeKey)) {
        continue;
      }
      totalFeesUsd = Big(totalFeesUsd || 0).plus(fees[feeKey] || 0);
    }

    const needApproveFirst = firstStepResult?.needApprove;
    const needApproveSecond = secondStepResult?.needApprove;
    const approveSpenderFirst = firstStepResult?.approveSpender;
    const approveSpenderSecond = secondStepResult?.approveSpender;
    const needApprove = [
      ...(Array.isArray(needApproveFirst) ? needApproveFirst : needApproveFirst != null ? [needApproveFirst] : []),
      ...(Array.isArray(needApproveSecond) ? needApproveSecond : needApproveSecond != null ? [needApproveSecond] : []),
    ];
    const approveSpender = [
      ...(Array.isArray(approveSpenderFirst) ? approveSpenderFirst : approveSpenderFirst ? [approveSpenderFirst] : []),
      ...(Array.isArray(approveSpenderSecond) ? approveSpenderSecond : approveSpenderSecond ? [approveSpenderSecond] : []),
    ];

    const finalResult = {
      ...firstStepResult,
      needApprove: needApprove.length ? needApprove : firstStepResult?.needApprove,
      approveSpender: approveSpender.length ? approveSpender : firstStepResult?.approveSpender,
      needPermit: !isToEthereumUSDC,
      permitSpender: FRAXZERO_PERMIT_TO_USDC_SPENDER,
      permitToken: FRAXZERO_MIDDLE_TOKEN_FRXUSD,
      permitAmountWei: firstStepResult ? Big(firstStepResult.outputAmount || 0).times(10 ** FRAXZERO_MIDDLE_TOKEN_FRXUSD.decimals).toFixed(0, Big.roundUp) : params.amountWei,
      permitAdditionalData: {},
      fees,
      totalFeesUsd: numberRemoveEndZero(Big(totalFeesUsd).toFixed(20)),
      estimateTime: (firstStepResult?.estimateTime || 0) + (secondStepResult?.estimateTime || 0),
      outputAmount: secondStepResult?.outputAmount || Big(params.amountWei).div(10 ** fromToken.decimals).toFixed(fromToken.decimals, 0),
      priceImpact: secondStepResult?.priceImpact || 0,
      exchangeRate: secondStepResult?.exchangeRate || "1",
      estimateSourceGas: (firstStepResult?.estimateSourceGas || 0n) + (secondStepResult?.estimateSourceGas || 0n),
      estimateSourceGasUsd: numberRemoveEndZero(Big(firstStepResult?.estimateSourceGasUsd || 0).plus(secondStepResult?.estimateSourceGasUsd || 0).toFixed(20)),
      quoteParam: {
        ...firstStepResult?.quoteParam,
        ...secondStepResult?.quoteParam,
        fromToken: params.fromToken,
        toToken: params.toToken,
        middleToken: FRAXZERO_MIDDLE_TOKEN_USDC,
        recipient: params.recipient,
        isFromEthereumFrxUSD,
        isToEthereumUSDC,
      },
      sendParam: {
        ...firstStepResult?.sendParam,
        ...secondStepResult?.sendParam,
        isFromEthereumFrxUSD,
        isToEthereumUSDC,
        middleChainWallet,
        switchChainAsync,
      },
    };

    if (!isToEthereumUSDC) {
      finalResult.quote = secondStepResult?.quote;
      finalResult.quoteParam.depositAddress = secondStepResult?.quote?.depositAddress;
      finalResult.middleToken = FRAXZERO_MIDDLE_TOKEN_FRXUSD;
    }

    return finalResult;
  }

  public override async send(params: any) {
    const {
      wallet,
      isFromEthereumFrxUSD,
      isToEthereumUSDC,
      middleChainWallet,
      switchChainAsync,
      ...rest
    } = params;

    let txHash: string;

    // Step 1: use fraxzero when not bridging from Ethereum
    if (!isFromEthereumFrxUSD) {
      txHash = await wallet.send(SendType.SEND, rest);
    }

    // Step 2: If the target asset is Ethereum USDC
    // The client calls the redeem contract
    if (isToEthereumUSDC) {
      // First, switch to Ethereum
      await switchChainAsync({ chainId: FRAXZERO_MIDDLE_TOKEN_USDC.chainId! });
      // Then, call the redeem contract
      txHash = await middleChainWallet.sendBatchCall(rest);
    }

    return txHash!;
  }
}

export default new FraxZero2OneClickService();
