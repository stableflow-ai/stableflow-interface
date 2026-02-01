export const TradeStatus = {
  Pending: 0,
  Success: 1,
  Failed: 2,
  Confirming: 3,
  Continue: 4,
} as const;

export type TradeStatus = (typeof TradeStatus)[keyof typeof TradeStatus];

export const TradeStatusMap: Record<TradeStatus, { value: TradeStatus; name: string; }> = {
  [TradeStatus.Pending]: { value: TradeStatus.Pending, name: "Pending" },
  [TradeStatus.Success]: { value: TradeStatus.Success, name: "Success" },
  [TradeStatus.Failed]: { value: TradeStatus.Failed, name: "Failed" },
  [TradeStatus.Confirming]: { value: TradeStatus.Confirming, name: "Confirming" },
  [TradeStatus.Continue]: { value: TradeStatus.Continue, name: "Waiting" },
};

export const TradeProject = {
  OneClick: 0,
  USDT0: 1,
  CCTP: 2,
};

export type TradeProject = (typeof TradeProject)[keyof typeof TradeProject];
