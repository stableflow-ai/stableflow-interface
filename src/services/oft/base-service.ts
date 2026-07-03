import { SendType } from "@/libs/wallets/types";
import type { Service } from "@/services/constants";
import { csl } from "@/utils/log";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";
import { getLayerzeroData, getOftTransferStatus } from "./status";

export const DEFAULT_PAY_IN_LZ_TOKEN = false;

export const DEFAULT_EXCLUDE_FEES: string[] = ["estimateGasUsd"];

export abstract class OftService {
  protected abstract readonly service: Service;
  protected abstract readonly dvnCount: number;
  protected readonly payInLzToken = DEFAULT_PAY_IN_LZ_TOKEN;
  protected readonly excludeFees = DEFAULT_EXCLUDE_FEES;

  public abstract quote(params: any): Promise<any>;

  public async estimateTransaction(params: any, quoteData: any) {
    const {
      fromToken,
      amountWei,
      wallet,
      prices,
      evmGasFees,
    } = params;

    const result: any = { fees: {}, ...quoteData };

    const isFromTron = fromToken.chainType === "tron";
    const nativeTokenDecimals = fromToken.nativeToken.decimals;

    const estimateTransactionParams = {
      dry: false,
      ...quoteData.sendParam,
      fromToken,
      prices,
      evmGasFees,
    };
    if (isFromTron) {
      estimateTransactionParams.defaultEnergyUsed = 300000;
      estimateTransactionParams.defaultRawDataHexLength = 1000;
    }
    const ett = await wallet.estimateTransaction(estimateTransactionParams);
    result.fees.estimateGasUsd = ett.estimateSourceGasUsd;
    result.estimateSourceGas = ett.estimateSourceGas;
    result.estimateSourceGasUsd = ett.estimateSourceGasUsd;
    result.totalEstimateSourceGas = BigInt(Big(quoteData.fees?.nativeFee || 0).times(10 ** nativeTokenDecimals).toFixed(0)) + ett.estimateSourceGas;

    if (result.needApprove && wallet.estimateApprove) {
      const estApptroveGas = await wallet.estimateApprove({
        dry: false,
        amountWei,
        spender: result.approveSpender,
        fromToken,
        prices,
      });
      result.estimateApproveGas = estApptroveGas.estimateSourceGas;
    }

    result.totalFeesUsd = "0";
    for (const feeKey in result.fees) {
      if (this.excludeFees.includes(feeKey) || !/Usd$/.test(feeKey)) {
        continue;
      }
      result.totalFeesUsd = Big(result.totalFeesUsd || 0).plus(result.fees[feeKey] || 0);
    }
    result.totalFeesUsd = numberRemoveEndZero(Big(result.totalFeesUsd).toFixed(20));

    if (fromToken.chainType === "evm") {
      const sendParams = result.sendParam?.param;
      if (
        sendParams
        && Array.isArray(sendParams)
        && sendParams[sendParams.length - 1]
        && typeof sendParams[sendParams.length - 1] === "object"
        && sendParams[sendParams.length - 1].gasLimit !== void 0
      ) {
        csl(`${this.service} estimateTransaction`, "green-500", "Old gasLimit: %o", sendParams[sendParams.length - 1].gasLimit);
        sendParams[sendParams.length - 1].gasLimit = ett.estimateSourceGasLimit;
        csl(`${this.service} estimateTransaction`, "green-500", "Updated gasLimit: %o", sendParams[sendParams.length - 1].gasLimit);
      }
    }

    return result;
  }

  public async send(params: any) {
    const {
      wallet,
      ...rest
    } = params;

    return wallet.send(SendType.SEND, rest);
  }

  public async getStatus(params: any) {
    return getOftTransferStatus(params);
  }

  public async getLayerzeroData(params: any) {
    return getLayerzeroData(params);
  }
}
