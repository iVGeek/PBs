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
  activityId?: number
  stravaActivityId?: number
  isStravaImported: boolean
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

export interface StravaActivity {
  id: number
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  type: string
  sport_type: string
  start_date: string
  start_date_local: string
  timezone: string
  average_speed: number
  max_speed: number
  average_heartrate?: number
  max_heartrate?: number
  elev_high?: number
  elev_low?: number
  pr_rank?: number
  achievements?: number
  kudos_count: number
  comment_count: number
  athlete_count: number
  photo_count: number
  map?: {
    id: string
    summary_polyline: string
  }
  splits_metric?: Split[]
}

export interface Split {
  distance: number
  elapsed_time: number
  elevation_difference: number
  moving_time: number
  split: number
  average_speed: number
  average_heartrate?: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedDate?: string
}

export interface Shoe {
  id: string
  name: string
  brand: string
  model: string
  mileage: number
  maxMileage: number
  purchaseDate: string
  isActive: boolean
}

export interface RaceCalendar {
  id: string
  name: string
  date: string
  distance: string
  location: string
  goal?: string
  notes?: string
  isConfirmed: boolean
}

export interface YearStats {
  year: number
  totalRuns: number
  totalDistance: number
  totalTime: number
  avgPace: string
  avgHeartrate?: number
  elevationGain: number
  medals: number
  pbsSet: number
}
