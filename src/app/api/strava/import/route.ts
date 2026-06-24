import { NextRequest, NextResponse } from 'next/server'
import type { StravaActivity } from '@/types/strava'
import type { Medal, PersonalBest, BibNumber } from '@/types'

function formatDistance(meters: number): string {
  const km = meters / 1000
  if (km > 40) return 'Marathon'
  if (km > 19) return 'Half Marathon'
  if (km > 15) return '10 Mile'
  if (km > 9) return '10K'
  if (km > 7) return '5 Mile'
  if (km > 4) return '5K'
  if (km > 1.4) return '1 Mile'
  return `${km.toFixed(1)}K`
}

function formatPace(mps: number): string {
  if (!mps || mps === 0) return ''
  const pace = 1000 / mps / 60
  const min = Math.floor(pace)
  const sec = Math.round((pace - min) * 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function calcDistanceBucket(meters: number): string {
  const km = meters / 1000
  if (km >= 40) return 'Marathon'
  if (km >= 19) return 'Half Marathon'
  if (km >= 15) return '10 Mile'
  if (km >= 9) return '10K'
  if (km >= 7) return '5 Mile'
  if (km >= 4) return '5K'
  if (km >= 1.4) return '1 Mile'
  return 'Other'
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'No token' }, { status: 401 })
  }

  try {
    const activitiesRes = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=50',
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (!activitiesRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: activitiesRes.status })
    }
    const activities: StravaActivity[] = await activitiesRes.json()

    const runs = activities.filter(
      (a) => a.type === 'Run' || a.type === 'TrailRun' || a.type === 'VirtualRun',
    )

    const medals: Medal[] = []
    const pbs: PersonalBest[] = []
    const bibs: BibNumber[] = []
    const pbMap = new Map<string, { time: string; seconds: number; date: string; race: string }>()

    for (const a of runs) {
      const seconds = a.moving_time || a.elapsed_time
      const distanceLabel = formatDistance(a.distance)
      const time = formatTime(seconds)
      const pace = formatPace(a.average_speed)
      const isPB = a.pr_count > 0 || a.achievement_count >= 3
      const bucket = calcDistanceBucket(a.distance)

      const existing = pbMap.get(bucket)
      if (!existing || seconds < existing.seconds) {
        pbMap.set(bucket, { time, seconds, date: a.start_date.split('T')[0], race: a.name })
      }

      const loc = [a.location_city, a.location_country].filter(Boolean).join(', ')

      medals.push({
        id: `strava-${a.id}`,
        raceName: a.name,
        eventDate: a.start_date.split('T')[0],
        location: loc || undefined,
        distance: distanceLabel,
        time: time || undefined,
        pace: pace || undefined,
        notes: a.description || undefined,
        isPB,
      })

      bibs.push({
        id: `bib-strava-${a.id}`,
        number: String(a.id).slice(-6),
        raceName: a.name,
        eventDate: a.start_date.split('T')[0],
        distance: distanceLabel,
        notes: a.description || undefined,
      })
    }

    for (const [distance, data] of Array.from(pbMap.entries())) {
      pbs.push({
        id: `pb-strava-${distance.replace(/\s/g, '')}`,
        distance,
        time: data.time,
        pace: '',
        date: data.date,
        race: data.race,
      })
    }

    return NextResponse.json({
      medals,
      pbs,
      bibs,
      summary: {
        medals: medals.length,
        pbs: pbs.length,
        bibs: bibs.length,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
