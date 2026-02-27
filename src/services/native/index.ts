import { formatNumber } from "@/utils/format/number";
import { getPrice } from "@/utils/format/price";
import type { AxiosInstance } from "axios";
import axios from "axios";
import Big from "big.js";
import { NativeChains, NativeV4Routes } from "./contract";
import { Service } from "../constants";

class NativeService {
  private api: AxiosInstance;
  private apiKey = import.meta.env.VITE_NATIVE_SWAP_API_KEY as string;

  constructor() {
    this.api = axios.create({
      baseURL: "https://v2.api.native.org/swap-api-v2/v1",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "api_key": this.apiKey,
      }
    });
  }

  public async quote(params: any) {
    const {
      dry,
      wallet,
      amountWei,
      refundTo,
      fromToken,
      toToken,
      prices,
      recipient,
      slippageTolerance,
    } = params;

    const isSwap = fromToken.chainName === toToken.chainName;

    let quoteUri = "/firm-quote";
    const quoteParams: any = {
      version: 4,
      from_address: refundTo,
      to_address: recipient,
      beneficiary_address: recipient,
      refund_to: recipient,
      src_chain: NativeChains[fromToken.chainName],
      dst_chain: NativeChains[toToken.chainName],
      token_in: fromToken.contractAddress,
      token_out: toToken.contractAddress,
      amount_wei: amountWei,
      expiry_time: 90, // 90 seconds
      timeout_millis: 3000, // 3 seconds
      slippage: slippageTolerance,
      allow_multihop: true
    };

    if (dry) {
      quoteUri = "/indicative-quote";
    }

    if (!isSwap) {
      quoteUri = `/bridge${quoteUri}`;
    }

    const res = await this.api.get(quoteUri, {
      params: quoteParams,
    });

    if (res.status !== 200 || !res.data?.success) {
      let errorMessage = res.data?.message || "Native quote failed";
      // requested amount smaller than token in minimum wei [18446744073709551615]
      if (errorMessage.includes("requested amount smaller than token in minimum wei")) {
        const match = errorMessage.match(/\[(\d+)\]/);
        if (match) {
          const minWei = match[1];
          const minAmount = Big(minWei).div(10 ** fromToken.decimals);
          errorMessage = `Amount is too low, at least ${formatNumber(minAmount, fromToken.decimals, true)} ${fromToken.symbol}`;
        }
      }
      throw new Error(errorMessage);
    }

    return wallet.quote(Service.Native, {
      ...params,
      ...quoteParams,
      quoteResponse: res.data,
      bridgeRouterAddress: NativeV4Routes[fromToken.chainName],
    });
  }

  public async send(params: any) {
    const {
      wallet,
      txRequest,
    } = params;

    const txResponse = await wallet.signer.sendTransaction({
      to: txRequest.target,
      data: txRequest.calldata,
      value: txRequest.value,
      gasLimit: txRequest.gasLimit,
    });

    // wait for tx to be mined
    await txResponse.wait();

    return txResponse.hash;
  }

  public async getStatus(params: {
    hash?: string;
    wallet?: any;
    history?: any;
  }) {
    const { hash, wallet, history } = params;

    const isSwap = history?.fromToken?.chainName === history?.toToken?.chainName;

    const result = { status: "PENDING_DEPOSIT" };

    if (!wallet || !hash) {
      return result;
    }

    if (isSwap) {
      const receipt = await wallet.provider.waitForTransaction(hash);
      result.status = receipt.status === 1 ? "SUCCESS" : "FAILED";
      return result;
    }

    const statusResponse = await this.api.get("/bridge/tx-status", {
      params: {
        bridge_quote_id: history?.quoteIds?.[0],
      },
    });

    if (statusResponse.status !== 200) {
      return result;
    }

    // Possible values: https://docs.native.org/native-dev/build-with-native/swap-aggregators/crosschain-swap-api/get-transaction-status
    // description: https://docs.native.org/native-dev/build-with-native/swap-aggregators/crosschain-swap-api/old-docs/get-tx-status
    // USER_REQUESTED | USER_COMMITTED | MM_FAILED | MM_FILLED | CLAIMED | REFUNDED
    const { tx_status } = statusResponse.data ?? {};

    const isPending = ["USER_REQUESTED", "USER_COMMITTED"].includes(tx_status);
    const isSuccess = ["MM_FILLED", "CLAIMED"].includes(tx_status);

    if (isPending) {
      return result;
    }

    result.status = isSuccess ? "SUCCESS" : "FAILED";
    return result;
  }
}

export default new NativeService();
