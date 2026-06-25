import { pgTable, text, integer, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
  id: text('id').primaryKey(),
  stravaId: text('strava_id').unique(),
  stravaAccessToken: text('strava_access_token'),
  stravaRefreshToken: text('strava_refresh_token'),
  stravaTokenExpiresAt: timestamp('strava_token_expires_at', { withTimezone: true }),
  name: text('name').notNull().default(''),
  email: text('email'),
  avatar: text('avatar'),
  bio: text('bio').default(''),
  units: text('units').notNull().default('km'),
  paid: boolean('paid').notNull().default(false),
  onboardingComplete: boolean('onboarding_complete').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessionTable = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => userTable.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const medals = pgTable('medals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => userTable.id),
  raceName: text('race_name').notNull(),
  eventDate: timestamp('event_date').notNull(),
  distance: text('distance').notNull(),
  timeSeconds: integer('time_seconds').notNull(),
  place: integer('place'),
  photoUrl: text('photo_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const bibs = pgTable('bibs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => userTable.id),
  bibNumber: text('bib_number').notNull(),
  eventName: text('event_name').notNull(),
  eventDate: timestamp('event_date').notNull(),
  distance: text('distance'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
