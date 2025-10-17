import axios, { type AxiosInstance } from "axios";

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
    return await this.api.post("/quote", {
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
      ...params
    });
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
