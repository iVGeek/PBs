'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { getProfile, setProfile as saveProfile } from '@/lib/store'
import { applyTheme } from '@/lib/themes'
import { applyFont } from '@/lib/fonts'
import { Onboarding } from './Onboarding'
import { LoadingSpinner } from './LoadingSpinner'
import type { Profile } from '@/types'

interface ProfileContextValue {
  profile: Profile | null
  setProfile: (p: Profile) => void
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  setProfile: () => {},
})

export function useProfile() {
  return useContext(ProfileContext)
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null)
  const [ready, setReady] = useState(false)
  const pathname = usePathname()

  const isAuthPage = ['/login', '/payment', '/payment/callback'].some(p => pathname.startsWith(p))

  useEffect(() => {
    const p = getProfile()
    if (p) {
      setProfileState(p)
      applyTheme(p.themeId)
      if (p.fontId) applyFont(p.fontId)
    }
    setReady(true)
  }, [])

  const setProfile = useCallback((p: Profile) => {
    saveProfile(p)
    setProfileState(p)
    applyTheme(p.themeId)
  }, [])

  if (!ready) {
    return (
      <LoadingSpinner fullScreen />
    )
  }

  if (!profile && !isAuthPage) {
    return <Onboarding onComplete={setProfile} />
  }

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}
