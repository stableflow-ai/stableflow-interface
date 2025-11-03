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
