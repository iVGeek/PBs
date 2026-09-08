import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { medals, userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { categorizeDistance } from '$lib/utils';

type DbUser = {
  id: string;
  stravaAccessToken: string | null;
  stravaRefreshToken: string | null;
  stravaTokenExpiresAt: Date | null;
};

export async function refreshStravaToken(dbUser: DbUser): Promise<string | null> {
  if (!dbUser.stravaRefreshToken) return null;
  try {
    const res = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.STRAVA_CLIENT_ID,
        client_secret: env.STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: dbUser.stravaRefreshToken,
      }),
    });
    const data = await res.json();
    if (!res.ok) return null;
    await db.update(userTable).set({
      stravaAccessToken: data.access_token,
      stravaRefreshToken: data.refresh_token,
      stravaTokenExpiresAt: new Date(data.expires_at * 1000),
    }).where(eq(userTable.id, dbUser.id));
    return data.access_token;
  } catch {
    return null;
  }
}

export async function getStravaActivities(dbUser: DbUser): Promise<{ ok: boolean; activities?: any[]; error?: unknown }> {
  let token = dbUser.stravaAccessToken;
  if (!token) return { ok: false, error: { type: 'no_token' } };

  if (!dbUser.stravaTokenExpiresAt || dbUser.stravaTokenExpiresAt.getTime() < Date.now() + 5 * 60 * 1000) {
    const refreshed = await refreshStravaToken(dbUser);
    if (refreshed) token = refreshed;
    else return { ok: false, error: { type: 'unauthorized' } };
  }

  const fetchAll = async (accessToken: string) => {
    const all: any[] = [];
    let page = 1;
    const perPage = 200;
    for (;;) {
      let res: Response;
      try {
        res = await fetch(
          `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=${page}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      } catch {
        return { ok: false, error: { type: 'network' } };
      }
      if (res.status === 401) return { ok: false, error: { type: 'unauthorized' } };
      if (res.status === 429) return { ok: false, error: { type: 'rate_limited' } };
      if (res.status === 403) return { ok: false, error: { type: 'forbidden' } };
      if (!res.ok) {
        let body: any = { message: `Strava error ${res.status}` };
        try { body = await res.json(); } catch { /* ignore */ }
        return { ok: false, error: body };
      }
      let batch: any[];
      try {
        batch = (await res.json()) as any[];
      } catch {
        return { ok: false, error: { type: 'parse' } };
      }
      if (!Array.isArray(batch)) {
        return { ok: false, error: { type: 'parse', message: 'Unexpected response from Strava' } };
      }
      all.push(...batch);
      if (batch.length < perPage) break;
      page++;
    }
    return { ok: true, activities: all };
  };

  let result = await fetchAll(token);
  if (!result.ok && result.error && result.error.type === 'unauthorized') {
    const refreshed = await refreshStravaToken(dbUser);
    if (refreshed) result = await fetchAll(refreshed);
  }
  return result;
}

export async function syncStravaToMedals(userId: string): Promise<{ imported: number; skipped: number; error?: string }> {
  const dbUser = (await db.select().from(userTable).where(eq(userTable.id, userId))).at(0) as DbUser | undefined;
  if (!dbUser) return { imported: 0, skipped: 0, error: 'User not found' };

  const result = await getStravaActivities(dbUser);
  if (!result.ok) {
    const type = (result.error as any)?.type;
    if (type === 'rate_limited') return { imported: 0, skipped: 0, error: 'Strava rate limit reached. Try again later.' };
    if (type === 'no_token' || type === 'unauthorized') return { imported: 0, skipped: 0, error: 'Strava not connected.' };
    return { imported: 0, skipped: 0, error: 'Could not fetch Strava activities.' };
  }

  const activities = result.activities!;

  const existing = await db.select({
    id: medals.id,
    stravaActivityId: medals.stravaActivityId,
    raceName: medals.raceName,
    eventDate: medals.eventDate,
  }).from(medals).where(eq(medals.userId, userId));
  const byId = new Set(existing.map((m) => m.stravaActivityId && String(m.stravaActivityId)).filter(Boolean));
  const byNameDate = new Set(
    existing
      .filter((m) => !m.stravaActivityId)
      .map((m) => `${m.raceName}|${new Date(m.eventDate).toISOString().slice(0, 10)}`)
  );

  let imported = 0;
  let skipped = 0;
  const insertValues: any[] = [];
  for (const act of activities) {
    const km = act.distance / 1000;
    const dist = categorizeDistance(km);
    const sid = String(act.id);
    const legacyKey = `${act.name}|${String(act.start_date).slice(0, 10)}`;
    if (byId.has(sid) || byNameDate.has(legacyKey)) { skipped++; continue; }
    insertValues.push({
      userId,
      raceName: act.name,
      eventDate: new Date(act.start_date),
      distance: dist,
      timeSeconds: Math.round(act.moving_time),
      place: null,
      stravaActivityId: sid,
    });
    byId.add(sid);
    byNameDate.add(legacyKey);
  }

  if (insertValues.length) {
    await db.insert(medals).values(insertValues);
    imported = insertValues.length;
  }
  return { imported, skipped };
}
