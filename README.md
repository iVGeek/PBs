# PBs & Medals - Running Portfolio

A personal running portfolio website to showcase race medals, track personal bests, collect bib numbers, and sync with Strava activities.

## Features

- **Medal Portfolio** - 3D card display of race medals with details (time, pace, location, place)
- **Personal Bests** - Track PBs across distances (1 Mile to Marathon) with filterable table view
- **Bib Numbers** - Visual collection of race bib numbers
- **Activities Feed** - Training log with distance, pace, heart rate, elevation
- **Strava Sync** - OAuth integration to auto-import activities (config via `.env.local`)
- **Dashboard** - Stats overview with quick-add cards
- **Dark Theme** - Sleek dark UI with running-inspired green accents

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data**: localStorage (client-side), ready for any database backend

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Strava Integration

1. Create an app at https://www.strava.com/settings/api
2. Copy `.env.local` and fill in your credentials
3. Click "Connect Strava" on the dashboard

## Build

```bash
npm run build
npm start
```
