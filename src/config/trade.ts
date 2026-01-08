export const TradeStatus = {
  Pending: 0,
  Success: 1,
  Expired: 2,
  Failed: 3,
  Waiting: 4,
} as const;

export type TradeStatus = (typeof TradeStatus)[keyof typeof TradeStatus];

export const TradeProject = {
  OneClick: 0,
  USDT0: 1,
  CCTP: 2,
};

export type TradeProject = (typeof TradeProject)[keyof typeof TradeProject];
