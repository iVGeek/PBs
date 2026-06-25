import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { refresh_token } = await request.json();
  if (!refresh_token) return json({ error: 'Missing refresh_token' }, { status: 400 });

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });
  const data = await res.json();
  if (!res.ok) return json({ error: data }, { status: 400 });
  return json(data);
};
