import { db } from './index';
import { sql } from 'drizzle-orm';

let done: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!done) {
    done = (async () => {
      await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "password_hash" text`);
    })().catch((err) => {
      done = null;
      throw err;
    });
  }
  return done;
}