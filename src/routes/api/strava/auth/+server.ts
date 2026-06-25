import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const clientId = env.STRAVA_CLIENT_ID;
  const redirectUri = env.STRAVA_REDIRECT_URI || `${url.origin}/api/strava/callback`;
  const scope = 'activity:read_all,profile:read_all';
  const stravaUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${encodeURIComponent(scope)}`;
  redirect(302, stravaUrl);
};
