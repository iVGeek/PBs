import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { medals, userTable } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';

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
      const res = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=${page}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.status === 401) return { ok: false, error: { type: 'unauthorized' } };
      if (res.status === 429) return { ok: false, error: { type: 'rate_limited' } };
      if (!res.ok) return { ok: false, error: (await res.json()) };
      const batch = (await res.json()) as any[];
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

function categorizeDistance(km: number): string {
  if (km >= 4.8 && km <= 5.2) return '5K';
  if (km >= 9.8 && km <= 10.2) return '10K';
  if (km >= 14.8 && km <= 15.2) return '15K';
  if (km >= 20.8 && km <= 21.3) return '21K';
  if (km >= 29.8 && km <= 30.3) return '30K';
  if (km >= 34.8 && km <= 35.3) return '35K';
  if (km >= 41.8 && km <= 42.6) return '42K';
  return km.toFixed(2) + ' km';
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

  const runTypes = ['Run', 'TrailRun', 'VirtualRun'];
  const running = result.activities!.filter((a: any) => runTypes.includes(a.type));

  const existing = await db.select({ id: medals.id, stravaActivityId: medals.stravaActivityId, raceName: medals.raceName })
    .from(medals).where(eq(medals.userId, userId));
  const byId = new Set(existing.map((m) => m.stravaActivityId).filter(Boolean));
  const byName = new Set(existing.map((m) => m.raceName));

  let imported = 0;
  let skipped = 0;
  const insertValues: any[] = [];
  for (const act of running) {
    const km = act.distance / 1000;
    const dist = categorizeDistance(km);
    const sid = String(act.id);
    if (byId.has(sid) || byName.has(act.name)) { skipped++; continue; }
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
    byName.add(act.name);
  }

  if (insertValues.length) {
    await db.insert(medals).values(insertValues);
    imported = insertValues.length;
  }
  return { imported, skipped };
}
