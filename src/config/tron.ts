// Tron Energy rental receiving address
export const TRON_RENTAL_RECEIVING_ADDRESS = "TGKiSaDG7wp5N4T9SJweotgfgwmxDTgjMi";

// Tron Energy rental fee (TRX)
export const TRON_RENTAL_FEE = {
  // Account without referral code
  Normal: 0.2, // 10 TRX
  // Account with referral code
  Referral: 7, // 7 TRX
};

export const EnergyAmounts = {
  // Account without USDT
  New: 131000,
  // Account with USDT
  Used: 65000,
};

export const BridgeFees = {
  Normal: 0.2, // 2 USDT
  Referral: 1, // 1 USDT
};

export const TronTransferStepStatus = {
  // Pay Energy Rental Fee
  EnergyPayment: 0,
  // Waiting for Payment Confirmation
  EnergyPaying: 1,
  // Requesting Energy
  EnergyRequest: 2,
  // Energy Ready
  EnergyReady: 3,
  // Opening Wallet for Authorization
  WalletPrompt: 4,
  // Broadcasting Transaction and Cross-Chain Settlement
  Broadcasting: 5,
} as const;

export type TronTransferStepStatus = (typeof TronTransferStepStatus)[keyof typeof TronTransferStepStatus];
