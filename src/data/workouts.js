/**
 * 4-day rotating split for the 45-day hypertrophy sprint.
 * Each exercise lists sets, rep range, and the index of the set
 * that has a drop set (null = none). Calves are 4 sets; everything else 3.
 */

export const WORKOUTS = [
  {
    id: 'day1',
    title: 'Upper Body A',
    subtitle: 'Chest & Back Focus',
    exercises: [
      { id: 'incline-db-bench', name: 'Incline Dumbbell Bench Press', sets: 3, repRange: '8-10', dropSetOn: null },
      { id: 'seated-cable-row', name: 'Seated Cable Rows', sets: 3, repRange: '8-10', dropSetOn: 3 },
      { id: 'hs-flat-press', name: 'Hammer Strength Flat Chest Press', sets: 3, repRange: '10-12', dropSetOn: null },
      { id: 'lat-pulldown', name: 'Lat Pulldowns', sets: 3, repRange: '10-12', dropSetOn: 3 },
      { id: 'db-lateral-raise', name: 'Dumbbell Lateral Raises', sets: 3, repRange: '12-15', dropSetOn: 3 },
    ],
  },
  {
    id: 'day2',
    title: 'Lower Body A',
    subtitle: 'Quad & Calf Focus',
    exercises: [
      { id: 'leg-press', name: 'Leg Press Machine', sets: 3, repRange: '8-10', dropSetOn: null },
      { id: 'db-rdl', name: 'Dumbbell Romanian Deadlifts', sets: 3, repRange: '10-12', dropSetOn: null },
      { id: 'leg-ext', name: 'Leg Extension Machine', sets: 3, repRange: '10-12', dropSetOn: 3 },
      { id: 'seated-leg-curl', name: 'Seated Leg Curl Machine', sets: 3, repRange: '10-12', dropSetOn: null },
      { id: 'standing-calf-raise', name: 'Standing Calf Raises', sets: 4, repRange: '15', dropSetOn: 4 },
    ],
  },
  {
    id: 'day3',
    title: 'Upper Body B',
    subtitle: 'Shoulders & Arms Focus',
    exercises: [
      { id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', sets: 3, repRange: '8-10', dropSetOn: null },
      { id: 'pull-ups', name: 'Pull-Ups / Assisted Pull-Up', sets: 3, repRange: '8-12', dropSetOn: null },
      { id: 'flat-db-bench', name: 'Flat Dumbbell Bench Press', sets: 3, repRange: '8-10', dropSetOn: null },
      { id: 'cable-bicep-curl', name: 'Cable Bicep Curls', sets: 3, repRange: '10-12', dropSetOn: 3 },
      { id: 'overhead-tricep-ext', name: 'Overhead Cable Tricep Extensions', sets: 3, repRange: '10-12', dropSetOn: 3 },
    ],
  },
  {
    id: 'day4',
    title: 'Lower Body B',
    subtitle: 'Hamstring & Posterior Focus',
    exercises: [
      { id: 'hack-squat', name: 'Hack Squat Machine', sets: 3, repRange: '8-10', dropSetOn: null },
      { id: 'lying-leg-curl', name: 'Lying Leg Curl Machine', sets: 3, repRange: '10-12', dropSetOn: 3 },
      { id: 'bulgarian-split-squat', name: 'Dumbbell Bulgarian Split Squats', sets: 3, repRange: '8-10 / leg', dropSetOn: null },
      { id: 'leg-ext-b', name: 'Leg Extension Machine', sets: 3, repRange: '12-15', dropSetOn: null },
      { id: 'seated-calf-raise', name: 'Seated Calf Raises', sets: 4, repRange: '12-15', dropSetOn: 4 },
    ],
  },
];

export function workoutById(id) {
  return WORKOUTS.find((w) => w.id === id) ?? WORKOUTS[0];
}
