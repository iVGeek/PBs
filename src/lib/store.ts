import type { Medal, PersonalBest, BibNumber, Profile, StoredUser, CurrentSession } from '@/types'

const KEYS = {
  medals: 'mh_medals',
  pbs: 'mh_personal_bests',
  bibs: 'mh_bibs',
  profile: 'mh_profile',
  users: 'mh_users',
  currentUser: 'mh_current_user',
} as const

function getStore<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback }
  catch { return fallback }
}
function setStore<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* noop */ }
}

function removeStore(key: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(key) } catch { /* noop */ }
}

function getUserId(): string | null {
  const session = getStore<CurrentSession | null>(KEYS.currentUser, null)
  return session?.userId || null
}

function scopeKey(base: string): string {
  const uid = getUserId()
  return uid ? `${base}_${uid}` : base
}

export function getProfile(): Profile | null { return getStore<Profile | null>(scopeKey(KEYS.profile), null) }
export function setProfile(p: Profile): void { setStore(scopeKey(KEYS.profile), p) }

export function getMedals(): Medal[] { return getStore<Medal[]>(scopeKey(KEYS.medals), []) }
export function setMedals(medals: Medal[]): void { setStore(scopeKey(KEYS.medals), medals) }
export function addMedal(medal: Medal): void { const m = getMedals(); m.unshift(medal); setMedals(m) }
export function deleteMedal(id: string): void { setMedals(getMedals().filter(x => x.id !== id)) }

export function getPBs(): PersonalBest[] { return getStore<PersonalBest[]>(scopeKey(KEYS.pbs), []) }
export function setPBs(pbs: PersonalBest[]): void { setStore(scopeKey(KEYS.pbs), pbs) }
export function addPB(pb: PersonalBest): void { const l = getPBs(); l.unshift(pb); setPBs(l) }
export function deletePB(id: string): void { setPBs(getPBs().filter(x => x.id !== id)) }

export function getBibs(): BibNumber[] { return getStore<BibNumber[]>(scopeKey(KEYS.bibs), []) }
export function setBibs(bibs: BibNumber[]): void { setStore(scopeKey(KEYS.bibs), bibs) }
export function addBib(bib: BibNumber): void { const l = getBibs(); l.unshift(bib); setBibs(l) }
export function deleteBib(id: string): void { setBibs(getBibs().filter(x => x.id !== id)) }

export function distanceSortKey(distance: string): number {
  const map: Record<string, number> = {
    '1 Mile': 1.6,
    '5K': 5,
    '5 Mile': 8,
    '10K': 10,
    '10 Mile': 16.1,
    'Half Marathon': 21.1,
    'Marathon': 42.2,
    '50K': 50,
  }
  return map[distance] ?? 999
}

export function timeToSeconds(time: string): number {
  const parts = time.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parts[0] || 0
}

export function computePBsFromMedals(): PersonalBest[] {
  const medals = getMedals()
  const pbMap = new Map<string, { time: string; date: string; race: string; pace: string }>()

  for (const m of medals) {
    if (!m.time) continue
    const existing = pbMap.get(m.distance)
    if (!existing || timeToSeconds(m.time) < timeToSeconds(existing.time)) {
      pbMap.set(m.distance, { time: m.time, date: m.eventDate, race: m.raceName, pace: m.pace || '' })
    }
  }

  const result: PersonalBest[] = []
  pbMap.forEach((data, distance) => {
    result.push({
      id: `pb_${distance.replace(/\s+/g, '_').toLowerCase()}`,
      distance,
      time: data.time,
      pace: data.pace,
      date: data.date,
      race: data.race,
    })
  })

  return result.sort((a, b) => distanceSortKey(a.distance) - distanceSortKey(b.distance))
}

export function mergeComputedPBs(): PersonalBest[] {
  const computed = computePBsFromMedals()
  const manual = getPBs()
  const manualByDistance = new Map(manual.map(p => [p.distance, p]))
  const merged = new Map<string, PersonalBest>()

  for (const pb of computed) {
    const m = manualByDistance.get(pb.distance)
    if (m && timeToSeconds(m.time) < timeToSeconds(pb.time)) {
      merged.set(pb.distance, m)
    } else {
      merged.set(pb.distance, pb)
    }
    manualByDistance.delete(pb.distance)
  }

  manualByDistance.forEach((pb) => {
    merged.set(pb.distance, pb)
  })

  return Array.from(merged.values()).sort((a, b) => distanceSortKey(a.distance) - distanceSortKey(b.distance))
}

export function importFromStravaData(data: {
  medals: Medal[]; pbs: PersonalBest[]; bibs: BibNumber[]
}): { medals: number; pbs: number; bibs: number } {
  const existingMedals = getMedals()
  const existingPBs = getPBs()
  const existingBibs = getBibs()
  const existingIds = new Set(existingMedals.map(m => m.id))

  const newMedals = data.medals.filter(m => !existingIds.has(m.id))
  const newPBs = data.pbs.filter(p => !existingPBs.some(e => e.distance === p.distance))
  const newBibs = data.bibs.filter(b => !existingBibs.some(e => e.number === b.number && e.raceName === b.raceName))

  setMedals([...newMedals, ...existingMedals])
  setPBs([...newPBs, ...existingPBs])
  setBibs([...newBibs, ...existingBibs])

  return { medals: newMedals.length, pbs: newPBs.length, bibs: newBibs.length }
}

