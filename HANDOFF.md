# Handoff — 45-Day Hypertrophy Tracker

**Path:** `/home/user/workspace/45-day-hypertrophy-tracker`
**Build status:** `npm run build` succeeds (171 kB JS / 54 kB gzipped, 22 kB CSS / 4.5 kB gzipped)
**Git:** initialized, one commit on `main` ("Initial commit: 45-day hypertrophy tracker MVP")

## Scripts

- `npm install` — install deps (React 18, Vite 5, Tailwind 3)
- `npm run dev` — Vite dev server on :5173
- `npm run build` — production bundle to `dist/`
- `npm run preview` — serve `dist/` for verification

## File tree

```
45-day-hypertrophy-tracker/
├── README.md
├── HANDOFF.md
├── .gitignore
├── index.html              SEO/meta, font preconnects, inline SVG favicon, viewport
├── package.json
├── postcss.config.js
├── tailwind.config.js      custom ink/neon palette + Space Grotesk / Inter / JetBrains Mono
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx             top-level state + routing between dashboard and workout screens
    ├── components/
    │   ├── Logo.jsx
    │   ├── DayRing.jsx
    │   ├── TodayChecklist.jsx
    │   ├── SettingsModal.jsx
    │   ├── Modal.jsx
    │   ├── ProgressBar.jsx
    │   ├── IntakeLogger.jsx
    │   ├── LissTimer.jsx
    │   ├── ExerciseCard.jsx
    │   └── WorkoutScreen.jsx
    ├── data/workouts.js    4-day program with drop-set positions per exercise
    ├── hooks/usePersistentState.js
    ├── lib/storage.js      safe localStorage wrapper + in-memory fallback
    ├── lib/date.js         local-date key helpers (no UTC drift)
    ├── lib/macros.js       target formulas
    └── styles/index.css    Tailwind layers + component primitives
```

## Key implementation decisions

- **Safe storage with in-memory fallback.** Every `localStorage` access is wrapped in try/catch. A one-time `probe()` writes & removes a sentinel key — if it throws (sandboxed iframe, private mode, quota), the app falls back to an in-memory `Map`. A warning banner surfaces on the dashboard when storage is unavailable. Three top-level keys: `hyp45.settings.v1`, `hyp45.daily.v1`, `hyp45.workouts.v1`.
- **`usePersistentState` hook.** Mirrors `useState` to safe storage with a sentinel-based "missing" check so a previously-stored `null` cannot be mistaken for "use default". Writes are coalesced via `queueMicrotask` to avoid hammering storage.
- **Day calculation.** `daysBetween(startKey, todayKey)` uses local-date components (no UTC). Sprint capped to 45 for ring display, but `rawDay >= 45` triggers the "Sprint Complete" state separately. Recommended workout rotates through Days 1–4 via `(rawDay - 1) % 4`.
- **Macro targets** computed exactly to the user spec in `src/lib/macros.js`: `lb × 17` cal, `× 1.0` protein, `× 2.25` carbs, `× 0.45` fats, fixed 128 oz water.
- **Auto-tick checks.** Macros checkbox auto-completes when calories ≥ 95% of target AND protein ≥ 95% AND carbs/fats ≥ 90%. Water auto-completes at ≥ 128 oz. All four boxes remain manually toggleable.
- **Progressive overload memory.** Saved workouts append to `workoutLogs[]`. When a workout opens, the most recent log with the same `workoutId` is passed into `WorkoutScreen` and shown per-set in the "Last time" column with `weight × reps` and a `DS` chip if the previous attempt logged a drop set.
- **Drop set placement.** Encoded per-exercise in `src/data/workouts.js` as `dropSetOn: <setIndex | null>`. The toggle button only renders for the matching set index. Calves (Standing/Seated Calf Raises) get 4 sets with the toggle on set 4; everything else is 3 sets.
- **LISS timer.** 20-min countdown component with start/pause/resume/reset. Calls `onComplete` automatically at zero and also exposes a "Mark Done" button. Hitting either flips today's cardio check.
- **Mobile-first UI.** Single `max-w-md` column, 48-px minimum touch targets on every button/input, sticky bottom save bar on workout screen, drawer-style modal that slides up on mobile. Dark mode by default with neon green primary (`#39ff8a`) and electric blue (`#3ad6ff`) accents for drop-set / water / chart-of-the-day moments.
- **Accessibility.** `aria-label` / `aria-pressed` / `role="progressbar"` / `role="dialog"` set on the right elements. Visible focus ring (`outline: 2px solid #39ff8a`). Escape closes the modal. All interactive controls carry stable `data-testid` attributes (`input-weight`, `button-start-recommended`, `button-dropset-{exerciseId}-{setIdx}`, `progress-protein`, etc.).
- **Branding.** Custom inline SVG "H" mark used both as the header logo and the data-URI favicon. No emojis anywhere.
- **SEO/meta.** Unique title, description, keywords, OG tags, `theme-color`, `apple-mobile-web-app-*` for home-screen install, `color-scheme: dark`, viewport with `viewport-fit=cover` for notches.

## Build / test results

- `npm install` → clean install, no audit issues blocking.
- `npm run build` → `vite v5.4.21 built in 1.47s`, 46 modules transformed, zero errors / warnings.
- **Functional QA via Playwright** (`http://localhost:4173`, 390×844 viewport):
  - First-launch settings modal opens automatically — passes.
  - Bodyweight 180 lb → targets: 3060 kcal / 180 g / 405 g / 81 g / 128 oz (matches spec exactly).
  - Start date 10 days ago → "Day 11 of 45 · 34 days to go · Upper Body B" recommended.
  - Intake +/- buttons, water cup taps, water +8/+16 oz all mutate state correctly and persist.
  - Opening a workout shows "No prior log…" baseline state. After saving and reopening, prior set logs appear in the "Last time" column.
  - Drop-set toggle activates the full-width neon-blue button only on the specified final set; other sets do not show it.
  - LISS timer counts down and marks cardio complete on zero.
  - Zero page errors, zero console errors after the storage-null bug fix.
- **Screenshots saved** (in project root, not in dist):
  - `preview-initial.png` — first-launch settings modal
  - `preview-dashboard.png` — dashboard with sprint complete
  - `preview-dashboard-mid.png` — dashboard mid-sprint
  - `preview-workout.png` — empty workout state
  - `preview-workout-filled.png` — workout with drop set logged and prior log shown

## Known small things to flag

- The `recommendedWorkoutId` rotates by `rawDay - 1`, so before a start date is set it defaults to Day 1. That seemed sensible — alternative would be to gate the CTA behind setup.
- Auto-macros-hit threshold is ±5%/10% (forgiving). If the user wants exact-match only, change the `0.95`/`0.9` multipliers in `App.jsx`.
- No light-mode toggle (dark-mode-first per spec).
- No service worker yet — out of scope; can be added later for true offline phone use.
