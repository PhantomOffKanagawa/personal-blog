// Utilities for parsing/formatting durations and paces

export function parseDurationToMinutes(input: unknown): number | undefined {
  if (input == null) return undefined;
  if (typeof input === 'number' && Number.isFinite(input)) return input;
  if (typeof input !== 'string') return undefined;
  const s = input.trim();
  if (!s) return undefined;
  // Support H:MM:SS or MM:SS (also single-digit parts like 1:2:3)
  const parts = s.split(':').map((p) => p.trim());
  if (parts.some((p) => p === '' || isNaN(Number(p)))) return undefined;
  let minutes = 0;
  if (parts.length === 3) {
    const [h, m, sec] = parts.map((p) => Number(p));
    minutes = h * 60 + m + sec / 60;
    return Number.isFinite(minutes) ? minutes : undefined;
  }
  if (parts.length === 2) {
    const [m, sec] = parts.map((p) => Number(p));
    minutes = m + sec / 60;
    return Number.isFinite(minutes) ? minutes : undefined;
  }
  // Fallback: a plain number string means minutes
  const num = Number(s);
  return Number.isFinite(num) ? num : undefined;
}

export function formatMinSec(minutes: number): string {
  const sign = minutes < 0 ? '-' : '';
  let m = Math.abs(minutes);
  const mm = Math.floor(m);
  const ss = Math.round((m - mm) * 60);
  return `${sign}${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export function formatHMS(minutes: number): string {
  const sign = minutes < 0 ? '-' : '';
  let m = Math.abs(minutes);
  const h = Math.floor(m / 60);
  const rem = m - h * 60;
  const mm = Math.floor(rem);
  const ss = Math.round((rem - mm) * 60);
  return `${sign}${h}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export function isClockString(input: unknown): boolean {
  return typeof input === 'string' && input.includes(':');
}
