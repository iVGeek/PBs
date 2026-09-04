import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getStravaActivities } from '$lib/server/strava';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const { user } = locals;
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = (await db.select().from(userTable).where(eq(userTable.id, user.id))).at(0);
  if (!dbUser || !dbUser.stravaAccessToken) return json({ error: 'No token' }, { status: 400 });

  const result = await getStravaActivities(dbUser as any);
  if (!result.ok) {
    const type = (result.error as any)?.type;
    if (type === 'rate_limited') return json({ error: 'Strava rate limit reached. Please wait a bit and try again.' }, { status: 429 });
    if (type === 'no_token' || type === 'unauthorized') return json({ error: 'Strava token expired. Please reconnect Strava.' }, { status: 401 });
    let message = 'Failed to fetch activities from Strava.';
    const e = result.error as any;
    if (e && e.message) message = e.message;
    return json({ error: message }, { status: 400 });
  }

  return json({ activities: result.activities });
};
