import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get('code');
  if (!code) redirect(302, '/login?error=no_code');

  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) redirect(302, '/login?error=token_exchange_failed');

  const athlete = tokenData.athlete;
  const stravaId = String(athlete.id);
  const accessToken = tokenData.access_token;
  const refreshToken = tokenData.refresh_token;
  const expiresAt = new Date(tokenData.expires_at * 1000);

  let user = (await db.select().from(userTable).where(eq(userTable.stravaId, stravaId))).at(0);

  if (!user) {
    const userId = crypto.randomUUID();
    await db.insert(userTable).values({
      id: userId,
      stravaId,
      stravaAccessToken: accessToken,
      stravaRefreshToken: refreshToken,
      stravaTokenExpiresAt: expiresAt,
      name: `${athlete.firstname} ${athlete.lastname}`,
      email: null,
      avatar: athlete.profile,
      bio: '',
      units: 'km',
      paid: false,
      onboardingComplete: false,
    });
    user = (await db.select().from(userTable).where(eq(userTable.stravaId, stravaId))).at(0)!;
  } else {
    await db.update(userTable).set({
      stravaAccessToken: accessToken,
      stravaRefreshToken: refreshToken,
      stravaTokenExpiresAt: expiresAt,
      avatar: athlete.profile,
      name: `${athlete.firstname} ${athlete.lastname}`,
    }).where(eq(userTable.id, user.id));
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies.set(sessionCookie.name, sessionCookie.value, {
    path: '/',
    ...sessionCookie.attributes,
  });

  redirect(302, user.onboardingComplete ? (user.paid ? '/' : '/payment') : '/register');
};
