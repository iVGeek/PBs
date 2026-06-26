import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { bibs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const { user } = locals;
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await db.select().from(bibs).where(eq(bibs.userId, user.id)).orderBy(bibs.createdAt);
  return json(rows);
};

export const POST: RequestHandler = async ({ locals, request }) => {
  const { user } = locals;
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const [bib] = await db.insert(bibs).values({
    userId: user.id,
    bibNumber: body.bibNumber,
    eventName: body.eventName,
    eventDate: new Date(body.eventDate),
    distance: body.distance ?? null,
    photoUrl: body.photoUrl ?? null,
    notes: body.notes ?? null,
  }).returning();
  return json(bib, { status: 201 });
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
  const { user } = locals;
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'Missing id' }, { status: 400 });
  await db.delete(bibs).where(eq(bibs.id, id));
  return json({ success: true });
};
