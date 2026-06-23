import type { Medal, PersonalBest, BibNumber } from '@/types'

const KEYS = {
  medals: 'mh_medals',
  pbs: 'mh_personal_bests',
  bibs: 'mh_bibs',
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

export function seedSampleData(): void {
  const medals = getMedals()
  if (medals.length > 0) return

  const sampleMedals: Medal[] = [
    { id: 'm1', raceName: 'London Marathon 2024', eventDate: '2024-04-21', location: 'London, UK', distance: 'Marathon', time: '3:45:22', pace: '5:20', place: 1250, notes: 'Incredible atmosphere! Beat my target by 5 minutes.', isPB: true },
    { id: 'm2', raceName: 'Brighton 10K', eventDate: '2024-03-10', location: 'Brighton, UK', distance: '10K', time: '42:15', pace: '4:13', place: 89, notes: 'Flat and fast course.', isPB: true },
    { id: 'm3', raceName: 'Parkrun #50', eventDate: '2024-06-01', location: 'Bushy Park, London', distance: '5K', time: '19:48', pace: '3:57', place: 5, notes: 'Sub-20! Milestone achievement.', isPB: true },
    { id: 'm4', raceName: 'Berlin Marathon 2023', eventDate: '2023-09-24', location: 'Berlin, Germany', distance: 'Marathon', time: '3:52:10', pace: '5:30', place: 2100, notes: 'First marathon! Unforgettable experience.' },
    { id: 'm5', raceName: 'Royal Parks Half', eventDate: '2023-10-08', location: 'London, UK', distance: 'Half Marathon', time: '1:42:30', pace: '4:51', place: 340, notes: 'Scenic route through Hyde Park.' },
    { id: 'm6', raceName: 'Great North Run', eventDate: '2024-09-08', location: 'Newcastle, UK', distance: 'Half Marathon', time: '1:40:15', pace: '4:45', place: 210, notes: 'Best half marathon experience!', isPB: true },
  ]
  setMedals(sampleMedals)

  const samplePBs: PersonalBest[] = [
    { id: 'pb1', distance: '5K', time: '19:48', pace: '3:57', date: '2024-06-01', race: 'Parkrun #50' },
    { id: 'pb2', distance: '10K', time: '42:15', pace: '4:13', date: '2024-03-10', race: 'Brighton 10K' },
    { id: 'pb3', distance: 'Half Marathon', time: '1:40:15', pace: '4:45', date: '2024-09-08', race: 'Great North Run' },
    { id: 'pb4', distance: 'Marathon', time: '3:45:22', pace: '5:20', date: '2024-04-21', race: 'London Marathon 2024' },
    { id: 'pb5', distance: '1 Mile', time: '6:05', pace: '3:47', date: '2024-05-15', race: 'Mile Time Trial' },
  ]
  setPBs(samplePBs)

  const sampleBibs: BibNumber[] = [
    { id: 'b1', number: 'A1250', raceName: 'London Marathon 2024', eventDate: '2024-04-21', distance: 'Marathon', notes: 'First marathon bib!' },
    { id: 'b2', number: '089', raceName: 'Brighton 10K', eventDate: '2024-03-10', distance: '10K', notes: 'Windy conditions but held on!' },
    { id: 'b3', number: '42195', raceName: 'Berlin Marathon 2023', eventDate: '2023-09-24', distance: 'Marathon', notes: 'Berlin - wave 2 start.' },
    { id: 'b4', number: 'GNR77', raceName: 'Great North Run', eventDate: '2024-09-08', distance: 'Half Marathon', notes: 'Iconic race.' },
  ]
  setBibs(sampleBibs)
}
