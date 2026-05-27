import { clamp } from '../lib/date.js';

/** Big circular progress ring for "Day X of 45". */
export function DayRing({ day, total = 45 }) {
  const safeDay = clamp(day, 0, total);
  const pct = (safeDay / total) * 100;
  const r = 70;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      data-testid="ring-day-progress"
      aria-label={`Day ${safeDay} of ${total}`}
      role="img"
    >
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
        <circle cx="90" cy="90" r={r} stroke="#1b1f25" strokeWidth="12" fill="none" />
        <circle
          cx="90"
          cy="90"
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray 600ms ease-out' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#39ff8a" />
            <stop offset="100%" stopColor="#3ad6ff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Day</span>
        <span className="display text-5xl font-bold tabular text-ink-100 leading-none">
          {safeDay}
        </span>
        <span className="text-xs text-ink-400 mt-1 tabular">of {total}</span>
      </div>
    </div>
  );
}
