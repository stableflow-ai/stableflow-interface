import Big from "big.js";

export function formatDuration(duration?: number, options?: { precision?: number; }) {
  const { precision = 2 } = options || {};

  if (!duration) {
    return "-";
  }
  if (Big(duration).lte(60)) {
    return `${duration} s`;
  }
  if (Big(duration).lte(3600)) {
    return `${Big(duration).div(60).toFixed(precision)} min`;
  }
  return `${Big(duration).div(3600).toFixed(precision)} hour`;
}
