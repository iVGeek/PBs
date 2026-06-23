'use client'

import { useEffect, useState } from 'react'
import { Medal, Trophy, Hash, Activity, TrendingUp, Calendar, Award, Github } from 'lucide-react'
import { getMedals, getPBs, getBibs, getStravaConnected, getStravaAthlete, getAchievements } from '@/lib/store'
import { sampleMedals, samplePBs, sampleBibs } from '@/lib/seed-data'
import type { Medal as MedalType, PersonalBest, BibNumber, Achievement, YearStats } from '@/types'
import { formatPace, formatDistance, formatTime } from '@/lib/utils'
import { StatCard } from '@/components/StatCard'
import { QuickAddCard } from '@/components/QuickAddCard'
import Link from 'next/link'

export default function Dashboard() {
  const [medals, setMedals] = useState<MedalType[]>([])
  const [pbs, setPbs] = useState<PersonalBest[]>([])
  const [bibs, setBibs] = useState<BibNumber[]>([])
  const [stravaConnected, setStravaConnected] = useState(false)
  const [athlete, setAthlete] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let m = getMedals()
    let p = getPBs()
    let b = getBibs()
    if (m.length === 0 && p.length === 0 && b.length === 0) {
      setMedals(sampleMedals)
      setPbs(samplePBs)
      setBibs(sampleBibs)
    } else {
      setMedals(m)
      setPbs(p)
      setBibs(b)
    }
    setStravaConnected(getStravaConnected())
    setAthlete(getStravaAthlete())
    setIsLoaded(true)
  }, [])

  const totalMedals = medals.length
  const totalPBs = pbs.length
  const totalBibs = bibs.length
  const totalRaces = medals.length
  const recentMedal = medals[0]
  const latestPB = pbs[0]

  if (!isLoaded) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-running-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {athlete ? `${athlete.firstname}'s ` : 'Your '}
          <span className="text-gradient">Running Portfolio</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your medals, personal bests, and running journey all in one place.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Medals"
          value={totalMedals}
          icon={Medal}
          href="/medals"
          color="gold"
        />
        <StatCard
          title="Personal Bests"
          value={totalPBs}
          icon={Trophy}
          href="/pbs"
          color="green"
        />
        <StatCard
          title="Bib Numbers"
          value={totalBibs}
          icon={Hash}
          href="/bibs"
          color="blue"
        />
        <StatCard
          title="Races Run"
          value={totalRaces}
          icon={Activity}
          href="/activities"
          color="purple"
        />
      </div>

      {/* Quick Actions + Strava */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
          <QuickAddCard
            title="Add Medal"
            description="Log a race medal"
            icon={Medal}
            href="/medals"
            variant="gold"
          />
          <QuickAddCard
            title="Log PB"
            description="Record a personal best"
            icon={Trophy}
            href="/pbs"
            variant="green"
          />
          <QuickAddCard
            title="Add Bib"
            description="Save a race bib"
            icon={Hash}
            href="/bibs"
            variant="blue"
          />
        </div>

        {/* Strava Connect Card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-orange-500/10 p-2">
              <Activity className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold">Strava Sync</h3>
              <p className="text-xs text-muted-foreground">
                {stravaConnected ? 'Connected' : 'Sync your activities'}
              </p>
            </div>
          </div>
          {stravaConnected ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-running-500" />
                Connected as {athlete?.firstname} {athlete?.lastname}
              </div>
              <p className="text-xs text-muted-foreground">
                Your activities sync automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Connect Strava to auto-import your runs, extract PBs, and track progress.
              </p>
              <button className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors">
                <Activity className="h-4 w-4" />
                Connect Strava
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Highlights */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Medal */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Medal className="h-4 w-4 text-amber-500" />
              Latest Medal
            </h2>
            <Link href="/medals" className="text-xs text-running-500 hover:text-running-400 transition-colors">
              View all
            </Link>
          </div>
          {recentMedal ? (
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-2xl">
                🏅
              </div>
              <div>
                <h3 className="font-medium">{recentMedal.raceName}</h3>
                <p className="text-sm text-muted-foreground">
                  {recentMedal.distance} &middot; {recentMedal.time}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(recentMedal.eventDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No medals yet. Time to race!</p>
          )}
        </div>

        {/* Latest PB */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-running-500" />
              Latest Personal Best
            </h2>
            <Link href="/pbs" className="text-xs text-running-500 hover:text-running-400 transition-colors">
              View all
            </Link>
          </div>
          {latestPB ? (
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-running-500/20 to-running-600/10 text-2xl">
                ⚡
              </div>
              <div>
                <h3 className="font-medium">{latestPB.distance}</h3>
                <p className="text-sm text-muted-foreground">
                  {latestPB.time} &middot; {latestPB.pace} pace
                </p>
                <p className="text-xs text-muted-foreground">
                  {latestPB.race} &middot; {new Date(latestPB.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No PBs recorded yet.</p>
          )}
        </div>
      </div>

      {/* Footer attribution */}
      <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>PBs &amp; Medals &mdash; Your running portfolio powered by data.</p>
      </div>
    </div>
  )
}
