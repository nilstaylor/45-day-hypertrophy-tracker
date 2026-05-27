// Local-date utilities (no UTC drift).

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(startKey, endKey) {
  // Inclusive day count: same day => 1.
  const [sy, sm, sd] = startKey.split('-').map(Number);
  const [ey, em, ed] = endKey.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  const ms = end - start;
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
