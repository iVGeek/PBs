# Medal Holder

A personal race medal portfolio built with SvelteKit, Supabase, and Tailwind CSS v4.

**Production:** https://pbs-buyz.onrender.com

## Tech Stack

SvelteKit 5 · TypeScript · Tailwind CSS v4 · Supabase (PostgreSQL) · Drizzle ORM · Lucia Auth · Paystack · Strava API

## Features

- **Medal Wall** — Display medals with race details, times, and paces
- **Personal Bests** — Auto-computed fastest times per distance
- **Bib Numbers** — Collect and display race bibs
- **Strava Import** — Sync activities from Strava
- **Theme Studio** — 18 themes + custom accent colors + font switching
- **Dark Theme** — Premium dark UI

## Development

```bash
npm install
npm run dev
```

## Environment Variables

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `STRAVA_CLIENT_ID` | `260355` |
| `STRAVA_CLIENT_SECRET` | From Strava API settings |
| `STRAVA_REDIRECT_URI` | `https://pbs-buyz.onrender.com/api/strava/callback` |
| `PUBLIC_PAYSTACK_PUBLIC_KEY` | From Paystack dashboard |
| `PAYSTACK_SECRET_KEY` | From Paystack dashboard |
| `PUBLIC_BASE_URL` | `https://pbs-buyz.onrender.com` |

## Strava Setup

In Strava API settings, set **Authorization Callback Domain** to `pbs-buyz.onrender.com`.

## Build

```bash
npm run build
```
