'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getCurrentUser, setCurrentUser as saveCurrentUser, getUserById, createOrLoginStravaUser } from '@/lib/store'
import { setStravaTokens } from '@/lib/strava'
import { LoadingSpinner } from './LoadingSpinner'

interface AuthContextValue {
  userId: string | null
  userEmail: string | null
  isLoggedIn: boolean
  isPaid: boolean
  userName: string | null
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextValue>({
  userId: null, userEmail: null, isLoggedIn: false, isPaid: false, userName: null,
  logout: () => {}, refreshUser: () => {},
})

export function useAuth() { return useContext(AuthContext) }

function processStravaHash(): boolean {
  if (typeof window === 'undefined') return false
  const hash = window.location.hash.slice(1)
  if (!hash) return false
  const params = new URLSearchParams(hash)
  const athleteId = params.get('athlete_id')
  const accessToken = params.get('access_token')
  if (!athleteId || !accessToken) return false

  const name = params.get('athlete_name') || 'Runner'
  const email = params.get('athlete_email') || `${athleteId}@strava.runner`

  // Save tokens
  const refreshToken = params.get('refresh_token') || ''
  const expiresAt = parseInt(params.get('expires_at') || '0')
  setStravaTokens({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresAt,
    athlete: { id: parseInt(athleteId), firstname: name, lastname: '' },
  })

  // Create or login user
  const user = createOrLoginStravaUser(parseInt(athleteId), name, email)
  saveCurrentUser({ userId: user.id, method: 'strava', name: user.name, email: user.email, paid: user.paid })
  return true
}

const publicPaths = ['/login', '/payment/callback']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isPaid, setIsPaid] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const refreshUser = useCallback(() => {
    const session = getCurrentUser()
    if (session) {
      const user = getUserById(session.userId)
      if (user) {
        setUserId(user.id)
        setUserEmail(user.email)
        setIsPaid(user.paid)
        setUserName(user.name)
      } else {
        setUserId(null); setUserEmail(null); setIsPaid(false); setUserName(null)
        saveCurrentUser(null)
      }
    } else {
      setUserId(null); setUserEmail(null); setIsPaid(false); setUserName(null)
    }
  }, [])

  // On mount, check for Strava callback hash before the auth gate
  useEffect(() => {
    const wasStrava = processStravaHash()
    if (wasStrava) {
      window.history.replaceState(null, '', window.location.pathname)
    }
    refreshUser()
    setReady(true)
  }, [refreshUser])

  const logout = useCallback(() => {
    saveCurrentUser(null)
    setUserId(null); setUserEmail(null); setIsPaid(false); setUserName(null)
    router.push('/login')
  }, [router])

  const isPublic = publicPaths.some(p => pathname.startsWith(p))

  if (!ready) {
    return <LoadingSpinner fullScreen />
  }

  if (!isPublic && !userId) {
    router.replace('/login')
    return <LoadingSpinner fullScreen />
  }

  if (!isPublic && userId && !isPaid && !pathname.startsWith('/payment')) {
    router.replace('/payment')
    return <LoadingSpinner fullScreen />
  }

  return (
    <AuthContext.Provider value={{ userId, userEmail, isLoggedIn: !!userId, isPaid, userName, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
