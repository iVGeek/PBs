import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from './db';
import { sessionTable, userTable } from './db/schema';

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getUserAttributes: (attributes) => ({
    id: attributes.id,
    stravaId: attributes.stravaId,
    name: attributes.name,
    email: attributes.email,
    avatar: attributes.avatar,
    bio: attributes.bio,
    units: attributes.units,
    paid: attributes.paid,
    onboardingComplete: attributes.onboardingComplete,
  }),
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      id: string;
      stravaId: string | null;
      name: string;
      email: string | null;
      avatar: string | null;
      bio: string | null;
      units: string;
      paid: boolean;
      onboardingComplete: boolean;
    };
  }
}
