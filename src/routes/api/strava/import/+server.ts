import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const { user } = locals;
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = (await db.select().from(userTable).where(eq(userTable.id, user.id))).at(0);
  if (!dbUser || !dbUser.stravaAccessToken) return json({ error: 'No token' }, { status: 400 });

  let token = dbUser.stravaAccessToken;
  if (dbUser.stravaTokenExpiresAt && new Date() > dbUser.stravaTokenExpiresAt) {
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
    if (refreshRes.ok) {
      token = refreshData.access_token;
      await db.update(userTable).set({
        stravaAccessToken: refreshData.access_token,
        stravaRefreshToken: refreshData.refresh_token,
        stravaTokenExpiresAt: new Date(refreshData.expires_at * 1000),
      }).where(eq(userTable.id, user.id));
    }
  }

  const activitiesRes = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=50', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const activities = await activitiesRes.json();
  if (!activitiesRes.ok) return json({ error: activities }, { status: 400 });

  return json({ activities });
};
