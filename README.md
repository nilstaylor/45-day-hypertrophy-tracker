# 45-Day Hypertrophy Sprint Tracker

Mobile-first React/Vite SPA built for a 45-day hypertrophy sprint. Track macros, water, LISS cardio, and a 4-day rotating workout split with progressive-overload memory. Designed for one-thumb use on the gym floor.

All workout, macro, and water entries are stored locally on your device via `localStorage` (with a safe in-memory fallback if storage is blocked).

An **optional** lightweight Express backend (`server.js`) exposes a single integration endpoint for **Apple Health workout sync** through the Perplexity Apple HealthKit connector. This endpoint is only invoked when you press *Sync Now*; the rest of the app continues to work fully offline.

---

## Features

- **Day X of 45 ring** — automatically derived from your configurable start date.
- **Today checklist** — quick-tap rows for Weight Workout, 20-Min LISS Cardio, Macros Hit, and 1 Gallon Water. Macros and water auto-tick when their targets are reached.
- **Setup modal** — enter bodyweight in lbs and start date. Targets calculated exactly:
  - Calories = lb × 17
  - Protein = lb × 1.0 g
  - Carbs = lb × 2.25 g
  - Fats = lb × 0.45 g
  - Water = 128 oz (1 gallon)
- **Daily intake logger** — large +/- buttons and direct inputs for calories, protein, carbs, fats, and water (with 16-oz cup tracker).
- **Workout tracker** — 4 rotating days:
  - Day 1 Upper Body A (Chest & Back)
  - Day 2 Lower Body A (Quad & Calf)
  - Day 3 Upper Body B (Shoulders & Arms)
  - Day 4 Lower Body B (Hamstring & Posterior)
  - Each exercise: 3 sets of Weight × Reps (calves 4 sets). Prominent **Drop Set** toggle appears on the exact final set the program specifies.
- **Progressive overload memory** — when you open a workout, each set shows the Weight × Reps you logged last time for the same workout day, so you know what to beat.
- **20-Min LISS timer** — runs in-app with start / pause / reset, and marks cardio complete automatically.
- **Apple Health workout sync (optional)** — pull workout history from Apple Health through the Perplexity `apple_healthkit` connector. Choose a lookback (1 week → 1 year), tap Sync Now, review the imported list with all available fields (activity type, start/end, duration, energy burned, distance, source) plus an expandable raw JSON view. Imports are stored locally under `hyp45.appleWorkouts.v1` and deduped by stable hash of `start | end | activity | source | duration`.

---

## Tech

- React 18 + Vite 5
- Tailwind CSS 3 (dark-mode-first, custom token palette)
- Inter / Space Grotesk / JetBrains Mono via Google Fonts CDN
- Custom inline SVG logo and favicon
- Safe storage wrapper (`src/lib/storage.js`) — try/catch around every `localStorage` call with an in-memory fallback so the app never crashes in sandboxed iframes or private mode.

---

## Launch

```bash
cd 45-day-hypertrophy-tracker
npm install
npm run dev       # local dev server on http://localhost:5173 (proxies /api → :5174)
npm run build     # production build in dist/
npm run preview   # serve the built bundle (static only, no /api)
npm run server    # start the Express backend on :5174 (serves dist/ + /api/*)
npm start         # alias for `npm run server` — preferred production entrypoint
```

For full Apple Health sync support during local development, run **both** in two terminals:

```bash
# Terminal A
npm run server    # boots Express on :5174

# Terminal B
npm run dev       # boots Vite on :5173 (proxies /api to :5174)
```

To use it as a phone home-screen app, open the dev or hosted URL in mobile Safari / Chrome and Add to Home Screen.

### Apple Health sync — environment requirements

The `/api/apple-health/workouts` endpoint shells out to Perplexity's `external-tool` CLI server-side and calls the `apple_healthkit` source's `query_apple_healthkit` tool. It requires:

- The `external-tool` binary on the `PATH` of the Node process (override with `EXTERNAL_TOOL_BIN`).
- An authenticated `apple_healthkit` connector for the running session/user.
- A Node runtime that can run `server.js` (Node 18+).

