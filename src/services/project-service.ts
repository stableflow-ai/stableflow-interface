import usdt0Service from "@/services/usdt0";
import pyusdService from "@/services/pyusd";
import layerzeroVtService from "@/services/layerzero-vt";
import { getRealService, TradeProject } from "@/config/trade";
import { Service } from "./constants";

export const getLayerzeroProjectService = (project: TradeProject, fromToken: { symbol: string; }) => {
  const realService = getRealService(project, fromToken);

  if (realService.service === Service.Usdt0) {
    return {
      ...realService,
      quoteService: usdt0Service,
    };
  }
  if (realService.service === Service.Pyusd) {
    return {
      ...realService,
      quoteService: pyusdService,
    };
  }
  if (realService.service === Service.LayerzeroVt) {
    return {
      ...realService,
      quoteService: layerzeroVtService,
    };
  }
  return {
    ...realService,
    quoteService: null,
  };
};
