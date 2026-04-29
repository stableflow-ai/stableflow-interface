import { getStableflowRouteLogo } from "@/utils/format/logo";

export const Service = {
  OneClick: "oneclick",
  Usdt0: "usdt0",
  CCTP: "cctp",
  FraxZero: "fraxzero",
  FraxZeroOneClick: "fraxzero-oneclick",
  OneClickFraxZero: "oneclick-fraxzero",
  Usdt0OneClick: "usdt0-oneclick",
  OneClickUsdt0: "oneclick-usdt0",
  Native: "native",
} as const;
export type Service = (typeof Service)[keyof typeof Service];

export const ServiceBackend: Record<Service, string> = {
  [Service.OneClick]: "nearintents",
  [Service.Usdt0]: "layerzero",
  [Service.CCTP]: "cctp",
  [Service.FraxZero]: "fraxzero",
  [Service.FraxZeroOneClick]: "fraxzerointent",
  [Service.OneClickFraxZero]: "intentfraxzero",
  [Service.Usdt0OneClick]: "zerointent",
  [Service.OneClickUsdt0]: "intentzero",
  [Service.Native]: "native",
} as const;

export const getRouteStatus = (service: Service): { disabled: boolean; } => {
  const result = { disabled: false };

  // const IS_PAUSE_ALL = import.meta.env.VITE_ROUTE_PAUSE === "true";
  // const IS_PAUSE_NEAR_INTENTS = import.meta.env.VITE_ROUTE_PAUSE_NEAR_INTENTS === "true";
  // const IS_PAUSE_USDT0 = import.meta.env.VITE_ROUTE_PAUSE_USDT0 === "true";
  // const IS_PAUSE_CCTP = import.meta.env.VITE_ROUTE_PAUSE_CCTP === "true";
  // const IS_PAUSE_FRAXZERO = import.meta.env.VITE_ROUTE_PAUSE_FRAXZERO === "true";
  // const IS_PAUSE_NATIVE = import.meta.env.VITE_ROUTE_PAUSE_NATIVE === "true";

  const IS_PAUSE_ALL = false;
  const IS_PAUSE_NEAR_INTENTS = false;
  const IS_PAUSE_USDT0 = false;
  const IS_PAUSE_CCTP = false;
  const IS_PAUSE_FRAXZERO = false;
  const IS_PAUSE_NATIVE = false;

  if (IS_PAUSE_ALL) {
    result.disabled = true;
    return result;
  }

  if (service === Service.CCTP) {
    if (IS_PAUSE_CCTP) {
      result.disabled = true;
      return result;
    }
  }

  if (service === Service.FraxZero) {
    if (IS_PAUSE_FRAXZERO) {
      result.disabled = true;
      return result;
    }
  }

  if (([Service.FraxZeroOneClick, Service.OneClickFraxZero] as Service[]).includes(service)) {
    if (IS_PAUSE_NEAR_INTENTS || IS_PAUSE_FRAXZERO) {
      result.disabled = true;
      return result;
    }
  }

  if (service === Service.Native) {
    if (IS_PAUSE_NATIVE) {
      result.disabled = true;
      return result;
    }
  }

  if (service === Service.OneClick) {
    if (IS_PAUSE_NEAR_INTENTS) {
      result.disabled = true;
      return result;
    }
  }

  if (service === Service.Usdt0) {
    if (IS_PAUSE_USDT0) {
      result.disabled = true;
      return result;
    }
  }

  if (([Service.Usdt0OneClick, Service.OneClickUsdt0] as Service[]).includes(service)) {
    if (IS_PAUSE_NEAR_INTENTS || IS_PAUSE_USDT0) {
      result.disabled = true;
      return result;
    }
  }

  return result;
};

export const ServiceLogoMap: Record<Service, string> = {
  [Service.OneClick]: getStableflowRouteLogo("logo-near-intents.svg"),
  [Service.Usdt0]: getStableflowRouteLogo("logo-usdt0.svg"),
  [Service.CCTP]: getStableflowRouteLogo("logo-circle.svg"),
  [Service.FraxZero]: getStableflowRouteLogo("logo-fraxzero-2.svg"),
  [Service.FraxZeroOneClick]: getStableflowRouteLogo("logo-fraxzero-near-intents-2.svg"),
  [Service.OneClickFraxZero]: getStableflowRouteLogo("logo-near-intents-fraxzero-2.svg"),
  [Service.Usdt0OneClick]: getStableflowRouteLogo("logo-usdt0-near-intents-2.svg"),
  [Service.OneClickUsdt0]: getStableflowRouteLogo("logo-near-intents-usdt0-2.svg"),
  [Service.Native]: getStableflowRouteLogo("logo-native.svg"),
};

export const ServiceLogoSimpleMap: Record<Service, string> = {
  [Service.OneClick]: getStableflowRouteLogo("logo-near-intents-simple.svg"),
  [Service.Usdt0]: getStableflowRouteLogo("logo-usdt0-simple.svg"),
  [Service.CCTP]: getStableflowRouteLogo("logo-circle-simple.svg"),
  [Service.FraxZero]: getStableflowRouteLogo("logo-fraxzero-simple.svg"),
  [Service.FraxZeroOneClick]: getStableflowRouteLogo("logo-fraxzero-near-intents-simple.svg"),
  [Service.OneClickFraxZero]: getStableflowRouteLogo("logo-near-intents-fraxzero-simple.svg"),
  [Service.Usdt0OneClick]: getStableflowRouteLogo("logo-usdt0-near-intents-simple.svg"),
  [Service.OneClickUsdt0]: getStableflowRouteLogo("logo-near-intents-usdt0-simple.svg"),
  [Service.Native]: getStableflowRouteLogo("logo-native-simple.svg"),
};
