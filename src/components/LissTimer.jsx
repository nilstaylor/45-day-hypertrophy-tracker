import { useEffect, useRef, useState } from 'react';

const TARGET = 20 * 60; // seconds

export function LissTimer({ done, onComplete }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startedAtRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= TARGET) {
          setRunning(false);
          onComplete?.();
        }
        return Math.min(next, TARGET);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onComplete]);

  const mm = String(Math.floor((TARGET - elapsed) / 60)).padStart(2, '0');
  const ss = String((TARGET - elapsed) % 60).padStart(2, '0');
  const pct = (elapsed / TARGET) * 100;

  const toggle = () => {
    if (elapsed >= TARGET) {
      setElapsed(0);
      setRunning(true);
      startedAtRef.current = Date.now();
      return;
    }
    setRunning((r) => !r);
  };
  const reset = () => {
    setRunning(false);
    setElapsed(0);
  };

  return (
    <div className="card-tight p-4 space-y-3" data-testid="section-liss-timer">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="label !mb-1">20-Min LISS Cardio</p>
          <p className="display text-3xl font-semibold tabular text-ink-100">
            {mm}:{ss}
          </p>
        </div>
        <span
          className={`chip ${done ? 'bg-neon-green/15 text-neon-green border border-neon-green/30' : 'bg-ink-800 text-ink-400 border border-ink-700'}`}
          data-testid="chip-cardio-status"
        >
          {done ? 'Complete' : 'Pending'}
        </span>
      </div>
      <div className="h-2 rounded-full bg-ink-800 overflow-hidden">
        <div
          className="h-full bg-neon-blue transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-primary flex-1"
          onClick={toggle}
          data-testid="button-liss-toggle"
        >
          {running ? 'Pause' : elapsed >= TARGET ? 'Restart' : elapsed > 0 ? 'Resume' : 'Start'}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={reset}
          data-testid="button-liss-reset"
          aria-label="Reset LISS timer"
        >
          Reset
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={onComplete}
          data-testid="button-liss-mark-done"
        >
          Mark Done
        </button>
      </div>
    </div>
  );
}
