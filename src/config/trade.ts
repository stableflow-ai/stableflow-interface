export const TradeStatus = {
  Pending: 0,
  Success: 1,
  Expired: 2,
  Failed: 3,
  Continue: 4,
} as const;

export type TradeStatus = (typeof TradeStatus)[keyof typeof TradeStatus];

export const TradeStatusMap: Record<TradeStatus, { value: TradeStatus; name: string; }> = {
  [TradeStatus.Pending]: { value: TradeStatus.Pending, name: "Pending" },
  [TradeStatus.Success]: { value: TradeStatus.Success, name: "Success" },
  [TradeStatus.Expired]: { value: TradeStatus.Expired, name: "Expired" },
  [TradeStatus.Failed]: { value: TradeStatus.Failed, name: "Failed" },
  [TradeStatus.Continue]: { value: TradeStatus.Continue, name: "Waiting" },
};

export const TradeProject = {
  OneClick: 0,
  USDT0: 1,
  CCTP: 2,
};

export type TradeProject = (typeof TradeProject)[keyof typeof TradeProject];

export const TradeProjectMap: Record<TradeProject, { logo: string; name: string; }> = {
  [TradeProject.OneClick]: { logo: "/bridge/logo-near-intents.png", name: "OneClick" },
  [TradeProject.USDT0]: { logo: "/bridge/logo-usdt0.svg", name: "USDT0" },
  [TradeProject.CCTP]: { logo: "/bridge/logo-circle.avif", name: "CCTP" },
};
