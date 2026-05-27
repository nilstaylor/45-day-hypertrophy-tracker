/**
 * One exercise: N sets of Weight × Reps inputs, with a Drop Set toggle
 * on the specified final set only (per the program).
 */
export function ExerciseCard({ exercise, log, previous, onChange }) {
  const sets = Array.from({ length: exercise.sets }, (_, i) => i + 1);

  const updateSet = (setIdx, patch) => {
    const next = { ...log, sets: { ...(log.sets || {}) } };
    const cur = next.sets[setIdx] || { weight: '', reps: '', dropSet: false };
    next.sets[setIdx] = { ...cur, ...patch };
    onChange(next);
  };

  return (
    <article
      className="card p-4 sm:p-5 space-y-3"
      data-testid={`card-exercise-${exercise.id}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="display text-lg font-semibold text-ink-100 leading-tight">
            {exercise.name}
          </h3>
          <p className="text-xs text-ink-400 mt-0.5 tabular">
            {exercise.sets} &times; {exercise.repRange}
            {exercise.dropSetOn ? (
              <span className="ml-2 chip bg-neon-blue/15 text-neon-blue border border-neon-blue/30">
                Drop set &middot; set {exercise.dropSetOn}
              </span>
            ) : null}
          </p>
        </div>
      </header>

      <div className="space-y-2">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider text-ink-500 font-semibold px-1">
          <span className="col-span-1">Set</span>
          <span className="col-span-4">Weight</span>
          <span className="col-span-3">Reps</span>
          <span className="col-span-4 text-right">Last time</span>
        </div>

        {sets.map((s) => {
          const cur = log.sets?.[s] || {};
          const prev = previous?.sets?.[s] || null;
          const isDropSetSlot = exercise.dropSetOn === s;
          return (
            <div
              key={s}
              className="grid grid-cols-12 gap-2 items-center"
              data-testid={`row-set-${exercise.id}-${s}`}
            >
              <div className="col-span-1 text-ink-400 font-semibold tabular text-sm pl-1">
                {s}
              </div>
              <div className="col-span-4">
                <input
                  type="number"
                  inputMode="decimal"
                  step="2.5"
                  min="0"
                  value={cur.weight ?? ''}
                  onChange={(e) => updateSet(s, { weight: e.target.value })}
                  placeholder="lb"
                  className="input tabular text-center px-2 py-2 min-h-[44px]"
                  aria-label={`${exercise.name} set ${s} weight in pounds`}
                  data-testid={`input-weight-${exercise.id}-${s}`}
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={cur.reps ?? ''}
                  onChange={(e) => updateSet(s, { reps: e.target.value })}
                  placeholder="reps"
                  className="input tabular text-center px-2 py-2 min-h-[44px]"
                  aria-label={`${exercise.name} set ${s} reps`}
                  data-testid={`input-reps-${exercise.id}-${s}`}
                />
              </div>
              <div className="col-span-4 text-right tabular text-xs">
                {prev && (prev.weight || prev.reps) ? (
                  <span className="text-ink-300">
                    <span className="text-ink-100 font-semibold">{prev.weight || '–'}</span>
                    <span className="text-ink-500"> lb &times; </span>
                    <span className="text-ink-100 font-semibold">{prev.reps || '–'}</span>
                    {prev.dropSet && (
                      <span className="ml-1 text-neon-blue uppercase tracking-wider text-[10px]">DS</span>
                    )}
                  </span>
                ) : (
                  <span className="text-ink-500">—</span>
                )}
              </div>

              {isDropSetSlot && (
                <div className="col-span-12">
                  <button
                    type="button"
                    onClick={() => updateSet(s, { dropSet: !cur.dropSet })}
                    aria-pressed={!!cur.dropSet}
                    className={`w-full min-h-[48px] rounded-xl px-4 py-2.5 font-semibold tracking-wide uppercase text-sm border transition-colors ${
                      cur.dropSet
                        ? 'bg-neon-blue text-ink-950 border-neon-blue shadow-glowBlue'
                        : 'bg-ink-850 text-neon-blue border-neon-blue/40 hover:bg-ink-800'
                    }`}
                    data-testid={`button-dropset-${exercise.id}-${s}`}
                  >
                    {cur.dropSet ? 'Drop Set Logged' : `Tap to Log Drop Set on Set ${s}`}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}
