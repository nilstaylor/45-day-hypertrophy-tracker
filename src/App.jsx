import { useMemo, useState, useEffect } from 'react';
import { Logo } from './components/Logo.jsx';
import { DayRing } from './components/DayRing.jsx';
import { TodayChecklist } from './components/TodayChecklist.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { IntakeLogger } from './components/IntakeLogger.jsx';
import { WorkoutScreen } from './components/WorkoutScreen.jsx';
import { AppleHealthPanel } from './components/AppleHealthPanel.jsx';
import { WORKOUTS, workoutById } from './data/workouts.js';
import { usePersistentState } from './hooks/usePersistentState.js';
import { KEYS, storage } from './lib/storage.js';
import { computeTargets } from './lib/macros.js';
import { todayKey, daysBetween, clamp } from './lib/date.js';

const DEFAULT_SETTINGS = { weight: 0, startDate: '' };
const DEFAULT_INTAKE = { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
const DEFAULT_DAILY_ENTRY = () => ({
  intake: { ...DEFAULT_INTAKE },
  checks: { workout: false, cardio: false, macros: false, water: false },
  workoutDraft: null, // { workoutId, exercises: {} }
});

export default function App() {
  const [settings, setSettings] = usePersistentState(KEYS.settings, DEFAULT_SETTINGS);
  const [dailyMap, setDailyMap] = usePersistentState(KEYS.daily, {});
  const [workoutLogs, setWorkoutLogs] = usePersistentState(KEYS.workouts, []);
  const [appleWorkouts, setAppleWorkouts] = usePersistentState(KEYS.appleWorkouts, []);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeWorkoutId, setActiveWorkoutId] = useState(null);

  const tKey = todayKey();
  const safeDailyMap = dailyMap && typeof dailyMap === 'object' ? dailyMap : {};
  const today = safeDailyMap[tKey] || DEFAULT_DAILY_ENTRY();
  const targets = useMemo(() => computeTargets(settings.weight), [settings.weight]);

  // First-launch nudge: open settings if no weight or start date yet.
  useEffect(() => {
    if (!settings.weight || !settings.startDate) {
      setSettingsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto macros + water check based on intake vs. targets.
  useEffect(() => {
    if (!targets.calories) return;
    const macrosHit =
      today.intake.calories >= targets.calories * 0.95 &&
      today.intake.protein >= targets.protein * 0.95 &&
      today.intake.carbs >= targets.carbs * 0.9 &&
      today.intake.fats >= targets.fats * 0.9;
    const waterHit = today.intake.water >= targets.water;
    if (today.checks.macros !== macrosHit || today.checks.water !== waterHit) {
      updateToday({
        checks: { ...today.checks, macros: macrosHit, water: waterHit },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today.intake, targets]);

  function updateToday(patch) {
    setDailyMap((m) => {
      const base = m && typeof m === 'object' ? m : {};
      return {
        ...base,
        [tKey]: { ...DEFAULT_DAILY_ENTRY(), ...(base[tKey] || {}), ...patch },
      };
    });
  }

  const rawDay = useMemo(() => {
    if (!settings.startDate) return 0;
    return daysBetween(settings.startDate, tKey);
  }, [settings.startDate, tKey]);
  const dayNumber = clamp(rawDay, 0, 45);

  const recommendedWorkoutId = useMemo(() => {
    // Rotate Day 1..4 across the sprint.
    if (dayNumber <= 0) return WORKOUTS[0].id;
    const idx = (dayNumber - 1) % WORKOUTS.length;
    return WORKOUTS[idx].id;
  }, [dayNumber]);

  // Save settings (and set startDate to today if blank on first save).
  const saveSettings = (next) => {
    const startDate = next.startDate || settings.startDate || tKey;
    setSettings({ weight: next.weight, startDate });
  };

  // Workout flow
  const openWorkout = (id) => {
    const w = workoutById(id);
    const draft = today.workoutDraft && today.workoutDraft.workoutId === id
      ? today.workoutDraft
      : { workoutId: id, exercises: {} };
    updateToday({ workoutDraft: draft });
    setActiveWorkoutId(id);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    void w;
  };

  const updateDraft = (nextDraft) => {
    updateToday({ workoutDraft: nextDraft });
  };

  const lastLogFor = (workoutId) => {
    // Most recent saved log for the same workoutId.
    const matches = workoutLogs.filter((l) => l.workoutId === workoutId);
    if (!matches.length) return null;
    // logs are appended in order; return last
    return matches[matches.length - 1];
  };

  const saveWorkout = () => {
    const draft = today.workoutDraft;
    if (!draft) return;
    const entry = {
      id: `${tKey}-${draft.workoutId}-${Date.now()}`,
      date: tKey,
      workoutId: draft.workoutId,
      exercises: draft.exercises || {},
    };
    setWorkoutLogs((logs) => [...logs, entry]);
    updateToday({
      checks: { ...today.checks, workout: true },
    });
  };

  const toggleCheck = (key) => {
    updateToday({
      checks: { ...today.checks, [key]: !today.checks[key] },
    });
  };

  const resetToday = () => {
    if (!window.confirm('Reset today\u2019s intake, checks, and workout draft?')) return;
    setDailyMap((m) => {
      const base = m && typeof m === 'object' ? m : {};
      return { ...base, [tKey]: DEFAULT_DAILY_ENTRY() };
    });
  };

  // Render
  if (activeWorkoutId) {
    const w = workoutById(activeWorkoutId);
    const draft = today.workoutDraft && today.workoutDraft.workoutId === activeWorkoutId
      ? today.workoutDraft
      : { workoutId: activeWorkoutId, exercises: {} };
    return (
      <Shell>
        <WorkoutScreen
          workout={w}
          draft={draft}
          previousLog={lastLogFor(activeWorkoutId)}
          onDraftChange={updateDraft}
          onBack={() => setActiveWorkoutId(null)}
          onSave={saveWorkout}
          cardioDone={today.checks.cardio}
          onCardioToggle={(v) => updateToday({ checks: { ...today.checks, cardio: v } })}
        />
      </Shell>
    );
  }

  return (
    <Shell onOpenSettings={() => setSettingsOpen(true)}>
      <Dashboard
        dayNumber={dayNumber}
        rawDay={rawDay}
        startDate={settings.startDate}
        weight={settings.weight}
        targets={targets}
        today={today}
        recommendedWorkoutId={recommendedWorkoutId}
        onOpenWorkout={openWorkout}
        onToggleCheck={toggleCheck}
        onUpdateIntake={(intake) => updateToday({ intake })}
        onResetToday={resetToday}
        onOpenSettings={() => setSettingsOpen(true)}
        storageAvailable={storage.available()}
        appleWorkouts={appleWorkouts}
        onAppleWorkoutsChange={setAppleWorkouts}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={saveSettings}
      />
    </Shell>
  );
}

function Shell({ children, onOpenSettings }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 bg-ink-950/85 backdrop-blur border-b border-ink-800">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={26} />
            <div className="leading-tight">
              <p className="display text-sm font-semibold text-ink-100">Hypertrophy 45</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-ink-500">Sprint Tracker</p>
            </div>
          </div>
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="btn-ghost px-3 py-2 min-h-[40px] text-sm"
              data-testid="button-open-settings"
              aria-label="Open settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1A2 2 0 014.4 17l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1A2 2 0 017 4.4l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 012.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Settings
            </button>
          )}
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-5">{children}</main>
      <footer className="max-w-md mx-auto px-4 pb-8 pt-2 text-center text-[11px] text-ink-500">
        Built for the gym floor. All data stays on this device.
      </footer>
    </div>
  );
}

function Dashboard({
  dayNumber,
  rawDay,
  startDate,
  weight,
  targets,
  today,
  recommendedWorkoutId,
  onOpenWorkout,
  onToggleCheck,
  onUpdateIntake,
  onResetToday,
  onOpenSettings,
  storageAvailable,
  appleWorkouts,
  onAppleWorkoutsChange,
}) {
  const recommended = workoutById(recommendedWorkoutId);
  return (
    <div className="space-y-6" data-testid="screen-dashboard">
      {/* Day ring */}
      <section className="card p-5 flex items-center gap-5">
        <DayRing day={dayNumber} total={45} />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink-400 mb-1">Sprint Status</p>
          <p className="display text-xl font-semibold text-ink-100 leading-tight">
            {!startDate
              ? 'Set your start date'
              : rawDay >= 45
                ? 'Sprint Complete'
                : `${45 - dayNumber} days to go`}
          </p>
          <p className="text-xs text-ink-400 mt-1 tabular">
            {startDate ? `Started ${startDate}` : 'No start date'}
          </p>
          {!weight && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="btn-primary mt-3 text-sm px-3 py-2 min-h-[40px]"
              data-testid="button-finish-setup"
            >
              Finish Setup
            </button>
          )}
        </div>
      </section>

      {!storageAvailable && (
        <div className="card-tight p-3 text-xs text-amber-300 border-amber-500/30 bg-amber-500/5">
          Local storage is unavailable in this environment. Your entries are kept in memory for this
          session only.
        </div>
      )}

      {/* Today checklist */}
      <section className="space-y-3">
        <SectionTitle>Today&rsquo;s Targets</SectionTitle>
        <TodayChecklist status={today.checks} onToggle={onToggleCheck} />
      </section>

      {/* Workout CTA */}
      <section className="space-y-3">
        <SectionTitle>Workout</SectionTitle>
        <div className="card p-4 space-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Recommended Today</p>
            <p className="display text-lg font-semibold text-ink-100">{recommended.title}</p>
            <p className="text-xs text-ink-400">{recommended.subtitle}</p>
          </div>
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => onOpenWorkout(recommended.id)}
            data-testid="button-start-recommended"
          >
            Start {recommended.title}
          </button>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {WORKOUTS.filter((w) => w.id !== recommended.id).map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => onOpenWorkout(w.id)}
                className="btn-secondary text-sm px-3 py-2"
                data-testid={`button-open-${w.id}`}
              >
                {w.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      <AppleHealthPanel
        imported={appleWorkouts}
        onImportedChange={onAppleWorkoutsChange}
      />

      {/* Macros */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <SectionTitle>Daily Intake</SectionTitle>
          <span className="text-[11px] tabular text-ink-500">
            {weight ? `${weight} lb` : 'No weight set'}
          </span>
        </div>
        <div className="card p-4">
          <IntakeLogger
            targets={targets}
            intake={today.intake}
            onChange={onUpdateIntake}
          />
        </div>
      </section>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onOpenSettings}
          className="btn-ghost flex-1"
          data-testid="button-edit-targets"
        >
          Edit Targets
        </button>
        <button
          type="button"
          onClick={onResetToday}
          className="btn-danger flex-1"
          data-testid="button-reset-today"
        >
          Reset Today
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="display text-sm font-semibold tracking-wide uppercase text-ink-300">
      {children}
    </h2>
  );
}
