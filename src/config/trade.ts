import { Service, ServiceLogoMap, ServiceLogoSimpleMap } from "@/services/constants";

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
  Usdt0: 1,
  CCTP: 2,
  FraxZero: 6,
  FraxZeroOneClick: 7,
  OneClickFraxZero: 8,
  Usdt0OneClick: 3,
  OneClickUsdt0: 4,
  Native: 5,
} as const;

export type TradeProject = (typeof TradeProject)[keyof typeof TradeProject];

export const TradeProjectMap: Record<TradeProject, { logo: string; logoSimple: string; name: string; service: Service }> = {
  [TradeProject.OneClick]: {
    logo: ServiceLogoMap[Service.OneClick],
    logoSimple: ServiceLogoSimpleMap[Service.OneClick],
    name: "OneClick",
    service: Service.OneClick,
  },
  [TradeProject.Usdt0]: {
    logo: ServiceLogoMap[Service.Usdt0],
    logoSimple: ServiceLogoSimpleMap[Service.Usdt0],
    name: "USDT0",
    service: Service.Usdt0,
  },
  [TradeProject.CCTP]: {
    logo: ServiceLogoMap[Service.CCTP],
    logoSimple: ServiceLogoSimpleMap[Service.CCTP],
    name: "CCTP",
    service: Service.CCTP,
  },
  [TradeProject.FraxZero]: {
    logo: ServiceLogoMap[Service.FraxZero],
    logoSimple: ServiceLogoSimpleMap[Service.FraxZero],
    name: "FraxZero",
    service: Service.FraxZero,
  },
  [TradeProject.FraxZeroOneClick]: {
    logo: ServiceLogoMap[Service.FraxZeroOneClick],
    logoSimple: ServiceLogoSimpleMap[Service.FraxZeroOneClick],
    name: "FraxZeroOneClick",
    service: Service.FraxZeroOneClick,
  },
  [TradeProject.OneClickFraxZero]: {
    logo: ServiceLogoMap[Service.OneClickFraxZero],
    logoSimple: ServiceLogoSimpleMap[Service.OneClickFraxZero],
    name: "OneClickFraxZero",
    service: Service.OneClickFraxZero,
  },
  [TradeProject.Usdt0OneClick]: {
    logo: ServiceLogoMap[Service.Usdt0OneClick],
    logoSimple: ServiceLogoSimpleMap[Service.Usdt0OneClick],
    name: "USDT0OneClick",
    service: Service.Usdt0OneClick,
  },
  [TradeProject.OneClickUsdt0]: {
    logo: ServiceLogoMap[Service.OneClickUsdt0],
    logoSimple: ServiceLogoSimpleMap[Service.OneClickUsdt0],
    name: "OneClickUSDT0",
    service: Service.OneClickUsdt0,
  },
  [TradeProject.Native]: {
    logo: ServiceLogoMap[Service.Native],
    logoSimple: ServiceLogoSimpleMap[Service.Native],
    name: "Native",
    service: Service.Native,
  },
};
