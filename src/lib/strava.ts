import type { StravaTokens } from '@/types/strava'
import type { Medal, PersonalBest, BibNumber } from '@/types'

const TOKEN_KEY = 'mh_strava_tokens'

interface ImportResult {
  medals: Medal[]
  pbs: PersonalBest[]
  bibs: BibNumber[]
  summary: { medals: number; pbs: number; bibs: number }
}

export function getStravaTokens(): StravaTokens | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStravaTokens(t: StravaTokens): void {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(t))
}

export function clearStravaTokens(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function isStravaConnected(): boolean {
  const t = getStravaTokens()
  if (!t) return false
  return t.expires_at > Math.floor(Date.now() / 1000) + 300
}

export function getStravaAuthUrl(): string {
  return '/api/strava/auth'
}

export async function refreshStravaToken(): Promise<StravaTokens | null> {
  const t = getStravaTokens()
  if (!t) return null
  try {
    const res = await fetch('/api/strava/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: t.refresh_token }),
    })
    if (!res.ok) { clearStravaTokens(); return null }
    const data: StravaTokens = await res.json()
    setStravaTokens(data)
    return data
  } catch {
    clearStravaTokens()
    return null
  }
}

export async function importFromStrava(): Promise<ImportResult | { error: string }> {
  let tokens = getStravaTokens()
  if (!tokens) return { error: 'Not connected to Strava' }

  if (tokens.expires_at <= Math.floor(Date.now() / 1000) + 60) {
    const refreshed = await refreshStravaToken()
    if (!refreshed) return { error: 'Strava session expired. Reconnect.' }
    tokens = refreshed
  }

  try {
    const res = await fetch('/api/strava/import', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (!res.ok) {
      const text = await res.text()
      return { error: `Import failed: ${text}` }
    }
    return await res.json()
  } catch {
    return { error: 'Network error during import.' }
  }
}
