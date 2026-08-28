/** Format a duration in seconds as `m:ss` (or `h:mm:ss` past an hour). */
export function formatDuration(seconds?: number | null): string {
  if (seconds == null || !isFinite(seconds) || seconds < 0) return '--:--';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = s.toString().padStart(2, '0');
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${ss}`;
  return `${m}:${ss}`;
}

/** Format milliseconds (player progress) as `m:ss`. */
export function formatMs(ms: number): string {
  return formatDuration(Math.floor(ms / 1000));
}
