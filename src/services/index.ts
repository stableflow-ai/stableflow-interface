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
