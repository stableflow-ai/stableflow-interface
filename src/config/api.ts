export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "https://api.stableflow.ai";
export const IS_PRODUCTION = import.meta.env.VITE_BASE_API_URL === "https://api.stableflow.ai";
export const LAYERZERO_VT_API_URL = `${BASE_API_URL}/v1/layerzero`;
export const DB3_API_URL = "https://api.db3.app/api";
export const TRON_ENERGY_API_URL = "https://trxx-bridge.aidai524.workers.dev";

export const PROXY_RPC_DOMAIN = import.meta.env.VITE_PRC_PROXY_HOST || "rpcs.stableflow.ai";
