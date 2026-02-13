import Dexie from "dexie";

export const db = new Dexie("symptomTrackerDB");

db.version(1).stores({
  // one row per episode
  sessions: "id, startedAtMs, baseline, *factorTags",

  // many per session
  interventions: "id, sessionId, atMs, type",

  // many per session
  followups: "id, sessionId, atMs, minutesAfter, intensity",
});

// Convert boolean factors to searchable tags
export function factorsToTags(factors) {
  if (!factors) return [];
  const tags = [];
  for (const [key, value] of Object.entries(factors)) {
    if (value === true) tags.push(key);
  }
  return tags;
}
