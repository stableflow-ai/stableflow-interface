import oneClickService from "./oneclick";
import usdt0Service from "./usdt0";
import cctpService from "./cctp";

export type ServiceType = "oneclick" | "usdt0" | "cctp";

export const Service = {
  OneClick: "oneclick",
  Usdt0: "usdt0",
  CCTP: "cctp",
} as const;

export const ServiceMap: Record<ServiceType, any> = {
  [Service.OneClick]: oneClickService,
  [Service.Usdt0]: usdt0Service,
  [Service.CCTP]: cctpService,
};

export const ServiceLogoMap: Record<ServiceType, string> = {
  [Service.OneClick]: "/bridge/logo-near-intents.png",
  [Service.Usdt0]: "/bridge/logo-usdt0.svg",
  [Service.CCTP]: "/bridge/logo-circle.avif",
};
