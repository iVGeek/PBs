// Simple client-side store using localStorage

import type { Medal, PersonalBest, BibNumber, Achievement, Shoe, RaceCalendar } from '@/types'

const KEYS = {
  medals: 'pbs_medals',
  pbs: 'pbs_personal_bests',
  bibs: 'pbs_bibs',
  achievements: 'pbs_achievements',
  shoes: 'pbs_shoes',
  races: 'pbs_races',
  stravaConnected: 'pbs_strava_connected',
  stravaAthlete: 'pbs_strava_athlete',
  onboardingDone: 'pbs_onboarding',
} as const

function getStore<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setStore<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* noop */ }
}

// Medals
export function getMedals(): Medal[] {
  return getStore<Medal[]>(KEYS.medals, [])
}
export function setMedals(medals: Medal[]): void {
  setStore(KEYS.medals, medals)
}
export function addMedal(medal: Medal): void {
  const medals = getMedals()
  medals.unshift(medal)
  setMedals(medals)
}
export function deleteMedal(id: string): void {
  setMedals(getMedals().filter(m => m.id !== id))
}

// Personal Bests
export function getPBs(): PersonalBest[] {
  return getStore<PersonalBest[]>(KEYS.pbs, [])
}
export function setPBs(pbs: PersonalBest[]): void {
  setStore(KEYS.pbs, pbs)
}
export function addPB(pb: PersonalBest): void {
  const list = getPBs()
  list.unshift(pb)
  setPBs(list)
}
export function deletePB(id: string): void {
  setPBs(getPBs().filter(p => p.id !== id))
}

// Bibs
export function getBibs(): BibNumber[] {
  return getStore<BibNumber[]>(KEYS.bibs, [])
}
export function setBibs(bibs: BibNumber[]): void {
  setStore(KEYS.bibs, bibs)
}
export function addBib(bib: BibNumber): void {
  const list = getBibs()
  list.unshift(bib)
  setBibs(list)
}
export function deleteBib(id: string): void {
  setBibs(getBibs().filter(b => b.id !== id))
}

// Achievements
export function getAchievements(): Achievement[] {
  return getStore<Achievement[]>(KEYS.achievements, [])
}
export function setAchievements(achievements: Achievement[]): void {
  setStore(KEYS.achievements, achievements)
}

// Shoes
export function getShoes(): Shoe[] {
  return getStore<Shoe[]>(KEYS.shoes, [])
}
export function setShoes(shoes: Shoe[]): void {
  setStore(KEYS.shoes, shoes)
}

// Race Calendar
export function getRaces(): RaceCalendar[] {
  return getStore<RaceCalendar[]>(KEYS.races, [])
}
export function setRaces(races: RaceCalendar[]): void {
  setStore(KEYS.races, races)
}

// Strava
export function getStravaConnected(): boolean {
  return getStore<boolean>(KEYS.stravaConnected, false)
}
export function setStravaConnected(val: boolean): void {
  setStore(KEYS.stravaConnected, val)
}
export function getStravaAthlete(): any {
  return getStore<any>(KEYS.stravaAthlete, null)
}
export function setStravaAthlete(data: any): void {
  setStore(KEYS.stravaAthlete, data)
}

// Onboarding
export function getOnboardingDone(): boolean {
  return getStore<boolean>(KEYS.onboardingDone, false)
}
export function setOnboardingDone(val: boolean): void {
  setStore(KEYS.onboardingDone, val)
}
