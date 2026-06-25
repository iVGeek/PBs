import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { medals } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const { user } = locals;
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await db.select().from(medals).where(eq(medals.userId, user.id)).orderBy(medals.createdAt);
  return json(rows);
};

export const POST: RequestHandler = async ({ locals, request }) => {
  const { user } = locals;
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const [medal] = await db.insert(medals).values({
    userId: user.id,
    raceName: body.raceName,
    eventDate: new Date(body.eventDate),
    distance: body.distance,
    timeSeconds: body.timeSeconds,
    place: body.place ?? null,
    photoUrl: body.photoUrl ?? null,
    notes: body.notes ?? null,
  }).returning();
  return json(medal, { status: 201 });
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
  const { user } = locals;
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'Missing id' }, { status: 400 });
  await db.delete(medals).where(eq(medals.id, id));
  return json({ success: true });
};
