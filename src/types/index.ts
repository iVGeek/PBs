export interface Medal {
  id: string
  raceName: string
  eventDate: string
  location: string
  distance: string
  time?: string
  pace?: string
  place?: number
  category?: string
  imageUrl?: string
  notes?: string
  medalColor?: 'gold' | 'silver' | 'bronze' | 'other'
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
  imageUrl?: string
  notes?: string
}
