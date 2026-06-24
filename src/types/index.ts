export interface Profile {
  name: string
  avatarId: string
  themeId: string
  fontId?: string
}

export interface Medal {
  id: string
  raceName: string
  eventDate: string
  location?: string
  distance: string
  time?: string
  pace?: string
  place?: number
  notes?: string
  imageUrl?: string
  isPB?: boolean
}

export interface PersonalBest {
  id: string
  distance: string
  time: string
  pace: string
  date: string
  race: string
}

export interface BibNumber {
  id: string
  number: string
  raceName: string
  eventDate: string
  distance: string
  notes?: string
  imageUrl?: string
}

export interface StoredUser {
  id: string
  name: string
  email: string
  paid: boolean
  stravaAthleteId: number
  createdAt: string
}

export interface CurrentSession {
  userId: string
  method: 'strava'
  name: string
  email: string
  paid: boolean
}

export const PAYMENT_PRICES: Record<string, { amount: number; label: string }> = {
  KES: { amount: 5000, label: 'KES 5,000' },
  USD: { amount: 40, label: '$40' },
  GBP: { amount: 30, label: '£30' },
  EUR: { amount: 35, label: '€35' },
  NGN: { amount: 50000, label: '₦50,000' },
  GHS: { amount: 480, label: 'GHS 480' },
  ZAR: { amount: 700, label: 'R 700' },
}
