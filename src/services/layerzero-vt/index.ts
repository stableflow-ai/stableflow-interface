import Big from "big.js";
import { getRouteStatus, Service } from "../constants";
import { numberRemoveEndZero } from "@/utils/format/number";
import { ExecTime } from "@/utils/exec-time";
import { csl } from "@/utils/log";
import { getVtChainKey, isVtEvmRoute } from "./config";
import { layerzeroVtApi, VtUnsupportedRouteError } from "./api";
import type { VtQuote, VtTransactionUserStep, VtUserStep } from "./types";
import {
  buildVtFeesFromQuote,
  calculateVtTotalFeesUsd,
  type VtQuoteToken,
} from "./utils";

const normalizeEip712Message = (message: Record<string, unknown>) => {
  const bigintFields = ["inputAmount", "outputAmount", "startTime", "endTime"];
  const normalized: Record<string, unknown> = { ...message };

  for (const field of bigintFields) {
    if (normalized[field] !== void 0 && normalized[field] !== null) {
      normalized[field] = BigInt(String(normalized[field]));
    }
  }

  return normalized;
};

const getBridgeTransactionStep = (userSteps: VtUserStep[]): VtTransactionUserStep | undefined => {
  const transactionSteps = userSteps.filter((step): step is VtTransactionUserStep => step.type === "TRANSACTION");
  return transactionSteps.find((step) => step.description?.toLowerCase().includes("bridge"))
    || transactionSteps[transactionSteps.length - 1];
};

const formatVtQuote = (vtQuote: VtQuote, params: any, tokens: VtQuoteToken[] = []) => {
  const { fromToken, toToken, amountWei, refundTo, recipient, slippageTolerance } = params;
  const outputAmount = numberRemoveEndZero(
    Big(vtQuote.dstAmount || 0).div(10 ** toToken.decimals).toFixed(toToken.decimals, 0)
  );
  const inputAmount = numberRemoveEndZero(
    Big(vtQuote.srcAmount || amountWei || 0).div(10 ** fromToken.decimals).toFixed(fromToken.decimals, 0)
  );

  let priceImpact = Big(0);
  try {
    const amountInUsd = Big(vtQuote.srcAmountUsd || 0);
    const amountOutUsd = Big(vtQuote.dstAmountUsd || 0);
    if (amountInUsd.gt(0)) {
      priceImpact = amountInUsd.minus(amountOutUsd).div(amountInUsd);
      if (priceImpact.lt(0)) {
        priceImpact = Big(0);
      }
    }
  } catch (_error) { }

  const fromTokenSymbol = fromToken.symbol === "USD₮0" ? "USDT" : fromToken.symbol;
  const toTokenSymbol = toToken.symbol === "USD₮0" ? "USDT" : toToken.symbol;
  let exchangeRate = "1";
  if (fromTokenSymbol !== toTokenSymbol) {
    exchangeRate = numberRemoveEndZero(
      Big(outputAmount || 0).div(inputAmount || 1).toFixed(toToken.decimals, 0)
    );
  }

  const estimateTimeMs = Big(vtQuote.duration?.estimated || 0);
  const estimateTime = estimateTimeMs.gt(0)
    ? Math.ceil(estimateTimeMs.div(1000).toNumber())
    : 60;

  const bridgeStep = getBridgeTransactionStep(vtQuote.userSteps);
  const fees = buildVtFeesFromQuote(vtQuote.fees, tokens, vtQuote.feeUsd);

  return {
    vtQuoteId: vtQuote.id,
    vtQuote,
    userSteps: vtQuote.userSteps,
    outputAmount,
    estimateTime,
    fees,
    feePercent: vtQuote.feePercent || "0",
    totalFeesUsd: calculateVtTotalFeesUsd(fees),
    priceImpact: numberRemoveEndZero(Big(priceImpact).toFixed(4)),
    exchangeRate,
    needApprove: false,
    sendParam: {
      userSteps: vtQuote.userSteps,
      vtQuoteId: vtQuote.id,
      fromToken,
      bridgeEncoded: bridgeStep?.transaction?.encoded,
    },
    quoteParam: {
      fromToken,
      toToken,
      amountWei,
      refundTo,
      recipient,
      slippageTolerance,
      vtQuoteId: vtQuote.id,
    },
    routeSteps: vtQuote.routeSteps,
    dstAmountMin: numberRemoveEndZero(
      Big(vtQuote.dstAmountMin || 0).div(10 ** toToken.decimals).toFixed(toToken.decimals, 0)
    ),
  };
};

