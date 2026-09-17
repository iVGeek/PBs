import { lucia } from '$lib/server/auth';
import { ensureSchema } from '$lib/server/db/bootstrap';
import type { Handle } from '@sveltejs/kit';

let schemaReady: Promise<void> | null = null;

async function ready() {
  if (!schemaReady) schemaReady = ensureSchema();
  return schemaReady;
}

export const handle: Handle = async ({ event, resolve }) => {
  await ready().catch((err) => console.error('schema bootstrap failed:', err));

  const sessionId = event.cookies.get(lucia.sessionCookieName);
  if (!sessionId) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '/',
      ...sessionCookie.attributes,
    });
  }
  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '/',
      ...sessionCookie.attributes,
    });
  }
  event.locals.user = user;
  event.locals.session = session;
  return resolve(event);
};
