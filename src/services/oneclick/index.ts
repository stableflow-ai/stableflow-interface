import { BridgeDefaultWallets } from "@/config";
import type { WalletType } from "@/stores/use-wallets";
import { numberRemoveEndZero } from "@/utils/format/number";
import { getPrice } from "@/utils/format/price";
import axios, { type AxiosInstance } from "axios";
import Big from "big.js";
import { ONECLICK_PROXY, ONECLICK_PROXY_ABI } from "./contract";
import { SendType } from "@/libs/wallets/types";
import { Service } from "@/services";
import { TRON_RENTAL_FEE } from "@/config/tron";

export const BridgeFee = [
  {
    recipient: "reffer.near",
    // No bridge fee will be charged temporarily
    fee: 0 // 100=1% 1=0.01%
  }
];

const excludeFees: string[] = ["sourceGasFeeUsd"];

class OneClickService {
  private api: AxiosInstance;
  private offsetTime = 1000 * 60 * 30;
  constructor() {
    this.api = axios.create({
      baseURL: "https://1click.chaindefuser.com/v0",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  public async formatQuoteData(res: { data: any; params: any; }) {
    const { params } = res;

    if (res.data) {
      // Updated the time estimate for bridge quotes to ensure it does not exceed a maximum threshold.
      // If the calculated time exceeds 60 seconds, it is randomized between 40 and 45 seconds,
      // enhancing user experience by providing more realistic estimates.
      if (res.data?.quote) {
        if (Big(res.data.quote.timeEstimate || 0).gt(60)) {
          res.data.quote.timeEstimate = Math.floor(Math.random() * 6) + 40;
        }
      }

      res.data.estimateTime = res.data?.quote?.timeEstimate; // seconds
      res.data.outputAmount = numberRemoveEndZero(
        Big(res.data?.quote?.amountOut || 0)
          .div(10 ** params.toToken.decimals)
          .toFixed(params.toToken.decimals, 0)
      );
      let priceImpact = Big(0);
      try {
        priceImpact = Big(Big(res.data?.quote?.amountInUsd || 0).minus(res.data?.quote?.amountOutUsd || 0)).div(res.data?.quote?.amountInUsd || 1);
        if (Big(priceImpact).lt(0)) {
          priceImpact = Big(0);
        }
      } catch (error) { }
      res.data.priceImpact = numberRemoveEndZero(Big(priceImpact).toFixed(4));

      try {
        // const bridgeFee = BridgeFee.reduce((acc, item) => {
        //   return acc.plus(Big(item.fee).div(100));
        // }, Big(0)).toFixed(2) + "%";
        const netFee = Big(params.amount)
          .div(10 ** params.fromToken.decimals)
          .minus(
            Big(res.data?.quote?.amountOut || 0).div(
              10 ** params.toToken.decimals
            )
          );
        const bridgeFeeValue = BridgeFee.reduce((acc, item) => {
          return acc.plus(
            Big(params.amount)
              .div(10 ** params.fromToken.decimals)
              .times(Big(item.fee).div(10000))
          );
        }, Big(0));
        const destinationGasFee = Big(netFee).minus(bridgeFeeValue);
        res.data.fees = {
          bridgeFeeUsd: numberRemoveEndZero(Big(bridgeFeeValue).toFixed(20)),
          destinationGasFeeUsd: numberRemoveEndZero(
            Big(destinationGasFee).toFixed(20)
          )
        };

        try {
          // const sourceGasFee = await params.wallet.estimateTransferGas({
          //   originAsset: params.fromToken.contractAddress,
          //   depositAddress: res.data?.quote?.depositAddress || BridgeDefaultWallets[params.fromToken.chainType as WalletType],
          //   amount: params.amount,
          // });
          const sourceGasFee = { estimateGas: Big(TRON_RENTAL_FEE.Normal).times(10 ** params.fromToken.nativeToken.decimals) };
          const sourceGasFeeUsd = Big(sourceGasFee.estimateGas || 0).div(10 ** params.fromToken.nativeToken.decimals).times(getPrice(params.prices, params.fromToken.nativeToken.symbol));
          res.data.fees.sourceGasFeeUsd = numberRemoveEndZero(Big(sourceGasFeeUsd).toFixed(20));
          res.data.estimateSourceGas = sourceGasFee.estimateGas;
          res.data.estimateSourceGasUsd = numberRemoveEndZero(Big(sourceGasFeeUsd).toFixed(20));
        } catch (err) {
          // console.log("oneclick estimate gas failed: %o", err);
        }

        // calculate total fees
        for (const feeKey in res.data.fees) {
          if (excludeFees.includes(feeKey)) {
            continue;
          }
          res.data.totalFeesUsd = Big(res.data.totalFeesUsd || 0).plus(
            res.data.fees[feeKey] || 0
          );
        }
        res.data.totalFeesUsd = numberRemoveEndZero(
          Big(res.data.totalFeesUsd).toFixed(20)
        );
      } catch (error) {
        console.log("oneclick estimate failed: %o", error);
      }

      const proxyAddress = ONECLICK_PROXY[params.fromToken.chainName];
      let proxyParams: any = {};
      if (proxyAddress) {
        proxyParams = {
          proxyAddress,
          abi: ONECLICK_PROXY_ABI,
          fromToken: params.fromToken,
          refundTo: params.refundTo,
          recipient: params.recipient,
          amountWei: params.amount,
          prices: params.prices,
          depositAddress: res.data?.quote?.depositAddress ?? BridgeDefaultWallets[params.fromToken.chainType as WalletType],
        };
        try {
          const proxyResult = await params.wallet.quote(Service.OneClick, proxyParams);

          for (const proxyKey in proxyResult) {
            if (proxyKey === "fees") {
              for (const feeKey in proxyResult.fees) {
                if (excludeFees.includes(feeKey)) {
                  continue;
                }
                res.data.fees[feeKey] = proxyResult.fees[feeKey];
              }
              continue;
            }
            res.data[proxyKey] = proxyResult[proxyKey];
          }
        } catch (error) {
          console.log("oneclick quote proxy failed: %o", error);
        }
      }

      res.data.quoteParam = {
        ...params,
        ...proxyParams,
      };
    }

    return res.data || {};
  }

  public async quote(params: {
    wallet: any;
    fromToken: any;
    toToken: any;
    dry: boolean;
    slippageTolerance: number;
    originAsset: string;
    destinationAsset: string;
    amount: string;
    refundTo: string;
    refundType: "ORIGIN_CHAIN";
    recipient: string;
    connectedWallets?: string[];
    prices: Record<string, string>;
  }) {
    const res = await this.api.post("/quote", {
      depositMode: "SIMPLE",
      swapType: "EXACT_INPUT",
      depositType: "ORIGIN_CHAIN",
      sessionId: `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      recipientType: "DESTINATION_CHAIN",
      deadline: new Date(Date.now() + this.offsetTime).toISOString(),
      quoteWaitingTimeMs: 3000,
      appFees: BridgeFee,
      referral: "stableflow",
      ...params,
      // delete params
      wallet: void 0,
      fromToken: void 0,
      toToken: void 0,
      prices: void 0,
      amountWei: void 0,
    });

    return this.formatQuoteData({ data: res.data, params });
  }

  public async send(params: any) {
    const {
      wallet,
      fromToken,
      depositAddress,
      amountWei,
      sendParam,
    } = params;

    // proxy transfer
    if (sendParam) {
      const tx = await wallet.send(SendType.SEND, sendParam);
      return tx;
    }

    const hash = await wallet.send(SendType.TRANSFER, {
      originAsset: fromToken.contractAddress,
      depositAddress: depositAddress,
      amount: amountWei,
    });
    return hash;
  }

  public async submitHash(params: { txHash: string; depositAddress: string }) {
    return await this.api.post("/deposit/submit", params);
  }

  public async getStatus(params: {
    depositAddress: string;
    depositMemo?: string;
  }): Promise<{ status: string; toTxHash?: string }> {
    try {
      const response = await this.api.get("/status", { params });

      const status = response.data.status;
      const toTxHash = response.data.swapDetails?.destinationChainTxHashes?.[0]?.hash;

      return { status, toTxHash };
    } catch (error) {
      console.error("oneclick get status failed: %o", error);
      return { status: "PENDING_DEPOSIT" };
    }
  }

  public async getStatusData(params: {
    depositAddress: string;
  }): Promise<any> {
    try {
      const response = await this.api.get("/status", { params });

      if (response.status !== 200 || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error("oneclick get status data failed: %o", error);
      return null;
    }
  }
}

export default new OneClickService();
