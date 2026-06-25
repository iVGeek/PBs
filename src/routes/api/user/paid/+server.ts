import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ locals }) => {
  const { user } = locals;
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  await db.update(userTable).set({ paid: true }).where(eq(userTable.id, user.id));
  return json({ success: true });
};
