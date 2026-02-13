export function defaultFactors() {
  return {
    low_sleep: false,
    high_stress: false,
    dehydration: false,
    caffeine: false,
    skipped_meal: false,
    screen_strain: false,
    sickness: false,
    exercise: false,
    period: false,
    other: "",
  };
}

export function makeSession({ baseline = 5, factors = {}, note = "" } = {}) {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    startedAtISO: now.toISOString(),
    startedAtMs: now.getTime(),
    baseline: clamp10(baseline),
    factors: { ...defaultFactors(), ...factors },
    note: String(note || ""),
  };
}

export function makeIntervention({ sessionId, type, dose = "", note = "" } = {}) {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    sessionId,
    type: String(type || "Unknown"),
    dose: String(dose || ""),
    note: String(note || ""),
    atISO: now.toISOString(),
    atMs: now.getTime(),
  };
}

export function makeFollowup({ sessionId, minutesAfter = 30, intensity = 5, note = "" } = {}) {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    sessionId,
    minutesAfter: clampInt(minutesAfter, 0, 1440),
    intensity: clamp10(intensity),
    note: String(note || ""),
    atISO: now.toISOString(),
    atMs: now.getTime(),
  };
}

function clamp10(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(10, Math.round(x)));
}

function clampInt(n, min, max) {
  const x = Number(n);
  if (Number.isNaN(x)) return min;
  return Math.max(min, Math.min(max, Math.round(x)));
}
