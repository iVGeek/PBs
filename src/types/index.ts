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
