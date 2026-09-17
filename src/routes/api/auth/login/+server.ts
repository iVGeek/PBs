import { json } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '$lib/server/password';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { email, password } = await request.json();

  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!cleanEmail || typeof password !== 'string' || !password) {
    return json({ error: 'Please enter your email and password.' }, { status: 400 });
  }

  const user = (await db.select().from(userTable).where(eq(userTable.email, cleanEmail))).at(0);

  if (!user) {
    return json({ error: 'No account found with this email.' }, { status: 401 });
  }

  if (!user.passwordHash) {
    return json({ error: 'This account was created with Strava. Please continue with Strava instead.' }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies.set(sessionCookie.name, sessionCookie.value, { path: '/', ...sessionCookie.attributes });

  return json({ success: true });
};