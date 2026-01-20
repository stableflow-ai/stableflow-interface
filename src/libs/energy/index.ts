import { TRON_ENERGY_API_URL } from "@/config/api";
import axios, { type AxiosInstance } from "axios";

export type EnergyPeriod = "1H" | "1D" | "3D" | "30D";
export type EnergyAmount = 65000n | 131000n;
export type EnergyStatus = "pending" | "delegated";

class EnergyService {
  private api: AxiosInstance;
  constructor() {
    this.api = axios.create({
      baseURL: TRON_ENERGY_API_URL,
      // timeout: 30000,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  public async getPrice(params: {
    period: EnergyPeriod;
    energyAmount: EnergyAmount;
  }) {
    // return {
    //   data: {
    //     "errno": 0,
    //     "data": {
    //       "period": "1H",
    //       "energy_amount": "131000",
    //       "price": 27,
    //       "total_price": 3537000,
    //       "addition": 0
    //     }
    //   }
    // };
    return await this.api.get("/api/price", { params });
  }

  /**
   * Generate request signature
   * @param params - Signature parameters
   * @returns Signature result
   */
  public async getSignature(params: {
    body: any;
  }) {
    const { body } = params;
    const timestamp = Math.floor(Date.now() / 1000);
    const secret = import.meta.env.VITE_FRONTEND_API_SECRET;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const canonicalBody = canonical(body);
    const message = `${timestamp}&${canonicalBody}`;
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
    const sign = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    return {
      timestamp,
      signature: sign,
    };
  }

  public async getEnergy(params: {
    receiveAddress: string;
    energyAmount: number | BigInt;
    period: EnergyPeriod;
    outTradeNo?: string;
    autoActivate?: boolean;
  }) {
    // return {
    //   data: {
    //     errno: 0,
    //     data: {
    //       "orderId": "4b21d62b-6c35-44ce-91fd-0e25d85807b8",
    //       "serial": "e62f6a935ee9d4670053c8f8a782b93c",
    //       "status": "pending"
    //     },
    //   }
    // };
    const signature = await this.getSignature({
      body: params,
    });

    return this.api({
      url: "/api/orders",
      method: "POST",
      data: params,
      headers: {
        "TIMESTAMP": signature.timestamp,
        "SIGNATURE": signature.signature,
      },
    });
  }

  public async getEnergyStatus(params: {
    orderId: string;
  }) {
    const { orderId } = params;
    // return {
    //   data: {
    //     "errno": 0,
    //     "data": {
    //       "id": "4b21d62b-6c35-44ce-91fd-0e25d85807b8",
    //       "out_trade_no": "order-1762850667",
    //       "serial": "e62f6a935ee9d4670053c8f8a782b93c",
    //       "receive_address": "TGq3sfQXazu79b6ivrxXLPk3TXXvjCxF1a",
    //       "period": "1H",
    //       "energy_amount": 13100,
    //       "status": Math.random() > 0.9 ? "delegated" : "pending",
    //       "trxx_status": 40,
    //       "txid": null,
    //       "bandwidth_hash": null,
    //       "active_hash": null,
    //       "price_sun": null,
    //       "details_json": null,
    //       "created_at": 1762850668,
    //       "updated_at": 1762850865
    //     }
    //   }
    // };
    return await this.api.get(`/api/orders/${orderId}`);
  }
}

export default new EnergyService();

export interface EnergyPriceResponse {
  period: EnergyPeriod;
  energy_amount: EnergyAmount;
  price: number;
  total_price: number;
  addition: number;
}

export interface EnergyResponse {
  orderId: string;
  serial: string;
  status: string;
}

export interface EnergyStatusResponse {
  id: string;
  out_trade_no: string;
  serial: string;
  receive_address: string;
  period: string;
  energy_amount: number;
  status: string;
  trxx_status: string | null;
  txid: string | null;
  bandwidth_hash: string | null;
  active_hash: string | null;
  price_sun: number | null;
  details_json: any | null;
  created_at: number;
  updated_at: number;
}

function sortObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }
  if (obj && typeof obj === "object" && obj !== null) {
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, key: any) => {
        acc[key] = sortObject(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}

function canonical(obj: any) {
  return JSON.stringify(sortObject(obj));
}
