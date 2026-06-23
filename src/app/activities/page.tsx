'use client'

import { useEffect, useState } from 'react'
import { Activity, Clock, Route, TrendingUp, Heart, Mountain, Zap } from 'lucide-react'
import { getStravaConnected, getStravaAthlete } from '@/lib/store'
import { formatPace, formatDistance, formatTime, formatDate } from '@/lib/utils'

// Use sample activity data for demo
const sampleActivities = [
  { id: 1, name: 'Morning Run', distance: 10200, moving_time: 3240, elapsed_time: 3420, total_elevation_gain: 45, type: 'Run', start_date_local: '2024-06-22T07:30:00Z', average_speed: 3.15, max_speed: 4.2, average_heartrate: 152, max_heartrate: 172, kudos_count: 12 },
  { id: 2, name: 'Tempo Run', distance: 8200, moving_time: 2460, elapsed_time: 2580, total_elevation_gain: 28, type: 'Run', start_date_local: '2024-06-20T06:45:00Z', average_speed: 3.33, max_speed: 4.5, average_heartrate: 158, max_heartrate: 178, kudos_count: 8 },
  { id: 3, name: 'Long Slow Distance', distance: 21100, moving_time: 6780, elapsed_time: 7200, total_elevation_gain: 120, type: 'Run', start_date_local: '2024-06-18T06:00:00Z', average_speed: 3.11, max_speed: 3.8, average_heartrate: 145, max_heartrate: 162, kudos_count: 15 },
  { id: 4, name: 'Recovery Jog', distance: 5100, moving_time: 1920, elapsed_time: 2100, total_elevation_gain: 15, type: 'Run', start_date_local: '2024-06-16T08:00:00Z', average_speed: 2.66, max_speed: 3.1, average_heartrate: 138, max_heartrate: 148, kudos_count: 5 },
  { id: 5, name: 'Interval Session', distance: 6400, moving_time: 2040, elapsed_time: 2700, total_elevation_gain: 10, type: 'Run', start_date_local: '2024-06-14T07:00:00Z', average_speed: 3.14, max_speed: 5.2, average_heartrate: 165, max_heartrate: 185, kudos_count: 10 },
]

export default function ActivitiesPage() {
  const [stravaConnected] = useState(getStravaConnected)
  const [athlete] = useState(getStravaAthlete())
  const [activities] = useState(sampleActivities)

  const totalDistance = activities.reduce((s, a) => s + a.distance, 0)
  const totalTime = activities.reduce((s, a) => s + a.moving_time, 0)
  const avgPace = totalTime > 0 && totalDistance > 0 ? totalDistance / totalTime : 0
  const totalElevation = activities.reduce((s, a) => s + a.total_elevation_gain, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
        <p className="mt-1 text-muted-foreground">Your recent training activities</p>
      </div>

      {/* Activity Summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Route className="h-4 w-4 text-running-500" />
            Total Distance
          </div>
          <div className="text-2xl font-bold">{formatDistance(totalDistance)}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4 text-blue-500" />
            Total Time
          </div>
          <div className="text-2xl font-bold">{formatTime(totalTime)}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            Avg Pace
          </div>
          <div className="text-2xl font-bold">{avgPace > 0 ? formatPace(1000 / avgPace) : '--'}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Mountain className="h-4 w-4 text-purple-500" />
            Elevation Gain
          </div>
          <div className="text-2xl font-bold">{totalElevation}m</div>
        </div>
      </div>

      {/* Strava Connect Banner */}
      {!stravaConnected && (
        <div className="mb-8 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-orange-500 shrink-0" />
            <div>
              <p className="text-sm font-medium">Connect to Strava for live activity sync</p>
              <p className="text-xs text-muted-foreground">Auto-import runs and extract personal bests</p>
            </div>
            <button className="ml-auto shrink-0 rounded-lg bg-orange-600 px-4 py-2 text-xs font-medium text-white hover:bg-orange-700 transition-colors">
              Connect
            </button>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-3">
        {activities.map((a) => {
          const pace = a.average_speed > 0 ? formatPace(1000 / a.average_speed) : '--'
          return (
            <div
              key={a.id}
              className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-running-500/10 p-2">
                    <Activity className="h-5 w-5 text-running-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{a.name}</h3>
                    <p className="text-xs text-muted-foreground">{formatDate(a.start_date_local)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {a.kudos_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-red-400" />
                      {a.kudos_count}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Route className="h-3.5 w-3.5 text-running-500" />
                  {formatDistance(a.distance)}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  {formatTime(a.moving_time)}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  {pace}
                </span>
                {a.average_heartrate && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Heart className="h-3.5 w-3.5 text-red-400" />
                    {a.average_heartrate} bpm
                  </span>
                )}
                {a.total_elevation_gain > 0 && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Mountain className="h-3.5 w-3.5 text-purple-500" />
                    {a.total_elevation_gain}m
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
