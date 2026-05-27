/**
 * Safe LocalStorage wrapper with in-memory fallback.
 * If localStorage is blocked (private mode, sandboxed iframe, quota),
 * we silently fall back to a per-session in-memory map so the app never crashes.
 */

const memory = new Map();
let probedAvailable = null;

function probe() {
  if (probedAvailable !== null) return probedAvailable;
  try {
    const k = '__hyp45_probe__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    probedAvailable = true;
  } catch {
    probedAvailable = false;
  }
  return probedAvailable;
}

export const storage = {
  available() {
    return probe();
  },
  get(key, fallback = null) {
    try {
      if (probe()) {
        const raw = window.localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
      }
      return memory.has(key) ? memory.get(key) : fallback;
    } catch {
      return memory.has(key) ? memory.get(key) : fallback;
    }
  },
  set(key, value) {
    try {
      if (probe()) {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      }
      memory.set(key, value);
      return true;
    } catch {
      memory.set(key, value);
      return false;
    }
  },
  remove(key) {
    try {
      if (probe()) window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    memory.delete(key);
  },
};

export const KEYS = {
  settings: 'hyp45.settings.v1',
  daily: 'hyp45.daily.v1', // map of YYYY-MM-DD -> daily entry
  workouts: 'hyp45.workouts.v1', // array of completed workout logs
  appleWorkouts: 'hyp45.appleWorkouts.v1', // array of imported Apple Health workouts
};
