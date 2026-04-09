import { USDT0_CONFIG, USDT0_DVN_COUNT } from "./config";
import { OFT_ABI, SOLANA_IDL } from "./contract";
import axios from "axios";
import { SendType } from "@/libs/wallets/types";
import { Service } from "@/services/constants";
import { calculateEstimateTime } from "../utils";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";

export const PayInLzToken = false;

export const excludeFees: string[] = ["estimateGasUsd"];

export class Usdt0Service {
  public async quote(params: any) {
    const {
      dry,
      wallet,
      originChain,
      destinationChain,
      amountWei,
      refundTo,
      recipient,
      fromToken,
      toToken,
      slippageTolerance,
      prices,
    } = params;

    const originLayerzero = USDT0_CONFIG[originChain];
    const destinationLayerzero = USDT0_CONFIG[destinationChain];

    let originLayerzeroAddress = originLayerzero.oft;
    let destinationLayerzeroAddress = destinationLayerzero.oft;
    let dstEid = destinationLayerzero.eid;

    // Dynamically calculate estimated time
    const estimateTime = calculateEstimateTime({
      requiredDvnCount: USDT0_DVN_COUNT,
      originConfig: originLayerzero,
      destinationConfig: destinationLayerzero,
    });

    if (fromToken.chainType === "evm") {
      destinationLayerzeroAddress = destinationLayerzero.oft || destinationLayerzero.oftLegacy;
      let isOriginLegacy = false;
      let isDestinationLegacy = destinationLayerzeroAddress === destinationLayerzero.oftLegacy;
      if (isDestinationLegacy) {
        originLayerzeroAddress = originLayerzero.oftLegacy || originLayerzero.oft;
        isOriginLegacy = originLayerzeroAddress === originLayerzero.oftLegacy;
      }
      if (!originLayerzeroAddress) {
        originLayerzeroAddress = originLayerzero.oftLegacy;
        isOriginLegacy = true;
        if (destinationLayerzero.oftLegacy) {
          destinationLayerzeroAddress = destinationLayerzero.oftLegacy;
          isDestinationLegacy = true;
        }
      }
      const isBothLegacy = isOriginLegacy && isDestinationLegacy;
      const isBothOUpgradeable = !isOriginLegacy && !isDestinationLegacy;
      const isMultiHopComposer = !isBothLegacy && !isBothOUpgradeable;

      const result = await wallet.quote(Service.Usdt0, {
        abi: OFT_ABI,
        dstEid,
        refundTo,
        recipient,
        amountWei,
        slippageTolerance,
        payInLzToken: PayInLzToken,
        fromToken,
        toToken,
        prices,
        originLayerzeroAddress,
        destinationLayerzeroAddress,
        excludeFees,
        multiHopComposer: USDT0_CONFIG["Arbitrum"],
        isMultiHopComposer,
        isOriginLegacy,
        isDestinationLegacy,
        originLayerzero,
        destinationLayerzero,
      });

      result.estimateTime = estimateTime;

      return result;
    }

    // source chain must be legacy
    const isOriginLegacy = true;
    originLayerzeroAddress = originLayerzero.oftLegacy;
    destinationLayerzeroAddress = destinationLayerzero.oftLegacy || destinationLayerzero.oft;
    const isDestinationLegacy = destinationLayerzeroAddress === destinationLayerzero.oftLegacy;
    const isBothLegacy = isOriginLegacy && isDestinationLegacy;
    const isMultiHopComposer = !isBothLegacy;

    // one is legacy, and one is upgradeable
    // should use multi hop composer
    // and special extraOptions & composeMsg
    if (isMultiHopComposer) {
      dstEid = USDT0_CONFIG["Arbitrum"].eid;
      destinationLayerzeroAddress = USDT0_CONFIG["Arbitrum"].oftMultiHopComposer;
    }

    const oftParams: any = {
      dry,
      dstEid: destinationLayerzero.eid,
      refundTo,
      recipient,
      amountWei,
      slippageTolerance,
      payInLzToken: PayInLzToken,
      fromToken,
      toToken,
      prices,
      originLayerzeroAddress,
      destinationLayerzeroAddress,
      excludeFees,
      multiHopComposer: USDT0_CONFIG["Arbitrum"],
      isMultiHopComposer,
      isOriginLegacy,
      isDestinationLegacy,
      originLayerzero,
      destinationLayerzero,
    };

    if (fromToken.chainType === "tron") {
      oftParams.abi = OFT_ABI;
    }

    if (fromToken.chainType === "sol") {
      oftParams.idl = SOLANA_IDL;
    }

    const result = await wallet.quote(Service.Usdt0, {
      idl: SOLANA_IDL,
      ...oftParams,
    });

    result.estimateTime = estimateTime;

    return result;
  }

  public async send(params: any) {
    const {
      wallet,
      ...rest
    } = params;

    return wallet.send(SendType.SEND, rest);
  }

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

    for (const feeKey in result.fees) {
      if (excludeFees.includes(feeKey) || !/Usd$/.test(feeKey)) {
        continue;
      }
      result.totalFeesUsd = Big(result.totalFeesUsd || 0).plus(result.fees[feeKey] || 0);
    }
    result.totalFeesUsd = numberRemoveEndZero(Big(result.totalFeesUsd).toFixed(20));

    return result;
  }

  public async getStatus(params: any): Promise<{ status: string; toTxHash?: string }> {
    const { hash, history, fromWallet } = params;
    const result = { status: "PENDING_DEPOSIT" };

    // If it's Tron, get the transaction status first
    if (history?.fromToken?.chainType === "tron" && fromWallet) {
      const response = await fromWallet.getTransactionResult(hash);

      if (!response || !response.receipt || !response.receipt.result) {
        return result;
      }

      if (response.receipt.result !== "SUCCESS") {
        result.status = "FAILED";
        return result;
      }
    }

    try {
      const txhash = history?.fromToken?.chainType === "tron" ? `0x${hash}` : hash;
      const response = await axios({
        url: `https://scan.layerzero-api.com/v1/messages/tx/${txhash}`,
        method: "GET",
        timeout: 30000,
        headers: {
          "Content-Type": "application/json"
        },
      });
      const data = response.data.data[0];
      // INFLIGHT | CONFIRMING | DELIVERED | BLOCKED | FAILED
      const status = data.status.name;
      const toTxHash = data.destination?.tx?.txHash;
      let finalStatus = "PENDING_DEPOSIT";
      if (status === "DELIVERED") {
        finalStatus = "SUCCESS";
      }
      if (status === "FAILED" || status === "BLOCKED") {
        finalStatus = "FAILED";
      }

      return {
        status: finalStatus,
        toTxHash,
      };
    } catch (error) {
      console.error("usdt0 get status failed: %o", error);
      return {
        status: "PENDING_DEPOSIT",
      };
    }
  }

  public async getLayerzeroData(params: any) {
    const { tx_hash, from_chain } = params;

    try {
      const txhash = from_chain === "tron" ? `0x${tx_hash}` : tx_hash;
      const response = await axios({
        url: `https://scan.layerzero-api.com/v1/messages/tx/${txhash}`,
        method: "GET",
        timeout: 30000,
        headers: {
          "Content-Type": "application/json"
        },
      });
      return response.data.data[0];
    } catch (error) {
      console.error("usdt0 get status failed: %o", error);
      return null;
    }
  }
}

export default new Usdt0Service();
