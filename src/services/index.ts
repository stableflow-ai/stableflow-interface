import oneClickService from "./oneclick";
import * as usdt0Service from "./usdt0";

export const Service = {
  OneClick: "oneclick",
  Usdt0: "usdt0",
} as const;

export const ServiceMap = {
  [Service.OneClick]: oneClickService,
  [Service.Usdt0]: usdt0Service,
};
