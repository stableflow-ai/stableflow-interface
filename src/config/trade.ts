import { Service } from "@/services/constants";

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
  FraxZero: 6,
  USDT0OneClick: 3,
  OneClickUSDT0: 4,
  Native: 5,
};

export type TradeProject = (typeof TradeProject)[keyof typeof TradeProject];

export const TradeProjectMap: Record<TradeProject, { logo: string; name: string; service: Service }> = {
  [TradeProject.OneClick]: { logo: "/bridge/logo-near-intents.svg", name: "OneClick", service: Service.OneClick },
  [TradeProject.USDT0]: { logo: "/bridge/logo-usdt0.svg", name: "USDT0", service: Service.Usdt0 },
  [TradeProject.CCTP]: { logo: "/bridge/logo-circle.avif", name: "CCTP", service: Service.CCTP },
  [TradeProject.FraxZero]: { logo: "/bridge/logo-fraxzero.svg", name: "FraxZero", service: Service.FraxZero },
  [TradeProject.USDT0OneClick]: { logo: "/bridge/logo-usdt0-near-intents.svg", name: "USDT0OneClick", service: Service.Usdt0OneClick },
  [TradeProject.OneClickUSDT0]: { logo: "/bridge/logo-near-intents-usdt0.svg", name: "OneClickUSDT0", service: Service.OneClickUsdt0 },
  [TradeProject.Native]: { logo: "/bridge/logo-native.svg", name: "Native", service: Service.Native },
};