If any of those are missing — for example, a **pure static GitHub Pages build cannot access HealthKit** — the panel shows a clear inline message explaining the connector is unavailable and the rest of the tracker continues to work locally. No Apple Health data is ever fetched in the browser; the connector is only invoked from the server endpoint.

Environment overrides:

| Variable                       | Default                  | Purpose                              |
| ------------------------------ | ------------------------ | ------------------------------------ |
| `PORT`                         | `5174`                   | Express listen port                  |
| `EXTERNAL_TOOL_BIN`            | `external-tool`          | Path to the CLI binary               |
| `APPLE_HEALTHKIT_SOURCE_ID`    | `apple_healthkit`        | Connector source id                  |
| `APPLE_HEALTHKIT_TOOL_NAME`    | `query_apple_healthkit`  | Connector tool name                  |

---

## Project Structure

```
45-day-hypertrophy-tracker/
├── index.html              # SEO + meta + font preconnects + inline SVG favicon
├── package.json
├── server.js               # Optional Express backend + /api/apple-health/* endpoints
├── vite.config.js          # Dev server proxies /api → :5174
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx            # React entry
    ├── App.jsx             # Routing + state wiring
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
    │   ├── AppleHealthPanel.jsx  # Sync UI + per-workout details + raw JSON viewer
    │   └── WorkoutScreen.jsx
    ├── data/
    │   └── workouts.js     # 4-day program definition
    ├── hooks/
    │   └── usePersistentState.js
    ├── lib/
    │   ├── storage.js      # safe localStorage wrapper
    │   ├── date.js         # local-date helpers
    │   ├── macros.js       # target formulas
    │   └── appleHealth.js  # field normalization, dedupe hash, formatting
    └── styles/
        └── index.css       # Tailwind layers + design tokens
```

---

## Design

- **Palette:** sleek dark grays (`#0a0b0d` → `#1b1f25`) with neon green (`#39ff8a`) primary and electric blue (`#3ad6ff`) for drop-set / water accents.
- **Typography:** Space Grotesk for display / headings, Inter for body, JetBrains Mono for tabular data.
- **Targets:** every interactive control is at least 44–48 px tall, with `data-testid` attributes and `aria-label`s for accessibility.
- **No emojis** — uses inline SVG icons throughout.

---

## Data Model

`localStorage` keys (see `src/lib/storage.js`):

| Key                         | Shape                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `hyp45.settings.v1`         | `{ weight, startDate }`                                                              |
| `hyp45.daily.v1`            | `{ [YYYY-MM-DD]: { intake, checks, workoutDraft } }`                                 |
| `hyp45.workouts.v1`         | `[{ id, date, workoutId, exercises: { [exId]: { sets: { 1: { weight, reps, dropSet } } } } }]` |
| `hyp45.appleWorkouts.v1`    | `[{ ...rawConnectorWorkout }]` — full raw Apple HealthKit workout objects, deduped by stable hash |

To wipe everything: open DevTools → Application → Local Storage → clear the four `hyp45.*` keys.

---

## API

When `server.js` is running:

| Endpoint                                | Notes                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| `GET /api/health`                       | Liveness probe.                                                                |
| `GET /api/apple-health/status`          | Checks whether the `apple_healthkit` connector is registered and connected.    |
| `GET /api/apple-health/workouts?duration=1_week\|1_month\|3_months\|6_months\|1_year&latest=false` | Calls `external-tool call` with the Apple HealthKit query. Returns `{ ok, duration, latest, count, workouts, raw }`. Falls back to `502` with `{ ok: false, error, hint }` if the connector errors. Unknown durations are coerced to `1_month`. |

### Limitations

- **Static GitHub Pages cannot do Apple Health sync.** HealthKit is only reachable via the server-side connector — a static-only build will surface a clear error explaining the backend is unavailable.
- The connector schema may evolve; the server normalizes the response best-effort and always preserves the original payload under `raw` so the UI can show every field via the per-workout *Show raw* control.
- Apple Health data is sensitive: imported workouts are written only to this browser's `localStorage`, never sent anywhere else by this app.
