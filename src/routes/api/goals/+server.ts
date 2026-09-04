import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { goals } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const { user } = locals;
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await db.select().from(goals).where(eq(goals.userId, user.id)).orderBy(goals.createdAt);
  return json(rows);
};

export const POST: RequestHandler = async ({ locals, request }) => {
  const { user } = locals;
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const [goal] = await db.insert(goals).values({
    userId: user.id,
    name: body.name,
    targetDistance: body.targetDistance ?? null,
    targetTimeSeconds: body.targetTimeSeconds ?? null,
    targetDate: body.targetDate ? new Date(body.targetDate) : null,
    targetRaces: body.targetRaces ?? null,
    note: body.note ?? null,
    completed: body.completed ?? false,
  }).returning();
  return json(goal, { status: 201 });
};

export const PUT: RequestHandler = async ({ locals, request }) => {
  const { user } = locals;
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  if (!body.id) return json({ error: 'Missing id' }, { status: 400 });
  const [goal] = await db.update(goals).set({
    name: body.name,
    targetDistance: body.targetDistance ?? null,
    targetTimeSeconds: body.targetTimeSeconds ?? null,
    targetDate: body.targetDate ? new Date(body.targetDate) : null,
    targetRaces: body.targetRaces ?? null,
    note: body.note ?? null,
    completed: body.completed ?? false,
  }).where(and(eq(goals.id, body.id), eq(goals.userId, user.id))).returning();
  if (!goal) return json({ error: 'Not found' }, { status: 404 });
  return json(goal);
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
  const { user } = locals;
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'Missing id' }, { status: 400 });
  await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, user.id)));
  return json({ success: true });
};
