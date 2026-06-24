'use client'

import { useEffect, useState } from 'react'
import { themes, applyTheme } from '@/lib/themes'
import { useProfile } from '@/components/ProfileProvider'
import { setProfile as saveProfile } from '@/lib/store'
import { Medal, Trophy, Check, Sparkles, Palette } from 'lucide-react'
import Link from 'next/link'
import type { Profile } from '@/types'

function hslCss(v: string): string {
  const parts = v.split(' ')
  if (parts.length === 3) return `hsl(${parts[0]} ${parts[1]} ${parts[2]})`
  return `hsl(${v})`
}

export default function ThemePage() {
  const { profile, setProfile } = useProfile()
  const [activeId, setActiveId] = useState(profile?.themeId || 'midnight')
  const [previewId, setPreviewId] = useState(profile?.themeId || 'midnight')

  useEffect(() => {
    if (profile?.themeId) setActiveId(profile.themeId)
  }, [profile])

  function handleApply(themeId: string) {
    setPreviewId(themeId)
    applyTheme(themeId)
    if (profile) {
      const updated: Profile = { ...profile, themeId }
      saveProfile(updated)
      setProfile(updated)
    }
    setActiveId(themeId)
  }

  function handlePreview(themeId: string) {
    setPreviewId(themeId)
    applyTheme(themeId)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <div className="relative mb-12 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-8 sm:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl" style={{ background: `hsl(${themes.find(t => t.id === activeId)?.vars['--primary'] || '38 92% 50%'})` }} />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[30%] top-[10%] h-2 w-2 rounded-full animate-float" style={{ background: `hsl(${themes.find(t => t.id === activeId)?.vars['--primary'] || '38 92% 50%'} / 0.4)` }} />
          <div className="absolute left-[70%] top-[40%] h-1.5 w-1.5 rounded-full animate-float-slow" style={{ animationDelay: '-4s', background: `hsl(${themes.find(t => t.id === activeId)?.vars['--primary'] || '38 92% 50%'} / 0.3)` }} />
          <div className="absolute left-[15%] top-[65%] h-1 w-1 rounded-full animate-float" style={{ animationDelay: '-2s', background: `hsl(${themes.find(t => t.id === activeId)?.vars['--primary'] || '38 92% 50%'} / 0.4)` }} />
        </div>
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/70">
            <Palette className="h-3.5 w-3.5" />
            Theme Gallery
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Choose Your <span className="text-gradient-hero">Style</span>
          </h1>
          <p className="mt-3 max-w-lg text-muted-foreground/80">
            Pick a color scheme that matches your vibe. The whole site adapts instantly.
          </p>
        </div>
      </div>

      {/* Current theme indicator */}
      <div className="mb-8 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{themes.find(t => t.id === activeId)?.emoji}</span>
          <span className="font-semibold text-white">{themes.find(t => t.id === activeId)?.name}</span>
        </div>
        <span className="text-xs text-muted-foreground">— currently active</span>
        <div className="ml-auto flex gap-1">
          {[activeId ? themes.find(t => t.id === activeId)?.vars['--primary'] || '' : '',
             activeId ? themes.find(t => t.id === activeId)?.vars['--card'] || '' : '',
             activeId ? themes.find(t => t.id === activeId)?.vars['--muted'] || '' : ''].map((h, i) => (
            <div key={i} className="h-5 w-5 rounded-full border border-white/10" style={{ background: hslCss(h) }} />
          ))}
        </div>
      </div>

      {/* Theme grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => {
          const isActive = activeId === theme.id
          const primary = hslCss(theme.vars['--primary'])
          const bg = hslCss(theme.vars['--background'])
          const card = hslCss(theme.vars['--card'])
          const muted = hslCss(theme.vars['--muted'])
          const mutedFg = hslCss(theme.vars['--muted-foreground'])
          const border = hslCss(theme.vars['--border'])

          return (
            <div key={theme.id}
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                isActive ? 'border-primary/40 shadow-xl shadow-primary/10' : 'border-white/5 hover:border-white/20'
              }`}
              style={{ background: `linear-gradient(180deg, ${card} 0%, ${bg} 100%)` }}
            >
              {/* Active badge */}
              {isActive && (
                <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg" style={{ background: primary }}>
                  <Check className="h-3 w-3" /> Active
                </div>
              )}

              {/* Preview area */}
              <div className="p-5 pb-3">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: `${primary}20` }}>
                    {theme.emoji}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{theme.name}</div>
                    <div className="text-xs" style={{ color: mutedFg }}>{theme.desc}</div>
                  </div>
                </div>

                {/* Live mini-preview */}
                <div className="rounded-xl border p-3 space-y-2" style={{ borderColor: border, background: `${muted}40` }}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: primary }}>
                      <Medal className="h-3 w-3 text-white" />
                    </div>
                    <div className="h-2 w-24 rounded-full" style={{ background: muted }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded" style={{ background: `${primary}30` }}>
                      <Trophy className="h-2.5 w-2.5" style={{ color: primary }} />
                    </div>
                    <div className="h-2 w-16 rounded-full" style={{ background: muted }} />
                    <span className="text-[10px] font-mono" style={{ color: primary }}>42:15</span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <div className="rounded-md px-2 py-1 text-[10px] font-semibold text-white" style={{ background: primary }}>View PBs</div>
                    <div className="rounded-md px-2 py-1 text-[10px]" style={{ background: muted, color: mutedFg }}>Add Medal</div>
                  </div>
                </div>
              </div>

              {/* Theme swatches + apply */}
              <div className="border-t px-5 py-3 flex items-center justify-between" style={{ borderColor: border }}>
                <div className="flex gap-1">
                  {[theme.vars['--primary'], theme.vars['--card'], theme.vars['--muted'], theme.vars['--background']].map((h, i) => (
                    <div key={i} className="h-4 w-4 rounded-full border" style={{ background: hslCss(h), borderColor: border }} />
                  ))}
                </div>
                <button
                  onClick={() => handleApply(theme.id)}
                  onMouseEnter={() => handlePreview(theme.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${
                    isActive ? 'opacity-60 cursor-default' : 'hover:shadow-xl'
                  }`}
                  style={{ background: primary }}
                >
                  {isActive ? 'Applied' : 'Apply'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-10 text-center">
        <Link href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
          <Medal className="h-4 w-4" />
          Back to Medal Wall
        </Link>
      </div>
    </div>
  )
}
