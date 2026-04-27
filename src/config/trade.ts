import { Service } from "@/services/constants";
import { getStableflowRouteLogo } from "@/utils/format/logo";

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

export const TradeProjectMap: Record<TradeProject, { logo: string; name: string; service: Service }> = {
  [TradeProject.OneClick]: { logo: getStableflowRouteLogo("logo-near-intents.svg"), name: "OneClick", service: Service.OneClick },
  [TradeProject.Usdt0]: { logo: getStableflowRouteLogo("logo-usdt0.svg"), name: "USDT0", service: Service.Usdt0 },
  [TradeProject.CCTP]: { logo: getStableflowRouteLogo("logo-circle.avif"), name: "CCTP", service: Service.CCTP },
  [TradeProject.FraxZero]: { logo: getStableflowRouteLogo("logo-fraxzero.svg"), name: "FraxZero", service: Service.FraxZero },
  [TradeProject.FraxZeroOneClick]: { logo: getStableflowRouteLogo("logo-fraxzero-near-intents.svg"), name: "FraxZeroOneClick", service: Service.FraxZeroOneClick },
  [TradeProject.OneClickFraxZero]: { logo: getStableflowRouteLogo("logo-near-intents-fraxzero.svg"), name: "OneClickFraxZero", service: Service.OneClickFraxZero },
  [TradeProject.Usdt0OneClick]: { logo: getStableflowRouteLogo("logo-usdt0-near-intents.svg"), name: "USDT0OneClick", service: Service.Usdt0OneClick },
  [TradeProject.OneClickUsdt0]: { logo: getStableflowRouteLogo("logo-near-intents-usdt0.svg"), name: "OneClickUSDT0", service: Service.OneClickUsdt0 },
  [TradeProject.Native]: { logo: getStableflowRouteLogo("logo-native.svg"), name: "Native", service: Service.Native },
};
