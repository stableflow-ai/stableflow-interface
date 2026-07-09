import axios, { type AxiosInstance, isAxiosError } from "axios";
import { VT_API_BASE_URL } from "./config";
import type { VtQuotesRequest, VtQuotesResponse, VtStatusResponse } from "./types";

export class VtUnsupportedRouteError extends Error {
  constructor(message = "Unsupported route") {
    super(message);
    this.name = "VtUnsupportedRouteError";
  }
}

export class LayerzeroVtApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: VT_API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private handleApiError(error: unknown): never {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as { message?: string; code?: number; } | undefined;
      const message = data?.message || error.message;

      if (status === 422 || data?.code === 422) {
        throw new VtUnsupportedRouteError(message || "Unsupported route");
      }
      if (status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(message || "LayerZero VT API request failed");
    }
    throw error;
  }

  async getQuotes(body: VtQuotesRequest): Promise<VtQuotesResponse> {
    try {
      const res = await this.client.post<VtQuotesResponse>("/quotes", body);

      if (res.data?.error) {
        const message = res.data.error.message || "Quote request failed";
        if (message.toLowerCase().includes("unsupported")) {
          throw new VtUnsupportedRouteError(message);
        }
        throw new Error(message);
      }

      return res.data;
    } catch (error) {
      if (error instanceof VtUnsupportedRouteError) {
        throw error;
      }
      this.handleApiError(error);
    }
  }

  async submitSignature(quoteId: string, signatures: string[]) {
    try {
      await this.client.post("/submit-signature", {
        quoteId,
        signatures,
      });
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async getStatus(quoteId: string, txHash?: string): Promise<VtStatusResponse> {
    try {
      const res = await this.client.get<VtStatusResponse>(`/status/${encodeURIComponent(quoteId)}`, {
        params: txHash ? { txHash } : void 0,
      });
      return res.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return { status: "UNKNOWN" };
      }
      this.handleApiError(error);
    }
  }
}

export const layerzeroVtApi = new LayerzeroVtApi();
