import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getStravaActivities } from '$lib/server/strava';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, cookies }) => {
  const { user } = locals;
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = (await db.select().from(userTable).where(eq(userTable.id, user.id))).at(0);
  if (!dbUser || !dbUser.stravaAccessToken) return json({ error: 'No token' }, { status: 400 });

  const result = await getStravaActivities(dbUser as any);
  if (!result.ok) {
    const type = (result.error as any)?.type;
    if (type === 'rate_limited') return json({ error: 'Strava rate limit reached. Please wait a bit and try again.' }, { status: 429 });
    if (type === 'no_token' || type === 'unauthorized') return json({ error: 'Strava token expired. Please reconnect Strava.' }, { status: 401 });
    if (type === 'forbidden') return json({ error: 'Strava denied access to your activities. Reconnect Strava and approve full activity access.', reconnect: true }, { status: 403 });
    let message = 'Failed to fetch activities from Strava.';
    const e = result.error as any;
    if (e && e.message) message = e.message;
    return json({ error: message }, { status: 400 });
  }

  const grantedScope = (cookies.get('strava_scope') ?? '').split(/\s+/).filter(Boolean);
  const hasFullAccess = grantedScope.some((s) => s.toLowerCase() === 'activity:read_all');
  const scopeWarning =
    grantedScope.length > 0 && !hasFullAccess
      ? 'Your Strava connection is missing the "activity:read_all" permission, so private activities are hidden from import. Reconnect Strava and approve full activity access to import everything.'
      : '';
  return json({
    activities: result.activities,
    scopeWarning,
  });
};
