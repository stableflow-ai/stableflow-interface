import { Service, ServiceBackend } from "@/services/constants";

export const TradeStatus = {
  Pending: 0,
  Success: 1,
  Failed: 2,
  Confirming: 3,
  Continue: 4,
  LayerzeroSubmitted: 5,
} as const;

export type TradeStatus = (typeof TradeStatus)[keyof typeof TradeStatus];

export const TradeStatusMap: Record<TradeStatus, { value: TradeStatus; name: string; }> = {
  [TradeStatus.Pending]: { value: TradeStatus.Pending, name: "Pending" },
  [TradeStatus.Success]: { value: TradeStatus.Success, name: "Success" },
  [TradeStatus.Failed]: { value: TradeStatus.Failed, name: "Failed" },
  [TradeStatus.Confirming]: { value: TradeStatus.Confirming, name: "Confirming" },
  [TradeStatus.Continue]: { value: TradeStatus.Continue, name: "Waiting" },
  [TradeStatus.LayerzeroSubmitted]: { value: TradeStatus.LayerzeroSubmitted, name: "LayerzeroSubmitted" },
};

export const TradeProject = {
  OneClick: 0,
  USDT0: 1,
  CCTP: 2,
  USDT0OneClick: 3,
  OneClickUSDT0: 4,
  Native: 5,
  FraxZero: 6,
  FraxZeroOneClick: 7,
  OneClickFraxZero: 8,
};

export type TradeProject = (typeof TradeProject)[keyof typeof TradeProject];

interface TradeProjectConfig {
  logo: string;
  name: string;
  service: Service;
  tokens: string[];
  value: string;
}

export const TradeProjectMap: Record<TradeProject, TradeProjectConfig> = {
  [TradeProject.OneClick]: {
    logo: "/bridge/logo-near-intents.svg",
    name: "OneClick",
    service: Service.OneClick,
    tokens: ["USDT", "USDC"],
    value: ServiceBackend[Service.OneClick],
  },
  [TradeProject.USDT0]: {
    logo: "/bridge/logo-usdt0.svg",
    name: "USDT0",
    service: Service.Usdt0,
    tokens: ["USDT"],
    value: ServiceBackend[Service.Usdt0],
  },
  [TradeProject.CCTP]: {
    logo: "/bridge/logo-circle.avif",
    name: "CCTP",
    service: Service.CCTP,
    tokens: ["USDC"],
    value: ServiceBackend[Service.CCTP],
  },
  [TradeProject.USDT0OneClick]: {
    logo: "/bridge/logo-usdt0-near-intents.svg",
    name: "USDT0OneClick",
    service: Service.Usdt0OneClick,
    tokens: ["USDT", "USDC"],
    value: ServiceBackend[Service.Usdt0OneClick],
  },
  [TradeProject.OneClickUSDT0]: {
    logo: "/bridge/logo-near-intents-usdt0.svg",
    name: "OneClickUSDT0",
    service: Service.OneClickUsdt0,
    tokens: ["USDT", "USDC"],
    value: ServiceBackend[Service.OneClickUsdt0],
  },
  [TradeProject.Native]: {
    logo: "/bridge/logo-native.svg",
    name: "Native",
    service: Service.Native,
    tokens: ["USDT", "USDC"],
    value: ServiceBackend[Service.Native],
  },
  [TradeProject.FraxZero]: {
    logo: "/bridge/logo-fraxzero.svg",
    name: "Native",
    service: Service.FraxZero,
    tokens: ["frxUSD"],
    value: ServiceBackend[Service.FraxZero],
  },
  [TradeProject.FraxZeroOneClick]: {
    logo: "/bridge/logo-fraxzero.svg",
    name: "FraxZeroOneClick",
    service: Service.FraxZeroOneClick,
    tokens: ["frxUSD", "USDT", "USDC"],
    value: ServiceBackend[Service.FraxZeroOneClick],
  },
  [TradeProject.OneClickFraxZero]: {
    logo: "/bridge/logo-fraxzero.svg",
    name: "OneClickFraxZero",
    service: Service.OneClickFraxZero,
    tokens: ["frxUSD", "USDT", "USDC"],
    value: ServiceBackend[Service.OneClickFraxZero],
  },
};
