import oneClickService from "./oneclick";

import { Service } from "./constants";
import { getStableflowRouteLogo } from "@/utils/format/logo";

export const ServiceMap: Record<Service, any> = {
  [Service.OneClick]: oneClickService,
  [Service.Usdt0]: {},
  [Service.CCTP]: {},
  [Service.Usdt0OneClick]: {},
  [Service.OneClickUsdt0]: {},
  [Service.Native]: {},
  [Service.FraxZero]: {},
  [Service.FraxZeroOneClick]: {},
  [Service.OneClickFraxZero]: {},
};

export const ServiceLogoMap: Record<Service, string> = {
  [Service.OneClick]: getStableflowRouteLogo("logo-near-intents.svg"),
  [Service.Usdt0]:getStableflowRouteLogo("logo-usdt0.svg"),
  [Service.CCTP]:  getStableflowRouteLogo("logo-circle.avif"),
  [Service.Usdt0OneClick]:getStableflowRouteLogo("logo-usdt0-near-intents.svg"),
  [Service.OneClickUsdt0]: getStableflowRouteLogo("logo-near-intents-usdt0.svg"),
  [Service.Native]: getStableflowRouteLogo("logo-native.svg"),
  [Service.FraxZero]: getStableflowRouteLogo("logo-fraxzero.svg"),
  [Service.FraxZeroOneClick]: getStableflowRouteLogo("logo-fraxzero-near-intents.svg"),
  [Service.OneClickFraxZero]: getStableflowRouteLogo("logo-near-intents-fraxzero.svg"),
};
