export function formatPace(secondsPerKm: number): string {
  const min = Math.floor(secondsPerKm / 60)
  const sec = Math.floor(secondsPerKm % 60)
  return `${min}:${sec.toString().padStart(2, '0')} /km`
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`
  }
  return `${Math.round(meters)} m`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function getDistanceLabel(meters: number): string {
  const km = meters / 1000
  if (Math.abs(km - 5) < 0.1) return '5K'
  if (Math.abs(km - 10) < 0.1) return '10K'
  if (Math.abs(km - 21.0975) < 0.5) return 'Half Marathon'
  if (Math.abs(km - 42.195) < 0.5) return 'Marathon'
  if (km < 5) return `${km.toFixed(1)}K`
  return `${Math.round(km)}K`
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
