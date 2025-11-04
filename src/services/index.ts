import oneClickService from "./oneclick";
import usdt0Service from "./usdt0";

export type ServiceType = "oneclick" | "usdt0";

export const Service = {
  OneClick: "oneclick",
  Usdt0: "usdt0",
} as const;

export const ServiceMap: Record<ServiceType, any> = {
  [Service.OneClick]: oneClickService,
  [Service.Usdt0]: usdt0Service,
};

export const ServiceLogoMap: Record<ServiceType, string> = {
  [Service.OneClick]: "/src/assets/near-intents-logo.png",
  [Service.Usdt0]: "/bridge/logo-usdt0.svg",
};
