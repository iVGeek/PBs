import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

async function refreshToken(dbUser: {
  id: string;
  stravaRefreshToken: string | null;
}): Promise<string | null> {
  if (!dbUser.stravaRefreshToken) return null;
  try {
    const refreshRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.STRAVA_CLIENT_ID,
        client_secret: env.STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: dbUser.stravaRefreshToken,
      }),
    });
    const refreshData = await refreshRes.json();
    if (!refreshRes.ok) return null;
    await db.update(userTable).set({
      stravaAccessToken: refreshData.access_token,
      stravaRefreshToken: refreshData.refresh_token,
      stravaTokenExpiresAt: new Date(refreshData.expires_at * 1000),
    }).where(eq(userTable.id, dbUser.id));
    return refreshData.access_token;
  } catch {
    return null;
  }
}

export const GET: RequestHandler = async ({ locals }) => {
  const { user } = locals;
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = (await db.select().from(userTable).where(eq(userTable.id, user.id))).at(0);
  if (!dbUser || !dbUser.stravaAccessToken) return json({ error: 'No token' }, { status: 400 });

  let token = dbUser.stravaAccessToken;

  // Refresh if token is expired (or will expire within 5 min)
  if (
    !dbUser.stravaTokenExpiresAt ||
    dbUser.stravaTokenExpiresAt.getTime() < Date.now() + 5 * 60 * 1000
  ) {
    const newToken = await refreshToken(dbUser);
    if (newToken) {
      token = newToken;
    } else {
      return json({ error: 'Strava token expired. Please reconnect Strava.' }, { status: 401 });
    }
  }

  const fetchAll = async (accessToken: string): Promise<{ ok: boolean; activities?: any[]; error?: unknown }> => {
    const allActivities: any[] = [];
    let page = 1;
    const perPage = 200;

    for (;;) {
      const activitiesRes = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=${page}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (activitiesRes.status === 401) return { ok: false, error: { type: 'unauthorized', raw: await activitiesRes.json() } };
      if (!activitiesRes.ok) {
        const err = await activitiesRes.json();
        return { ok: false, error: err };
      }
      const batch = (await activitiesRes.json()) as any[];
      allActivities.push(...batch);
      if (batch.length < perPage) break;
      page++;
    }
    return { ok: true, activities: allActivities };
  };

  let result = await fetchAll(token);

  // If unauthorized, try refreshing once and retry
  if (!result.ok && result.error && (result.error as any).type === 'unauthorized') {
    const newToken = await refreshToken(dbUser);
    if (newToken) {
      result = await fetchAll(newToken);
    } else {
      return json({ error: 'Strava token expired. Please reconnect Strava.' }, { status: 401 });
    }
  }

  if (!result.ok) {
    let message = 'Failed to fetch activities from Strava.';
    if (result.error && typeof result.error === 'object') {
      const e = result.error as any;
      if (e.message) message = e.message;
      if (e.errors && e.errors.length) message = e.errors.map((x: any) => x.message).join(' ');
    }
    return json({ error: message }, { status: 400 });
  }

  return json({ activities: result.activities });
};