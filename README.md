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
- **Accounts** — Email + password signup/login, or continue with Strava
- **Paywall** — One-time Paystack payment unlock (free-tier friendly)

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

Schema changes are applied automatically at server startup (see `src/lib/server/db/bootstrap.ts`). Table creation/backups for new tables must be applied manually (`npm run db:push`).

## Paystack Setup

1. Create a [Paystack](https://paystack.com) account and complete business verification (required for live payments).
2. In Paystack Dashboard → Settings → API Keys → **Add certified domain**: `pbs-buyz.onrender.com`.
3. Set **live** keys in Render → Environment: `PAYSTACK_SECRET_KEY` (`sk_live_...`) and `PUBLIC_PAYSTACK_PUBLIC_KEY` (`pk_live_...`).
4. Price is set in `src/lib/server/currency.ts` → `BASE_AMOUNT_KES` (currently KES 5,000; auto-converted to NGN/GHS/ZAR/etc. per visitor locale).

## Strava Setup

In Strava API settings, set **Authorization Callback Domain** to `pbs-buyz.onrender.com`.

## Build

```bash
npm run build
```
