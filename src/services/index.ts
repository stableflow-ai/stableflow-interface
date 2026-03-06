import oneClickService from "./oneclick";

import { Service } from "./constants";

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
  [Service.OneClick]: "/bridge/logo-near-intents.svg",
  [Service.Usdt0]: "/bridge/logo-usdt0.svg",
  [Service.CCTP]: "/bridge/logo-circle.avif",
  [Service.Usdt0OneClick]: "/bridge/logo-usdt0-near-intents.svg",
  [Service.OneClickUsdt0]: "/bridge/logo-near-intents-usdt0.svg",
  [Service.Native]: "/bridge/logo-native.svg",
  [Service.FraxZero]: "/bridge/logo-fraxzero.svg",
  [Service.FraxZeroOneClick]: "/bridge/logo-fraxzero.svg",
  [Service.OneClickFraxZero]: "/bridge/logo-fraxzero.svg",
};
