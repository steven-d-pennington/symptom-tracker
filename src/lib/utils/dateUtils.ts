/**
 * Format a timestamp as relative time (e.g., "2 hours ago", "1 day ago")
 * Simple implementation without external dependencies
 */
export function formatDistanceToNow(date: Date): string {
  const now = Date.now();
  const timestamp = date.getTime();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "just now";
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
  } else if (diffDay < 30) {
    return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  } else {
    const diffMonth = Math.floor(diffDay / 30);
    return `${diffMonth} month${diffMonth !== 1 ? "s" : ""} ago`;
  }
}