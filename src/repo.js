import { db, factorsToTags } from "./db";

/* ---------- CREATE ---------- */

export async function createSession(session) {
  const factorTags = factorsToTags(session.factors);
  await db.sessions.add({ ...session, factorTags });
  return session.id;
}

export async function addIntervention(intervention) {
  await db.interventions.add(intervention);
}

export async function addFollowup(followup) {
  await db.followups.add(followup);
}

/* ---------- READ ---------- */

export async function getLatestSession() {
  return db.sessions.orderBy("startedAtMs").reverse().first();
}

export async function getSessionBundle(sessionId) {
  const session = await db.sessions.get(sessionId);
  if (!session) return null;

  const interventions = await db.interventions
    .where("sessionId")
    .equals(sessionId)
    .reverse()
    .sortBy("atMs");

  const followups = await db.followups
    .where("sessionId")
    .equals(sessionId)
    .reverse()
    .sortBy("atMs");

  return {
    session,
    interventions,
    followups,
  };
}

export async function getSessionsInLastDays(days = 30) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return db.sessions
    .where("startedAtMs")
    .aboveOrEqual(cutoff)
    .toArray();
}

/* ---------- CLEAR ---------- */

export async function clearAll() {
  await Promise.all([
    db.sessions.clear(),
    db.interventions.clear(),
    db.followups.clear(),
  ]);
}
