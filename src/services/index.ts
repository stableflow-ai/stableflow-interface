import oneClickService from "./oneclick";
import usdt0Service from "./usdt0";
import cctpService from "./cctp";
import fraxZeroService from "./fraxzero";
import fraxZeroOneClickService from "./fraxzero/to-oneclick";
import oneClickFraxZeroService from "./fraxzero/from-oneclick";
import usdt0OneClickService from "./usdt0-oneclick";
import oneClickUsdt0Service from "./oneclick-usdt0";
import nativeService from "./native";
import { Service } from "./constants";
import { getStableflowRouteLogo } from "@/utils/format/logo";


export const ServiceMap: Record<Service, any> = {
  [Service.OneClick]: oneClickService,
  [Service.Usdt0]: usdt0Service,
  [Service.CCTP]: cctpService,
  [Service.FraxZero]: fraxZeroService,
  [Service.FraxZeroOneClick]: fraxZeroOneClickService,
  [Service.OneClickFraxZero]: oneClickFraxZeroService,
  [Service.Usdt0OneClick]: usdt0OneClickService,
  [Service.OneClickUsdt0]: oneClickUsdt0Service,
  [Service.Native]: nativeService,
};

export const ServiceLogoMap: Record<Service, string> = {
  [Service.OneClick]: getStableflowRouteLogo("logo-near-intents.svg"),
  [Service.Usdt0]: getStableflowRouteLogo("logo-usdt0.svg"),
  [Service.CCTP]: getStableflowRouteLogo("logo-circle.avif"),
  [Service.FraxZero]: getStableflowRouteLogo("logo-fraxzero.svg"),
  [Service.FraxZeroOneClick]: getStableflowRouteLogo("logo-fraxzero-near-intents.svg"),
  [Service.OneClickFraxZero]: getStableflowRouteLogo("logo-near-intents-fraxzero.svg"),
  [Service.Usdt0OneClick]: getStableflowRouteLogo("logo-usdt0-near-intents.svg"),
  [Service.OneClickUsdt0]: getStableflowRouteLogo("logo-near-intents-usdt0.svg"),
  [Service.Native]: getStableflowRouteLogo("logo-native.svg"),
};
