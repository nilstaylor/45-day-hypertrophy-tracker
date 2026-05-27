import { useMemo, useState } from 'react';
import {
  APPLE_DURATIONS,
  workoutDisplay,
  formatDuration,
  formatTime,
  mergeWorkouts,
  stableHash,
} from '../lib/appleHealth.js';

export function AppleHealthPanel({ imported, onImportedChange }) {
  const [duration, setDuration] = useState('1_month');
  const [latest, setLatest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [showRawForId, setShowRawForId] = useState(null);
  const [expandedRawAll, setExpandedRawAll] = useState(false);

  const safeImported = Array.isArray(imported) ? imported : [];

  const sortedImported = useMemo(() => {
    return [...safeImported].sort((a, b) => {
      const ad = new Date(workoutDisplay(a).start || 0).getTime() || 0;
      const bd = new Date(workoutDisplay(b).start || 0).getTime() || 0;
      return bd - ad;
    });
  }, [safeImported]);

  async function handleSync() {
    setLoading(true);
    setError(null);
    setLastResult(null);
    try {
      const url = `/api/apple-health/workouts?duration=${encodeURIComponent(duration)}&latest=${latest ? 'true' : 'false'}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const text = await res.text();
      let body = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = { ok: false, error: text.slice(0, 500) };
      }
      if (!res.ok || (body && body.ok === false)) {
        const msg =
          (body && (body.error || body.hint)) ||
          `Sync failed (HTTP ${res.status}). Backend or Apple Health connector unavailable.`;
        setError(msg);
        setLastResult(body);
        return;
      }
      const incoming = Array.isArray(body && body.workouts) ? body.workouts : [];
      const { merged, added } = mergeWorkouts(safeImported, incoming);
      onImportedChange(merged);
      setLastResult({ ...body, added });
    } catch (err) {
      setError(
        `Could not reach /api/apple-health/workouts. The Express server may not be running. ${err && err.message ? err.message : ''}`,
      );
    } finally {
      setLoading(false);
    }
  }

  function clearImported() {
    if (!safeImported.length) return;
    if (!window.confirm('Remove all imported Apple Health workouts from this device?')) return;
    onImportedChange([]);
    setLastResult(null);
  }

  return (
    <section className="space-y-3" data-testid="section-apple-health">
      <div className="flex items-baseline justify-between">
        <h2 className="display text-sm font-semibold tracking-wide uppercase text-ink-300">
          Apple Health Sync
        </h2>
        <span className="text-[11px] tabular text-ink-500">
          {safeImported.length} imported
        </span>
      </div>
      <div className="card p-4 space-y-3" data-testid="card-apple-health">
        <p className="text-xs text-ink-400 leading-relaxed">
          Pull workout history from Apple Health through the Perplexity connector. Imports are stored
          only on this device under <code className="text-ink-300">hyp45.appleWorkouts.v1</code>. The
          raw connector response is shown on request and never sent elsewhere.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="label">Lookback</span>
            <select
              className="input"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={loading}
              data-testid="select-apple-duration"
              aria-label="Apple Health lookback duration"
            >
              {APPLE_DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">Mode</span>
            <button
              type="button"
              role="switch"
              aria-checked={latest}
              aria-label="Fetch only the most recent workout"
              onClick={() => setLatest((v) => !v)}
              disabled={loading}
              data-testid="toggle-apple-latest"
              className={`input flex items-center justify-between text-left ${
                latest ? 'border-neon-green/60' : ''
              }`}
            >
              <span>{latest ? 'Latest only' : 'All in range'}</span>
              <span
                className={`chip ${
                  latest
                    ? 'bg-neon-green/20 text-neon-green'
                    : 'bg-ink-700 text-ink-300'
                }`}
              >
                {latest ? 'ON' : 'OFF'}
              </span>
            </button>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={handleSync}
            disabled={loading}
            data-testid="button-apple-sync"
            aria-label="Sync Apple Health workouts"
          >
            {loading ? 'Syncing…' : 'Sync Now'}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={clearImported}
            disabled={loading || !safeImported.length}
            data-testid="button-apple-clear"
            aria-label="Clear imported Apple Health workouts"
          >
            Clear
          </button>
        </div>

        {error && (
          <div
            className="card-tight p-3 text-xs text-amber-300 border-amber-500/30 bg-amber-500/5"
            role="alert"
            data-testid="apple-error"
          >
            <p className="font-semibold mb-1">Apple Health sync unavailable</p>
            <p className="leading-relaxed">{error}</p>
            <p className="mt-2 text-[11px] text-ink-400">
              Apple Health sync works when this app runs through the Perplexity connector-enabled
              server (with the <code>external-tool</code> CLI and an authenticated
              {' '}<code>apple_healthkit</code> source). Manual tracking continues to work locally
              without it.
            </p>
          </div>
        )}

        {lastResult && lastResult.ok && (
          <div
            className="card-tight p-3 text-xs text-ink-300"
            data-testid="apple-success"
          >
            <p>
              Pulled <span className="text-ink-100 font-semibold">{lastResult.count}</span>{' '}
              workout{lastResult.count === 1 ? '' : 's'} for window{' '}
              <span className="font-mono">{lastResult.duration}</span>
              {typeof lastResult.added === 'number' ? (
                <>
                  {' '}· {lastResult.added} new on this device
                </>
              ) : null}
              .
            </p>
            <p className="text-[11px] text-ink-500 mt-1">
              Fetched {formatTime(lastResult.fetchedAt)}
            </p>
          </div>
        )}

        {sortedImported.length > 0 && (
          <div className="space-y-2 pt-1" data-testid="apple-workouts-list">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                Imported Workouts
              </p>
              <button
                type="button"
                className="text-[11px] text-ink-400 hover:text-ink-200 underline-offset-2 hover:underline"
                onClick={() => setExpandedRawAll((v) => !v)}
                data-testid="button-toggle-all-raw"
              >
                {expandedRawAll ? 'Hide all raw' : 'Show all raw'}
              </button>
            </div>
            <ul className="space-y-2">
              {sortedImported.map((w) => {
                const key = stableHash(w);
                const d = workoutDisplay(w);
                const showRaw = expandedRawAll || showRawForId === key;
                return (
                  <li
                    key={key}
                    className="card-tight p-3 text-xs space-y-1.5"
                    data-testid="apple-workout-item"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="display text-sm font-semibold text-ink-100 truncate">
                        {d.activity}
                      </p>
                      <button
                        type="button"
                        className="text-[11px] text-ink-400 hover:text-ink-200 underline-offset-2 hover:underline shrink-0"
                        onClick={() =>
                          setShowRawForId((cur) => (cur === key ? null : key))
                        }
                        aria-expanded={showRaw}
                        data-testid="button-toggle-raw"
                      >
                        {showRaw ? 'Hide raw' : 'Show raw'}
                      </button>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 tabular">
                      <Field label="Start" value={formatTime(d.start)} />
                      <Field label="End" value={formatTime(d.end)} />
                      <Field
                        label="Duration"
                        value={d.durationSec != null ? formatDuration(d.durationSec) : '—'}
                      />
                      <Field
                        label="Energy"
                        value={
                          d.energy != null
                            ? `${Math.round(d.energy * 100) / 100} ${d.energyUnit || ''}`.trim()
                            : '—'
                        }
                      />
                      <Field
                        label="Distance"
                        value={
                          d.distance != null
                            ? `${Math.round(d.distance * 100) / 100} ${d.distanceUnit || ''}`.trim()
                            : '—'
                        }
                      />
                      <Field label="Source" value={d.source || '—'} />
                    </dl>
                    {showRaw && (
                      <pre
                        className="mt-2 max-h-64 overflow-auto rounded-lg bg-ink-950/80 border border-ink-700 p-2 text-[10px] leading-snug text-ink-300 font-mono whitespace-pre-wrap break-all"
                        data-testid="apple-workout-raw"
                      >
                        {safeStringify(w)}
                      </pre>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {sortedImported.length === 0 && !error && !loading && (
          <p className="text-[11px] text-ink-500">
            No Apple Health workouts imported yet. Pick a lookback window and tap Sync Now.
          </p>
        )}
      </div>
    </section>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] uppercase tracking-[0.14em] text-ink-500">{label}</dt>
      <dd className="text-ink-200">{value}</dd>
    </div>
  );
}

function safeStringify(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}
