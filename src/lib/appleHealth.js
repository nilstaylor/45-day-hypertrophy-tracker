export const APPLE_DURATIONS = [
  { value: '1_week', label: '1 week' },
  { value: '1_month', label: '1 month' },
  { value: '3_months', label: '3 months' },
  { value: '6_months', label: '6 months' },
  { value: '1_year', label: '1 year' },
];

export function pickField(w, keys, fallback = null) {
  for (const k of keys) {
    if (w && w[k] !== undefined && w[k] !== null && w[k] !== '') return w[k];
  }
  return fallback;
}

export function workoutDisplay(w) {
  const activity = pickField(w, [
    'workoutActivityType',
    'activityType',
    'workoutType',
    'name',
    'type',
  ], 'Workout');
  const start = pickField(w, ['startDate', 'start_date', 'startTime', 'start']);
  const end = pickField(w, ['endDate', 'end_date', 'endTime', 'end']);
  const source = pickField(w, ['sourceName', 'source', 'device']);
  const durationSec = pickField(w, ['duration', 'totalDuration', 'durationInSeconds']);
  const energy = pickField(w, [
    'totalEnergyBurned',
    'activeEnergyBurned',
    'energyBurned',
    'calories',
  ]);
  const energyUnit = pickField(w, ['totalEnergyBurnedUnit', 'energyUnit'], energy != null ? 'kcal' : null);
  const distance = pickField(w, ['totalDistance', 'distance']);
  const distanceUnit = pickField(w, ['totalDistanceUnit', 'distanceUnit'], distance != null ? 'm' : null);
  return {
    activity: String(activity),
    start,
    end,
    source,
    durationSec: durationSec != null ? Number(durationSec) : null,
    energy: energy != null ? Number(energy) : null,
    energyUnit,
    distance: distance != null ? Number(distance) : null,
    distanceUnit,
  };
}

export function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return null;
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function formatTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(iso);
  }
}

export function stableHash(w) {
  const d = workoutDisplay(w);
  const id = pickField(w, ['uuid', 'id', 'identifier']);
  if (id) return `id:${id}`;
  const parts = [
    d.activity,
    d.start || '',
    d.end || '',
    d.source || '',
    d.durationSec != null ? String(d.durationSec) : '',
  ];
  return `k:${parts.join('|')}`;
}

export function mergeWorkouts(existing, incoming) {
  const map = new Map();
  for (const w of existing || []) {
    map.set(stableHash(w), w);
  }
  let added = 0;
  for (const w of incoming || []) {
    const k = stableHash(w);
    if (!map.has(k)) {
      added += 1;
      map.set(k, w);
    }
  }
  const merged = Array.from(map.values());
  merged.sort((a, b) => {
    const ad = new Date(workoutDisplay(a).start || 0).getTime() || 0;
    const bd = new Date(workoutDisplay(b).start || 0).getTime() || 0;
    return bd - ad;
  });
  return { merged, added };
}
