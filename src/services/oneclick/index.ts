import { BridgeDefaultWallets } from "@/config";
import type { WalletType } from "@/stores/use-wallets";
import axios, { type AxiosInstance } from "axios";
import Big from "big.js";

export const BridgeFee = [
  {
    recipient: "reffer.near",
    // No bridge fee will be charged temporarily
    fee: 0, // 100=1% 1=0.01%
  },
];

class OneClickService {
  private api: AxiosInstance;
  private offsetTime = 1000 * 60 * 10;
  constructor() {
    this.api = axios.create({
      baseURL: "https://1click.chaindefuser.com/v0",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  public async quote(params: {
    wallet: any,
    fromToken: any,
    dry: boolean;
    slippageTolerance: number;
    originAsset: string;
    destinationAsset: string;
    amount: string;
    refundTo: string;
    refundType: "ORIGIN_CHAIN";
    recipient: string;
    connectedWallets?: string[];
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
    });

    if (res.data) {
      res.data.estimateTime = res.data?.quote?.timeEstimate; // seconds
      res.data.outputAmount = res.data?.quote?.amountOut; // wei

      try {
        const bridgeFee = BridgeFee.reduce((acc, item) => {
          return acc.plus(Big(item.fee).div(100));
        }, Big(0)).toFixed(2) + "%";
        const netFee = Big(params.amount).minus(res.data?.quote?.amountOut);
        const bridgeFeeValue = BridgeFee.reduce((acc, item) => {
          return acc.plus(Big(params.amount).times(Big(item.fee).div(10000)));
        }, Big(0));
        const destinationGasFee = Big(netFee).minus(bridgeFeeValue);
        const sourceGasFee = await params.wallet.estimateGas({
          originAsset: params.fromToken.contractAddress,
          depositAddress: res.data?.quote?.depositAddress || BridgeDefaultWallets[params.fromToken.chainType as WalletType],
          amount: params.amount,
        });
  
        res.data.fees = {
          bridgeFee: Big(bridgeFeeValue).toFixed(0),
          destinationGasFee: Big(destinationGasFee).toFixed(0),
          sourceGasFee: Big(sourceGasFee.gasLimit || 0).toFixed(0),
        };
      } catch (error) {
        console.log("oneclick estimate failed: %o", error);
      }
    }

    return res;
  }

  public async submitHash(params: { txHash: string; depositAddress: string }) {
    return await this.api.post("/deposit/submit", params);
  }

  public async getStatus(params: {
    depositAddress: string;
    depositMemo?: string;
  }) {
    return await this.api.get("/status", { params });
  }
}

export default new OneClickService();
