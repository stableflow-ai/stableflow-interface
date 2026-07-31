/** Default OFT sharedDecimals across LayerZero / FraxZero deployments. */
export const OFT_SHARED_DECIMALS = 6;

/**
 * Floor an amount in local decimals to the OFT sharedDecimals precision.
 * Matches on-chain `_removeDust`: `(amountLD / decimalConversionRate) * decimalConversionRate`
 * where `decimalConversionRate = 10^(localDecimals - sharedDecimals)`.
 */
export function removeOftDust(
  amountWei: string | number | bigint,
  localDecimals: number,
  sharedDecimals: number = OFT_SHARED_DECIMALS,
): string {
  const amount = BigInt(amountWei.toString());
  if (localDecimals <= sharedDecimals) {
    return amount.toString();
  }
  const rate = 10n ** BigInt(localDecimals - sharedDecimals);
  return ((amount / rate) * rate).toString();
}