// ─── Auth helpers ────────────────────────────────────────

export function getUsers(): StoredUser[] { return getStore<StoredUser[]>(KEYS.users, []) }
export function setUsers(users: StoredUser[]): void { setStore(KEYS.users, users) }

export function getUserById(id: string): StoredUser | undefined {
  return getUsers().find(u => u.id === id)
}

export function createOrLoginStravaUser(athleteId: number, name: string, email: string): StoredUser {
  const users = getUsers()
  const id = `strava_${athleteId}`
  let user = users.find(u => u.id === id)
  if (!user) {
    user = { id, name, email: email.toLowerCase(), paid: false, stravaAthleteId: athleteId, createdAt: new Date().toISOString() }
    users.push(user)
    setUsers(users)
  }
  return user
}

export function getUserByEmail(email: string): StoredUser | undefined {
  return getUsers().find(u => u.email === email.toLowerCase())
}

export function markUserPaid(userId: string): void {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx !== -1) { users[idx].paid = true; setUsers(users) }
}

export function setCurrentUser(session: CurrentSession | null): void {
  if (session) setStore(KEYS.currentUser, session)
  else localStorage.removeItem(KEYS.currentUser)
}

export function getCurrentUser(): CurrentSession | null {
  return getStore<CurrentSession | null>(KEYS.currentUser, null)
}

/** Remove all scoped data for the current user (medals, PBs, bibs, profile) */
export function clearUserData(): void {
  const uid = getUserId()
  if (!uid) return
  ;[KEYS.medals, KEYS.pbs, KEYS.bibs, KEYS.profile].forEach(k => removeStore(`${k}_${uid}`))
}

export function seedSampleData(): void {
  if (getMedals().length > 0) return
  setMedals([
    { id: 'm1', raceName: 'London Marathon 2024', eventDate: '2024-04-21', location: 'London, UK', distance: 'Marathon', time: '3:45:22', pace: '5:20', place: 1250, notes: 'Incredible atmosphere! Beat my target by 5 minutes.', isPB: true },
    { id: 'm2', raceName: 'Brighton 10K', eventDate: '2024-03-10', location: 'Brighton, UK', distance: '10K', time: '42:15', pace: '4:13', place: 89, notes: 'Flat and fast course.', isPB: true },
    { id: 'm3', raceName: 'Parkrun #50', eventDate: '2024-06-01', location: 'Bushy Park, London', distance: '5K', time: '19:48', pace: '3:57', place: 5, notes: 'Sub-20! Milestone achievement.', isPB: true },
    { id: 'm4', raceName: 'Berlin Marathon 2023', eventDate: '2023-09-24', location: 'Berlin, Germany', distance: 'Marathon', time: '3:52:10', pace: '5:30', place: 2100, notes: 'First marathon! Unforgettable experience.' },
    { id: 'm5', raceName: 'Royal Parks Half', eventDate: '2023-10-08', location: 'London, UK', distance: 'Half Marathon', time: '1:42:30', pace: '4:51', place: 340, notes: 'Scenic route through Hyde Park.' },
    { id: 'm6', raceName: 'Great North Run', eventDate: '2024-09-08', location: 'Newcastle, UK', distance: 'Half Marathon', time: '1:40:15', pace: '4:45', place: 210, notes: 'Best half marathon experience!', isPB: true },
  ])
  setPBs([
    { id: 'pb1', distance: '5K', time: '19:48', pace: '3:57', date: '2024-06-01', race: 'Parkrun #50' },
    { id: 'pb2', distance: '10K', time: '42:15', pace: '4:13', date: '2024-03-10', race: 'Brighton 10K' },
    { id: 'pb3', distance: 'Half Marathon', time: '1:40:15', pace: '4:45', date: '2024-09-08', race: 'Great North Run' },
    { id: 'pb4', distance: 'Marathon', time: '3:45:22', pace: '5:20', date: '2024-04-21', race: 'London Marathon 2024' },
    { id: 'pb5', distance: '1 Mile', time: '6:05', pace: '3:47', date: '2024-05-15', race: 'Mile Time Trial' },
  ])
  setBibs([
    { id: 'b1', number: 'A1250', raceName: 'London Marathon 2024', eventDate: '2024-04-21', distance: 'Marathon', notes: 'First marathon bib!' },
    { id: 'b2', number: '089', raceName: 'Brighton 10K', eventDate: '2024-03-10', distance: '10K', notes: 'Windy conditions but held on!' },
    { id: 'b3', number: '42195', raceName: 'Berlin Marathon 2023', eventDate: '2023-09-24', distance: 'Marathon', notes: 'Berlin - wave 2 start.' },
    { id: 'b4', number: 'GNR77', raceName: 'Great North Run', eventDate: '2024-09-08', distance: 'Half Marathon', notes: 'Iconic race.' },
  ])
}
