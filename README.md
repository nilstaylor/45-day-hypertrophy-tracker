# 45-Day Hypertrophy Sprint Tracker

Mobile-first React/Vite SPA built for a 45-day hypertrophy sprint. Track macros, water, LISS cardio, and a 4-day rotating workout split with progressive-overload memory. Designed for one-thumb use on the gym floor.

All data is stored locally on your device via `localStorage` (with a safe in-memory fallback if storage is blocked). There is no backend — nothing leaves your phone.

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
npm run dev       # local dev server on http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the built bundle
```

To use it as a phone home-screen app, open the dev or hosted URL in mobile Safari / Chrome and Add to Home Screen.

---

## Project Structure

```
45-day-hypertrophy-tracker/
├── index.html              # SEO + meta + font preconnects + inline SVG favicon
├── package.json
├── vite.config.js
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
    │   └── WorkoutScreen.jsx
    ├── data/
    │   └── workouts.js     # 4-day program definition
    ├── hooks/
    │   └── usePersistentState.js
    ├── lib/
    │   ├── storage.js      # safe localStorage wrapper
    │   ├── date.js         # local-date helpers
    │   └── macros.js       # target formulas
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

| Key                  | Shape                                                                                |
| -------------------- | ------------------------------------------------------------------------------------ |
| `hyp45.settings.v1`  | `{ weight, startDate }`                                                              |
| `hyp45.daily.v1`     | `{ [YYYY-MM-DD]: { intake, checks, workoutDraft } }`                                 |
| `hyp45.workouts.v1`  | `[{ id, date, workoutId, exercises: { [exId]: { sets: { 1: { weight, reps, dropSet } } } } }]` |

To wipe everything: open DevTools → Application → Local Storage → clear the three `hyp45.*` keys.
