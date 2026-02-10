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
 * Output format: "xx days xx hours xx mins xx s"
 * - Only non-zero parts are included.
 * - If the duration is 0 or falsy, returns "-".
 */
export function formatDuration(seconds: number, options?: { prefix?: string; }): string {
  const { prefix = "" } = options || {};

  if (!seconds) {
    return "-";
  }

  if (seconds < 0) seconds = 0;

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (mins > 0) parts.push(`${mins} min${mins !== 1 ? 's' : ''}`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} s`);

  return `${prefix}${parts.join(' ')}`;
}