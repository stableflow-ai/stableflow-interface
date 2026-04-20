import { CCTP_TOKEN_PROXY, CCTP_TOKEN_PROXY_ABI } from "./contract";
import axios, { type AxiosInstance } from "axios";
import { CCTP_DOMAINS, IRIS_API_URL } from "./config";
import { BASE_API_URL } from "@/config/api";
import { SendType } from "@/libs/wallets/types";
import { getRouteStatus, Service } from "@/services/constants";
import { csl } from "@/utils/log";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";
import { ExecTime } from "@/utils/exec-time";

export const PayInLzToken = false;

const excludeFees: string[] = ["estimateApproveGasUsd"];

export class CCTPService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: IRIS_API_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  public async getCCTPFees(params: any) {
    const {
      type = "fast",
      sourceDomain,
      destinationDomain,
    } = params;

    try {
      const response = await this.api.get(`/burn/USDC/fees/${sourceDomain}/${destinationDomain}`);
      const [fast, standard] = response.data;
      if (type === "fast") {
        return fast;
      }
      return standard;
    } catch (error) {
      csl("CCTPService getCCTPFees", "red-500", "cctp get fees failed: %o", error);
    }
    return {
      finalityThreshold: 1000,
      minimumFee: 0,
    };
  }

  public async quote(params: any) {
    const {
      dry,
      wallet,
      // originChain,
      // destinationChain,
      amountWei,
      refundTo,
      recipient,
      fromToken,
      toToken,
      slippageTolerance,
      prices,
      evmGasFees,
    } = params;

    const _quoteType = `CCTPService ${fromToken?.chainName}->${toToken?.chainName}`;
    const execTime = new ExecTime({ type: _quoteType, logStyle: "indigo-500" });

    const sourceDomain = CCTP_DOMAINS[fromToken.chainName];
    const destinationDomain = CCTP_DOMAINS[toToken.chainName];
    const proxyAddress = CCTP_TOKEN_PROXY[fromToken.chainName];

    const result = await wallet.quote(Service.CCTP, {
      dry,
      proxyAddress,
      abi: CCTP_TOKEN_PROXY_ABI,
      amountWei,
      refundTo,
      recipient,
      fromToken,
      toToken,
      slippageTolerance,
      prices,
      evmGasFees,
      excludeFees,
      destinationDomain,
      sourceDomain,
    });

    execTime.logTotal("CCTPService.quote");

    const routeStatus = getRouteStatus(Service.CCTP);
    result.routeDisabled = routeStatus.disabled;

    return result;
  }

  public async estimateTransaction(params: any, quoteData: any) {
    const {
      fromToken,
      wallet,
      prices,
      evmGasFees,
    } = params;

    const result: any = { fees: {}, ...quoteData };

    const ett = await wallet.estimateTransaction({
      dry: false,
      ...quoteData.sendParam,
      fromToken,
      prices,
      evmGasFees,
    });
    result.fees.estimateGasUsd = ett.estimateSourceGasUsd;
    result.estimateSourceGas = ett.estimateSourceGas;
    result.estimateSourceGasUsd = ett.estimateSourceGasUsd;

    for (const feeKey in result.fees) {
      if (excludeFees.includes(feeKey) || !/Usd$/.test(feeKey)) {
        continue;
      }
      result.totalFeesUsd = Big(result.totalFeesUsd || 0).plus(result.fees[feeKey] || 0);
    }
    result.totalFeesUsd = numberRemoveEndZero(Big(result.totalFeesUsd).toFixed(20));

    return result;
  }

  public async send(params: any) {
    const {
      wallet,
      ...rest
    } = params;

    return wallet.send(SendType.SEND, rest);
  }

  public async getStatus(params: any): Promise<{ status: string; toTxHash?: string }> {
    try {
      const response = await axios({
        url: `${BASE_API_URL}/v1/trade`,
        params: {
          deposit_address: params.hash,
        },
        method: "GET",
        timeout: 30000,
        headers: {
          "Content-Type": "application/json"
        },
      });
      const result = response.data.data;
      // status: 1 = Success, 3 = Confirming
      const status = result.status;
      // to_tx_hash: minted tx hash
      const toTxHash = result.to_tx_hash;

      let finalStatus = "PENDING_DEPOSIT";
      // success
      if (status === 1) {
        finalStatus = "SUCCESS";
      }
      // Failed
      if (status === 2) {
        finalStatus = "FAILED";
      }

      return {
        status: finalStatus,
        toTxHash,
      };
    } catch (error) {
      console.error("cctp get status failed: %o", error);

      return {
        status: "PENDING_DEPOSIT",
      };
    }
  }
}

export default new CCTPService();
