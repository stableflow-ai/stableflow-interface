import oneClickService from "./oneclick";
import usdt0Service from "./usdt0";
import cctpService from "./cctp";
import usdt0OneClickService from "./usdt0-oneclick";
import { Service } from "./constants";


export const ServiceMap: Record<Service, any> = {
  [Service.OneClick]: oneClickService,
  [Service.Usdt0]: usdt0Service,
  [Service.CCTP]: cctpService,
  [Service.Usdt0OneClick]: usdt0OneClickService,
};

export const ServiceLogoMap: Record<Service, string> = {
  [Service.OneClick]: "/bridge/logo-near-intents.svg",
  [Service.Usdt0]: "/bridge/logo-usdt0.svg",
  [Service.CCTP]: "/bridge/logo-circle.avif",
  [Service.Usdt0OneClick]: "/bridge/logo-usdt0-near-intents.svg",
};
