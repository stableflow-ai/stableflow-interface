import dayjs from "@/libs/dayjs";

export function formatTimeAgo(date: string | dayjs.Dayjs | number) {
  const now = dayjs();
  const targetDate = dayjs(date);
  const diff = now.diff(targetDate, 'second');

  if (diff < 60) {
    // Within 1 minute, display "Xs ago"
    return `${diff}s ago`;
  }
  if (diff < 3600) {
    // Within 1 hour, display "Xmins ago"
    const minutes = Math.floor(diff / 60);
    return `${minutes}min${minutes > 1 ? 's' : ''} ago`;
  }
  if (diff < 86400) {
    // Within 1 day, display "Xhr ago"
    const hours = Math.floor(diff / 3600);
    return `${hours}hr${hours > 1 ? 's' : ''} ago`;
  }
  if (diff < 2592000) {
    // Within 1 month, display "Xd ago"
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  }
  if (diff < 31536000) {
    // Within 1 year, display "Xmonth ago"
    const months = Math.floor(diff / 2592000);
    return `${months}month${months > 1 ? 's' : ''} ago`;
  }
  // Over 1 year, display "X years ago"
  const years = Math.floor(diff / 31536000);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

/**
 * Format a duration given in seconds into a human-readable string.
 * - < 60s: "xx seconds"
 * - < 1h:  "xx.xx minutes"
 * - < 1d:  "xx.xx hours"
 * - < 30d: "xx.xx days"
 * - >= 30d: "xx.xx months"
 */
export function formatDuration(seconds: number, options?: { prefix?: string; }): string {
  const { prefix = "" } = options || {};

  if (!seconds) {
    return "-";
  }

  if (seconds < 0) seconds = 0;

  if (seconds < 60) {
    const s = Math.floor(seconds);
    return `${prefix}${s} second${s !== 1 ? 's' : ''}`;
  }

  if (seconds < 3600) {
    const minutes = (seconds / 60).toFixed(2).replace(/\.?0+$/, '');
    return `${prefix}${minutes} minutes`;
  }

  if (seconds < 86400) {
    const hours = (seconds / 3600).toFixed(2).replace(/\.?0+$/, '');
    return `${prefix}${hours} hours`;
  }

  if (seconds < 2592000) {
    const days = (seconds / 86400).toFixed(2).replace(/\.?0+$/, '');
    return `${prefix}${days} days`;
  }

  const months = (seconds / 2592000).toFixed(2).replace(/\.?0+$/, '');
  return `${prefix}${months} months`;
}