import { useMemo, useState } from 'react';
import { ExerciseCard } from './ExerciseCard.jsx';
import { LissTimer } from './LissTimer.jsx';

/**
 * Workout screen for a specific day.
 * - `workout` is the workout definition.
 * - `previousLog` is the most recent prior log for this same day (for overload memory).
 * - `draft` is the current in-progress log (persisted by parent).
 */
export function WorkoutScreen({
  workout,
  draft,
  previousLog,
  onDraftChange,
  onBack,
  onSave,
  cardioDone,
  onCardioToggle,
}) {
  const [savedFlash, setSavedFlash] = useState(false);

  const exerciseLogs = useMemo(() => draft?.exercises || {}, [draft]);

  const updateExercise = (exId, exLog) => {
    onDraftChange({
      ...draft,
      exercises: { ...exerciseLogs, [exId]: exLog },
    });
  };

  const handleSave = () => {
    onSave();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  return (
    <section className="space-y-5 pb-24" data-testid="screen-workout">
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="btn-ghost px-3 py-2 min-h-[40px]"
          onClick={onBack}
          data-testid="button-workout-back"
          aria-label="Back to dashboard"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink-400">{workout.title}</p>
          <p className="display text-base font-semibold text-ink-100">{workout.subtitle}</p>
        </div>
      </header>

      {previousLog ? (
        <div className="card-tight p-3 text-xs text-ink-300 flex items-center justify-between gap-2">
          <span>
            <span className="text-ink-500">Last session:</span>{' '}
            <span className="tabular text-ink-100 font-semibold">{previousLog.date}</span>
          </span>
          <span className="chip bg-neon-green/10 text-neon-green border border-neon-green/30">
            Beat it
          </span>
        </div>
      ) : (
        <div className="card-tight p-3 text-xs text-ink-400">
          No prior log for this workout — establish your baseline.
        </div>
      )}

      <div className="space-y-3">
        {workout.exercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            log={exerciseLogs[ex.id] || { sets: {} }}
            previous={previousLog?.exercises?.[ex.id]}
            onChange={(next) => updateExercise(ex.id, next)}
          />
        ))}
      </div>

      <LissTimer done={cardioDone} onComplete={() => onCardioToggle(true)} />

      <div className="fixed left-0 right-0 bottom-0 px-4 pb-4 pt-3 bg-gradient-to-t from-ink-950 via-ink-950/95 to-ink-950/0">
        <div className="max-w-md mx-auto flex gap-2">
          <button
            type="button"
            className="btn-secondary flex-1"
            onClick={onBack}
            data-testid="button-workout-cancel"
          >
            Close
          </button>
          <button
            type="button"
            className={`btn-primary flex-[2] ${savedFlash ? 'shadow-glow' : ''}`}
            onClick={handleSave}
            data-testid="button-workout-save"
          >
            {savedFlash ? 'Saved' : 'Save Workout'}
          </button>
        </div>
      </div>
    </section>
  );
}