class LayerzeroVtService {
  public async quote(params: any) {
    const {
      fromToken,
      toToken,
      amountWei,
      refundTo,
      recipient,
      slippageTolerance = 0.005,
    } = params;

    const _quoteType = `LayerzeroVtService ${fromToken?.chainName}->${toToken?.chainName}`;
    const execTime = new ExecTime({ type: _quoteType, logStyle: "lime-300" });

    // if (!isVtEvmRoute(fromToken, toToken)) {
    //   throw new VtUnsupportedRouteError("Unsupported route");
    // }

    const srcChainKey = getVtChainKey(fromToken.chainName);
    const dstChainKey = getVtChainKey(toToken.chainName);

    if (!srcChainKey || !dstChainKey) {
      throw new VtUnsupportedRouteError("Unsupported chain");
    }

    if (!refundTo || !recipient) {
      throw new Error("Wallet address is required");
    }

    execTime.breakpoint();
    const res = await layerzeroVtApi.getQuotes({
      srcChainKey,
      dstChainKey,
      srcTokenAddress: fromToken.contractAddress,
      dstTokenAddress: toToken.contractAddress,
      srcWalletAddress: refundTo,
      dstWalletAddress: recipient,
      amount: amountWei,
      options: {
        amountType: "EXACT_SRC_AMOUNT",
        feeTolerance: {
          type: "PERCENT",
          amount: Number(Big(slippageTolerance || 0.005).times(100).toFixed(2)),
        },
      },
    });
    execTime.log("VT API quotes");

    const vtQuote = res.quotes?.[0];
    if (!vtQuote) {
      throw new VtUnsupportedRouteError("Unsupported route");
    }

    const result: any = formatVtQuote(vtQuote, params, res.tokens);
    const routeStatus = getRouteStatus(Service.LayerzeroVt);
    result.routeDisabled = routeStatus.disabled;
    result.sourceQuoteParams = params;

    execTime.logTotal("LayerzeroVtService.quote");
    return result;
  }

  public async estimateTransaction(params: any, quoteData: any) {
    const {
      fromToken,
      wallet,
      prices,
      evmGasFees,
      refundTo,
      dry,
    } = params;

    if (!quoteData?.userSteps?.length || !wallet?.estimateTransaction) {
      return quoteData;
    }

    const result: any = {
      fees: { ...quoteData.fees },
      ...quoteData,
    };

    let totalGasUsd = Big(0);
    let totalGasWei = 0n;

    const transactionSteps = quoteData.userSteps.filter(
      (step: VtUserStep) => step.type === "TRANSACTION"
    ) as VtTransactionUserStep[];

    for (const step of transactionSteps) {
      const encoded = step.transaction?.encoded;
      if (!encoded) continue;

      try {
        const ett = await wallet.estimateTransaction({
          dry,
          fromToken,
          prices,
          evmGasFees,
          refundTo,
          txRequest: {
            target: encoded.to,
            calldata: encoded.data,
            value: encoded.value,
          },
        });
        totalGasUsd = totalGasUsd.plus(ett.estimateSourceGasUsd || 0);
        totalGasWei += ett.estimateSourceGas || 0n;
      } catch (error) {
        csl("LayerzeroVtService estimateTransaction", "red-500", "estimate gas failed: %o", error);
      }
    }

    result.fees.estimateGasUsd = numberRemoveEndZero(totalGasUsd.toFixed(20));
    result.estimateSourceGas = totalGasWei;
    result.totalEstimateSourceGas = totalGasWei;
    result.estimateSourceGasUsd = result.fees.estimateGasUsd;
    result.totalFeesUsd = calculateVtTotalFeesUsd(result.fees);

    const bridgeStep = getBridgeTransactionStep(quoteData.userSteps);
    if (bridgeStep?.transaction?.encoded && result.sendParam) {
      result.sendParam.bridgeEncoded = bridgeStep.transaction.encoded;
    }

    return result;
  }

  public async send(params: any) {
    const {
      wallet,
      userSteps,
      vtQuoteId,
      fromToken,
    } = params;

    if (!wallet || !userSteps?.length) {
      throw new Error("Invalid send parameters");
    }

    let lastHash: string | undefined;

    for (const step of userSteps) {
      if (step.type === "TRANSACTION") {
        const encoded = step.transaction?.encoded;
        if (!encoded) {
          throw new Error("Missing transaction data");
        }

        lastHash = await wallet.sendEncodedTransaction({
          encoded,
          fromToken,
        });

        if (lastHash && wallet.waitForTransaction) {
          await wallet.waitForTransaction(lastHash);
        }
      }

      if (step.type === "SIGNATURE") {
        const typedData = step.signature?.typedData;
        if (!typedData) {
          throw new Error("Missing signature data");
        }

        const primaryType = typedData.primaryType
          || Object.keys(typedData.types || {}).find((key) => key !== "EIP712Domain");

        const signature = await wallet.signEip712TypedData({
          domain: typedData.domain,
          types: typedData.types,
          primaryType,
          message: normalizeEip712Message(typedData.message),
        });

        await layerzeroVtApi.submitSignature(vtQuoteId, [signature]);
      }
    }

    return void 0;
  }

  public async getStatus(params: {
    hash?: string;
    history?: any;
  }) {
    const { hash, history } = params;
    const quoteId = history?.quoteIds?.[0];

    const result: { status: string; toTxHash?: string; } = {
      status: "PENDING_DEPOSIT",
    };

    if (!quoteId) {
      return result;
    }

    try {
      const statusRes = await layerzeroVtApi.getStatus(quoteId, hash);

      if (statusRes.status === "SUCCEEDED") {
        result.status = "SUCCESS";
      } else if (statusRes.status === "FAILED" || statusRes.status === "UNKNOWN") {
        result.status = "FAILED";
      }

      const deliveredTx = statusRes.executionHistory?.find((item) => item.event === "DELIVERED");
      if (deliveredTx?.transaction?.hash) {
        result.toTxHash = deliveredTx.transaction.hash;
      }
    } catch (error) {
      csl("LayerzeroVtService getStatus", "red-500", "status check failed: %o", error);
    }

    return result;
  }

  // VT routes use the REST status API, not LayerZero Scan OFT compose tracking.
  public async getLayerzeroData() {
    return null;
  }
}

export default new LayerzeroVtService();
