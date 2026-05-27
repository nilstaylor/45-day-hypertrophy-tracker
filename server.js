import express from 'express';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const execFileP = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? Number(process.env.PORT) : 5174;
const DIST_DIR = path.join(__dirname, 'dist');
const EXTERNAL_TOOL_BIN = process.env.EXTERNAL_TOOL_BIN || 'external-tool';

const VALID_DURATIONS = ['1_day', '1_week', '1_month', '3_months', '6_months', '1_year'];
const APPLE_SOURCE_ID = process.env.APPLE_HEALTHKIT_SOURCE_ID || 'apple_healthkit';
const APPLE_TOOL_NAME = process.env.APPLE_HEALTHKIT_TOOL_NAME || 'query_apple_healthkit';

const app = express();
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: '45-day-hypertrophy-tracker', time: new Date().toISOString() });
});

app.get('/api/apple-health/status', async (_req, res) => {
  try {
    const { stdout } = await execFileP(EXTERNAL_TOOL_BIN, ['list'], { maxBuffer: 32 * 1024 * 1024 });
    let parsed;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      return res.json({ available: false, reason: 'external-tool returned non-JSON', source: null });
    }
    const match = Array.isArray(parsed)
      ? parsed.find((s) => s && s.source_id === APPLE_SOURCE_ID)
      : null;
    if (!match) {
      return res.json({
        available: false,
        reason: `connector ${APPLE_SOURCE_ID} not registered`,
        source: null,
      });
    }
    const connected = (match.status || '').toUpperCase() === 'CONNECTED';
    res.json({
      available: connected,
      reason: connected ? null : `connector status: ${match.status}`,
      source: { id: match.source_id, display_name: match.display_name, status: match.status },
    });
  } catch (err) {
    res.json({
      available: false,
      reason: `external-tool unavailable: ${err.code || err.message || 'unknown'}`,
      source: null,
    });
  }
});

app.get('/api/apple-health/workouts', async (req, res) => {
  const rawDuration = String(req.query.duration || '1_month');
  const duration = VALID_DURATIONS.includes(rawDuration) ? rawDuration : '1_month';
  const latest = String(req.query.latest || 'false').toLowerCase() === 'true';

  const payload = {
    source_id: APPLE_SOURCE_ID,
    tool_name: APPLE_TOOL_NAME,
    arguments: {
      health_types: [
        {
          type: 'Workout',
          duration,
          should_fetch_latest: latest,
        },
      ],
    },
  };

  try {
    const { stdout } = await execFileP(EXTERNAL_TOOL_BIN, ['call', JSON.stringify(payload)], {
      maxBuffer: 64 * 1024 * 1024,
      timeout: 60_000,
    });
    let raw;
    try {
      raw = JSON.parse(stdout);
    } catch {
      raw = { stdout };
    }
    const workouts = normalizeWorkouts(raw);
    return res.json({
      ok: true,
      duration,
      latest,
      fetchedAt: new Date().toISOString(),
      count: workouts.length,
      workouts,
      raw,
    });
  } catch (err) {
    const msg = err && (err.stderr || err.message || String(err));
    return res.status(502).json({
      ok: false,
      duration,
      latest,
      error: typeof msg === 'string' ? msg.slice(0, 2000) : 'connector call failed',
      hint:
        'This endpoint requires the Perplexity external-tool CLI with an authenticated apple_healthkit connector. ' +
        'When unavailable, the app falls back to manual tracking only.',
    });
  }
});

function normalizeWorkouts(raw) {
  if (!raw) return [];
  const candidates = [];
  const stack = [raw];
  const seen = new Set();
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object' || seen.has(node)) continue;
    seen.add(node);
    if (Array.isArray(node)) {
      for (const item of node) stack.push(item);
      continue;
    }
    if (looksLikeWorkout(node)) candidates.push(node);
    for (const v of Object.values(node)) {
      if (v && typeof v === 'object') stack.push(v);
    }
  }
  const deduped = [];
  const keys = new Set();
  for (const w of candidates) {
    const k = stableKey(w);
    if (keys.has(k)) continue;
    keys.add(k);
    deduped.push(w);
  }
  return deduped;
}

function looksLikeWorkout(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  const hasWorkoutType =
    typeof obj.workoutActivityType === 'string' ||
    typeof obj.activityType === 'string' ||
    typeof obj.workoutType === 'string' ||
    obj.type === 'Workout' ||
    obj.type === 'HKWorkoutTypeIdentifier';
  const hasTimes =
    (typeof obj.startDate === 'string' || typeof obj.start_date === 'string' || typeof obj.startTime === 'string') &&
    (typeof obj.endDate === 'string' || typeof obj.end_date === 'string' || typeof obj.endTime === 'string');
  const hasDuration = typeof obj.duration === 'number' || typeof obj.totalDuration === 'number';
  return hasWorkoutType || (hasTimes && hasDuration);
}

function stableKey(w) {
  const parts = [
    w.uuid || w.id || '',
    w.workoutActivityType || w.activityType || w.workoutType || w.type || '',
    w.startDate || w.start_date || w.startTime || '',
    w.endDate || w.end_date || w.endTime || '',
    w.sourceName || w.source || '',
    w.duration || w.totalDuration || '',
  ];
  return parts.join('|');
}

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  res.status(500).json({ ok: false, error: err && err.message ? err.message : 'server error' });
});

app.listen(PORT, () => {
  console.log(`[hyp45] server listening on http://localhost:${PORT}`);
  if (!fs.existsSync(DIST_DIR)) {
    console.log('[hyp45] dist/ not found — run `npm run build` to enable static serving.');
  }
});
