const ITEMS = [
  { key: 'workout', label: 'Weight Workout Completed' },
  { key: 'cardio', label: '20-Min LISS Cardio Completed' },
  { key: 'macros', label: 'Macros Hit' },
  { key: 'water', label: '1 Gallon Water Hit' },
];

export function TodayChecklist({ status, onToggle }) {
  return (
    <ul className="space-y-2" data-testid="list-today-checklist">
      {ITEMS.map((item) => {
        const done = !!status[item.key];
        return (
          <li key={item.key}>
            <button
              type="button"
              onClick={() => onToggle(item.key)}
              className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left min-h-[56px] transition-colors ${
                done
                  ? 'bg-neon-green/10 border-neon-green/40 text-ink-100'
                  : 'bg-ink-850 border-ink-700 text-ink-200 hover:bg-ink-800'
              }`}
              aria-pressed={done}
              data-testid={`button-check-${item.key}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                  done ? 'bg-neon-green border-neon-green text-ink-950' : 'border-ink-600'
                }`}
                aria-hidden="true"
              >
                {done && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5 9-11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
