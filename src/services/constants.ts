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

  const IS_PAUSE_ALL = import.meta.env.VITE_ROUTE_PAUSE === "true";
  const IS_PAUSE_NEAR_INTENTS = import.meta.env.VITE_ROUTE_PAUSE_NEAR_INTENTS === "true";
  const IS_PAUSE_USDT0 = import.meta.env.VITE_ROUTE_PAUSE_USDT0 === "true";
  const IS_PAUSE_CCTP = import.meta.env.VITE_ROUTE_PAUSE_CCTP === "true";
  const IS_PAUSE_FRAXZERO = import.meta.env.VITE_ROUTE_PAUSE_FRAXZERO === "true";
  const IS_PAUSE_NATIVE = import.meta.env.VITE_ROUTE_PAUSE_NATIVE === "true";

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
