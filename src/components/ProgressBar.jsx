import { clamp } from '../lib/date.js';

export function ProgressBar({ value, max, accent = 'green', label, unit = '', testId }) {
  const pct = max > 0 ? clamp((value / max) * 100, 0, 100) : 0;
  const reached = max > 0 && value >= max;
  const color = accent === 'blue' ? 'bg-neon-blue' : 'bg-neon-green';
  return (
    <div className="space-y-1.5" data-testid={testId}>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-ink-300 font-medium">{label}</span>
        <span className="tabular text-ink-100 font-semibold">
          <span data-testid={testId ? `${testId}-value` : undefined}>{Math.round(value)}</span>
          <span className="text-ink-500"> / {Math.round(max)}{unit ? ` ${unit}` : ''}</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-ink-800 overflow-hidden">
        <div
          className={`h-full ${color} transition-[width] duration-300 ease-out ${
            reached ? 'shadow-glow' : ''
          }`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(value)}
          aria-valuemin={0}
          aria-valuemax={Math.round(max)}
          aria-label={label}
        />
      </div>
    </div>
  );
}
