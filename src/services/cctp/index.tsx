import { CCTP_TOKEN_PROXY, CCTP_TOKEN_PROXY_ABI } from "./contract";
import axios, { type AxiosInstance } from "axios";
import { CCTP_DOMAINS, IRIS_API_URL } from "./config";
import { BASE_API_URL } from "@/config/api";
import { SendType } from "@/libs/wallets/types";
import { Service } from "@/services";

export const PayInLzToken = false;

const excludeFees: string[] = ["estimateApproveGasUsd"];

class CCTPService {
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
      console.log("cctp get fees failed: %o", error);
    }
    return {
      finalityThreshold: 1000,
      minimumFee: 0,
    };
  }

  public async quote(params: any) {
    const {
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
    } = params;

    const sourceDomain = CCTP_DOMAINS[fromToken.chainName];
    const destinationDomain = CCTP_DOMAINS[toToken.chainName];
    const proxyAddress = CCTP_TOKEN_PROXY[fromToken.chainName];

    return wallet.quote(Service.CCTP, {
      proxyAddress,
      abi: CCTP_TOKEN_PROXY_ABI,
      amountWei,
      refundTo,
      recipient,
      fromToken,
      toToken,
      slippageTolerance,
      prices,
      excludeFees,
      destinationDomain,
      sourceDomain,
    });
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
      // status: 1 = minted, 3 = burned
      const status = result.status;
      // to_tx_hash: minted tx hash
      const toTxHash = result.to_tx_hash;

      let finalStatus = "PENDING_DEPOSIT";
      // success
      if (status === 1) {
        finalStatus = "SUCCESS";
      }
      // Expired
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
