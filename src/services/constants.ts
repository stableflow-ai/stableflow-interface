export const Service = {
  OneClick: "oneclick",
  Usdt0: "usdt0",
  CCTP: "cctp",
  Usdt0OneClick: "usdt0-oneclick",
  OneClickUsdt0: "oneclick-usdt0",
} as const;
export type Service = (typeof Service)[keyof typeof Service];

export const ServiceBackend: Record<Service, string> = {
  [Service.OneClick]: "nearintents",
  [Service.Usdt0]: "layerzero",
  [Service.CCTP]: "cctp",
  [Service.Usdt0OneClick]: "zerointent",
  [Service.OneClickUsdt0]: "intentzero",
} as const;
