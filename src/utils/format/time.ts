import Big from "big.js";

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;

export function formatDuration(duration?: number, options?: { precision?: number; compound?: boolean }) {
  const { precision = 2, compound = false } = options || {};

  if (!duration) {
    return "-";
  }

  if (compound) {
    const total = Math.floor(duration);
    if (total >= SECONDS_PER_DAY) {
      const days = Math.floor(total / SECONDS_PER_DAY);
      const hours = Math.floor((total % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
    if (total >= SECONDS_PER_HOUR) {
      const hours = Math.floor(total / SECONDS_PER_HOUR);
      const mins = Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    if (total >= SECONDS_PER_MINUTE) {
      const mins = Math.floor(total / SECONDS_PER_MINUTE);
      const secs = total % SECONDS_PER_MINUTE;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${total}s`;
  }

  if (Big(duration).lte(SECONDS_PER_MINUTE)) {
    return `${duration} s`;
  }
  if (Big(duration).lte(SECONDS_PER_HOUR)) {
    return `${Big(duration).div(SECONDS_PER_MINUTE).toFixed(precision)} min`;
  }
  return `${Big(duration).div(SECONDS_PER_HOUR).toFixed(precision)} hour`;
}
