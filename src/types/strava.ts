export interface StravaTokens {
  access_token: string
  refresh_token: string
  expires_at: number
  athlete: { id: number; firstname: string; lastname: string }
}

export interface StravaActivity {
  id: number
  name: string
  type: string
  sport_type: string
  start_date: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  average_speed: number
  max_speed: number
  average_heartrate?: number
  max_heartrate?: number
  start_latlng?: [number, number]
  location_city?: string
  location_country?: string
  description?: string
  achievement_count: number
  pr_count: number
  total_photo_count: number
  photos?: { primary?: { urls?: Record<string, string> } }
  has_heartrate: boolean
  map?: { summary_polyline?: string }
}

export interface StravaStats {
  recent_run_totals: { count: number; distance: number; moving_time: number }
  all_run_totals: { count: number; distance: number; moving_time: number }
}
