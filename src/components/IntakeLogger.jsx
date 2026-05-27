import { ProgressBar } from './ProgressBar.jsx';

const MACROS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', step: 50, accent: 'green' },
  { key: 'protein', label: 'Protein', unit: 'g', step: 5, accent: 'green' },
  { key: 'carbs', label: 'Carbs', unit: 'g', step: 5, accent: 'blue' },
  { key: 'fats', label: 'Fats', unit: 'g', step: 5, accent: 'blue' },
];

export function IntakeLogger({ targets, intake, onChange }) {
  const setVal = (k, v) => {
    const n = Math.max(0, Number(v) || 0);
    onChange({ ...intake, [k]: n });
  };

  const bump = (k, delta) => {
    const cur = Number(intake[k]) || 0;
    onChange({ ...intake, [k]: Math.max(0, cur + delta) });
  };

  return (
    <div className="space-y-5" data-testid="section-intake-logger">
      {MACROS.map((m) => (
        <div key={m.key} className="space-y-2">
          <ProgressBar
            value={intake[m.key] || 0}
            max={targets[m.key] || 0}
            accent={m.accent}
            label={m.label}
            unit={m.unit}
            testId={`progress-${m.key}`}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary px-3 py-2 min-h-[44px] tabular"
              onClick={() => bump(m.key, -m.step)}
              aria-label={`Decrease ${m.label} by ${m.step}`}
              data-testid={`button-${m.key}-minus`}
            >
              -{m.step}
            </button>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={intake[m.key] ?? ''}
              onChange={(e) => setVal(m.key, e.target.value)}
              className="input tabular text-center"
              placeholder="0"
              aria-label={`${m.label} consumed`}
              data-testid={`input-${m.key}`}
            />
            <button
              type="button"
              className="btn-secondary px-3 py-2 min-h-[44px] tabular"
              onClick={() => bump(m.key, m.step)}
              aria-label={`Increase ${m.label} by ${m.step}`}
              data-testid={`button-${m.key}-plus`}
            >
              +{m.step}
            </button>
          </div>
        </div>
      ))}

      <WaterTracker
        oz={intake.water || 0}
        target={targets.water || 128}
        onChange={(n) => onChange({ ...intake, water: Math.max(0, n) })}
      />
    </div>
  );
}

function WaterTracker({ oz, target, onChange }) {
  // 8 cups = 1 gallon (16oz each)
  const cup = 16;
  const cups = Math.ceil(target / cup);
  const filled = Math.floor(oz / cup);
  return (
    <div className="space-y-2" data-testid="section-water">
      <ProgressBar
        value={oz}
        max={target}
        accent="blue"
        label="Water"
        unit="oz"
        testId="progress-water"
      />
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: cups }).map((_, i) => {
          const active = i < filled;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange((i + 1) * cup === oz ? i * cup : (i + 1) * cup)}
              className={`flex-1 min-w-[36px] h-11 rounded-lg border tabular text-xs font-semibold transition-colors ${
                active
                  ? 'bg-neon-blue/20 border-neon-blue text-neon-blue'
                  : 'bg-ink-850 border-ink-700 text-ink-500'
              }`}
              aria-label={`Cup ${i + 1} of ${cups} (16 oz)`}
              data-testid={`button-water-cup-${i + 1}`}
            >
              16
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          className="btn-secondary px-3 py-2 min-h-[44px]"
          onClick={() => onChange(Math.max(0, oz - 8))}
          data-testid="button-water-minus"
          aria-label="Subtract 8 oz of water"
        >
          -8 oz
        </button>
        <button
          type="button"
          className="btn-secondary px-3 py-2 min-h-[44px] flex-1"
          onClick={() => onChange(oz + 8)}
          data-testid="button-water-plus-8"
          aria-label="Add 8 oz of water"
        >
          +8 oz
        </button>
        <button
          type="button"
          className="btn-secondary px-3 py-2 min-h-[44px] flex-1"
          onClick={() => onChange(oz + 16)}
          data-testid="button-water-plus-16"
          aria-label="Add 16 oz of water"
        >
          +16 oz
        </button>
      </div>
    </div>
  );
}
