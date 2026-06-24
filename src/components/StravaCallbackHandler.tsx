'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from './Toaster'

export function StravaCallbackHandler() {
  const searchParams = useSearchParams()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true
    if (searchParams.get('strava') === 'error') {
      toast('Failed to connect Strava. Please try again.', 'error')
    }
  }, [searchParams])

  return null
}
