// Daily macro targets derived from bodyweight in lbs.
// User-specified formulas:
//   calories = weight * 17
//   protein  = weight * 1.0   (g)
//   carbs    = weight * 2.25  (g)
//   fats     = weight * 0.45  (g)
// Water target is a fixed 128 oz (1 US gallon).

export function computeTargets(weightLbs) {
  const w = Number(weightLbs) || 0;
  return {
    calories: Math.round(w * 17),
    protein: Math.round(w * 1.0),
    carbs: Math.round(w * 2.25),
    fats: Math.round(w * 0.45),
    water: 128,
  };
}
