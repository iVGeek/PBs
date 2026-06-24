'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Medal, Trophy, Hash, Menu, X, Settings, Check, ChevronDown, LogOut, Sparkles, RefreshCw, Unlink, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'
import { useProfile } from './ProfileProvider'
import { useAuth } from './AuthProvider'
import { avatarOptions, getAvatarBg } from '@/lib/avatars'
import { themes, applyTheme } from '@/lib/themes'
import { fontOptions, applyFont } from '@/lib/fonts'
import { setProfile as saveProfile, importFromStravaData } from '@/lib/store'
import { isStravaConnected, getStravaTokens, clearStravaTokens, getStravaAuthUrl, importFromStrava } from '@/lib/strava'
import { toast } from './Toaster'
import type { Profile } from '@/types'

function hslCss(v: string): string {
  const parts = v.split(' ')
  return parts.length === 3 ? `hsl(${parts[0]} ${parts[1]} ${parts[2]})` : `hsl(${v})`
}

const navItems = [
  { href: '/', label: 'Medal Wall', icon: Medal },
  { href: '/pbs', label: 'Personal Bests', icon: Trophy },
  { href: '/bibs', label: 'Bib Numbers', icon: Hash },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [importing, setImporting] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const themePickerRef = useRef<HTMLDivElement>(null)
  const { profile, setProfile } = useProfile()
  const { userEmail, logout } = useAuth()

  const [editName, setEditName] = useState('')
  const [editAvatarId, setEditAvatarId] = useState('')
  const [editThemeId, setEditThemeId] = useState('')
  const [editFontId, setEditFontId] = useState('')

  const stravaConnected = isStravaConnected()
  const stravaTokens = getStravaTokens()

  useEffect(() => {
    if (showSettings) {
      setEditName(profile?.name || '')
      setEditAvatarId(profile?.avatarId || 'avatar-0')
      setEditThemeId(profile?.themeId || 'midnight')
      setEditFontId(profile?.fontId || 'inter')
    }
  }, [showSettings, profile])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false)
      }
      if (themePickerRef.current && !themePickerRef.current.contains(e.target as Node)) {
        setShowThemePicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleQuickTheme(themeId: string) {
    applyTheme(themeId)
    if (profile) {
      const updated: Profile = { ...profile, themeId }
      saveProfile(updated)
      setProfile(updated)
    }
    setShowThemePicker(false)
  }

  function handleSaveSettings() {
    const updated: Profile = {
      name: editName || 'Runner',
      avatarId: editAvatarId,
      themeId: editThemeId,
      fontId: editFontId,
    }
    saveProfile(updated)
    applyTheme(editThemeId)
    applyFont(editFontId)
    setProfile(updated)
    setShowSettings(false)
    toast('Profile updated', 'success')
  }

  async function handleStravaSync() {
    setImporting(true)
    try {
      const result = await importFromStrava()
      if ('error' in result) {
        toast(result.error, 'error')
        return
      }
      const counts = importFromStravaData({
        medals: result.medals,
        pbs: result.pbs,
        bibs: result.bibs,
      })
      toast(`Imported ${counts.medals} medals, ${counts.pbs} PBs, ${counts.bibs} bibs`, 'success')
    } catch {
      toast('Sync failed', 'error')
    } finally {
      setImporting(false)
    }
  }

  function handleDisconnect() {
    clearStravaTokens()
    setShowSettings(false)
    toast('Disconnected from Strava', 'info')
  }

  const currentAvatar = avatarOptions.find(a => a.id === (profile?.avatarId || 'avatar-0'))

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0d0d1a]/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl shadow-lg shadow-accent transition-all group-hover:shadow-accent group-hover:scale-110"
              style={{ background: 'var(--gradient-btn)' }}>
              <Medal className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">
              Medal <span className="text-gradient">Holder</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-2xl p-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href}
                  className={cn(
                      'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all',
                    active
                      ? 'bg-accent text-accent shadow-sm'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  )}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick theme toggle */}
            <div className="relative" ref={themePickerRef}>
              <button onClick={() => { setShowThemePicker(!showThemePicker); setShowSettings(false) }}
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white"
                title="Switch theme">
                <Palette className="h-4 w-4" />
              </button>

              {showThemePicker && (
                <div className="absolute right-0 top-full mt-2 w-64 animate-fade-up rounded-2xl border border-white/10 bg-gradient-to-b from-[#1e1e2e] to-[#181825] shadow-2xl shadow-black/50 p-3">
                  <div className="mb-2 px-1 text-xs font-medium text-muted-foreground">Quick Theme</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {themes.map((t) => {
                      const isActive = (profile?.themeId || 'midnight') === t.id
                      return (
                        <button key={t.id} onClick={() => handleQuickTheme(t.id)}
                          className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-all ${
                            isActive ? 'border-primary/50 bg-primary/10' : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                          }`}>
                          <span className="text-lg">{t.emoji}</span>
                          <span className="text-[10px] font-medium text-white/60">{t.name}</span>
                          {isActive && <Check className="h-2.5 w-2.5 text-primary" />}
                        </button>
                      )
                    })}
                  </div>
                  <Link href="/theme" onClick={() => setShowThemePicker(false)}
                    className="mt-2 flex items-center justify-center gap-1 rounded-lg border border-white/5 px-2 py-1.5 text-[11px] text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
                    <Palette className="h-3 w-3" />
                    Full theme gallery
                  </Link>
                </div>
              )}
            </div>

            {/* Profile button */}
            <div className="relative" ref={settingsRef}>
              <button onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 transition-all hover:bg-white/10">
                {currentAvatar && (
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${getAvatarBg(currentAvatar.id)}`}>
                    {currentAvatar.svg(18)}
                  </div>
                )}
                <span className="text-sm font-medium text-white/80 max-w-[100px] truncate">{profile?.name || 'Runner'}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-white/40 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
              </button>

              {showSettings && (
                <div className="absolute right-0 top-full mt-2 w-80 animate-fade-up rounded-2xl border border-white/10 bg-gradient-to-b from-[#1e1e2e] to-[#181825] shadow-2xl shadow-black/50 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarBg(editAvatarId)}`}>
                      {avatarOptions.find(a => a.id === editAvatarId)?.svg(28)}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{editName || 'Runner'}</div>
                      <div className="text-xs text-muted-foreground">Customize your profile</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-1.5">Name</label>
                      <input value={editName} onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="Your name" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-1.5">Avatar</label>
                      <div className="grid grid-cols-8 gap-1.5">
                        {avatarOptions.map((av) => (
                          <button key={av.id} onClick={() => setEditAvatarId(av.id)}
                            className={`flex items-center justify-center rounded-lg p-1.5 transition-all ${
                              editAvatarId === av.id ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-white/5'
                            }`}>
                            <div className={`flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ${getAvatarBg(av.id)}`}>
                              {av.svg(16)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-1.5">Theme</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {themes.map((t) => (
                          <button key={t.id} onClick={() => { setEditThemeId(t.id); applyTheme(t.id) }}
                            className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-all ${
                              editThemeId === t.id ? 'border-primary/50 bg-primary/10' : 'border-white/5 hover:border-white/20'
                            }`}>
                            <span className="text-base">{t.emoji}</span>
                            <span className="text-[10px] font-medium text-white/60">{t.name}</span>
                            {editThemeId === t.id && <Check className="h-3 w-3 text-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-1.5">Font</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {fontOptions.map((f) => (
                          <button key={f.id} onClick={() => { setEditFontId(f.id); applyFont(f.id) }}
                            className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                              editFontId === f.id ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/5 text-white/50 hover:border-white/20 hover:text-white/80'
                            }`}>
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Strava section */}
                    <div className="border-t border-white/5 pt-4">
                      <label className="block text-xs font-medium text-white/60 mb-2">Strava</label>
                      {stravaConnected ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 rounded-lg bg-accent-light px-3 py-2 text-xs">
                            <span className="h-2 w-2 rounded-full bg-accent-full animate-pulse" />
                            <span className="text-accent-bright">Connected{stravaTokens?.athlete?.id ? ` as ${stravaTokens.athlete.firstname} ${stravaTokens.athlete.lastname}` : ''}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={handleStravaSync} disabled={importing}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/20 disabled:opacity-50">
                              <RefreshCw className={`h-3.5 w-3.5 ${importing ? 'animate-spin' : ''}`} />
                              {importing ? 'Syncing...' : 'Sync Now'}
                            </button>
                            <button onClick={handleDisconnect}
                              className="flex items-center justify-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20">
                              <Unlink className="h-3.5 w-3.5" />
                              Disconnect
                            </button>
                          </div>
                        </div>
                      ) : (
                        <a href={getStravaAuthUrl()}
                          className="flex items-center justify-center gap-2 rounded-lg text-xs font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                          style={{ background: 'var(--gradient-btn)' }}>
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.56l-2.836 5.56H0L7.716 24l7.716-12.056H12.37m9.723 5.56l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066"/></svg>
                          Connect Strava
                        </a>
                      )}
                    </div>
                  </div>

                  <button onClick={handleSaveSettings}
                    className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl active:scale-[0.97]">
                    Save Changes
                  </button>
                  <div className="mt-3 border-t border-white/5 pt-3">
                    <button onClick={() => { setShowSettings(false); logout() }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20">
                      <LogOut className="h-4 w-4" />
                      Sign Out (via Strava)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setOpen(!open)}
              className="md:hidden rounded-xl p-2 text-white/50 hover:text-white hover:bg-white/5 transition-all">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-white/5 bg-[#0d0d1a]/95 backdrop-blur-2xl md:hidden">
            <div className="space-y-1 px-4 py-3">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      active ? 'bg-accent text-accent' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    )}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
