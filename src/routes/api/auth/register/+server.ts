import { json } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '$lib/server/password';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { name, email, password } = await request.json();

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return json({ error: 'Please enter your name (at least 2 characters).' }, { status: 400 });
  }
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const existing = (await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, cleanEmail))).at(0);
  if (existing) {
    return json({ error: 'An account with this email already exists. Please log in.' }, { status: 409 });
  }

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await db.insert(userTable).values({
    id: userId,
    name: name.trim(),
    email: cleanEmail,
    passwordHash,
    bio: '',
    units: 'km',
    paid: false,
    onboardingComplete: false,
  });

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies.set(sessionCookie.name, sessionCookie.value, { path: '/', ...sessionCookie.attributes });

  return json({ success: true });
};