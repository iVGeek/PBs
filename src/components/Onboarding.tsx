'use client'

import { useState, useEffect } from 'react'
import { Medal, ChevronRight, ChevronLeft, Check, Sparkles, User, Type } from 'lucide-react'
import { themes, applyTheme } from '@/lib/themes'
import { fontOptions, applyFont } from '@/lib/fonts'
import { avatarOptions, getAvatarBg } from '@/lib/avatars'
import { setProfile } from '@/lib/store'
import type { Profile } from '@/types'

interface Props {
  onComplete: (profile: Profile) => void
}

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [avatarId, setAvatarId] = useState('avatar-0')
  const [themeId, setThemeId] = useState('midnight')
  const [fontId, setFontId] = useState('inter')

  useEffect(() => {
    applyTheme(themeId)
  }, [themeId])

  useEffect(() => {
    applyFont(fontId)
  }, [fontId])

  function handleFinish() {
    const profile: Profile = { name: name || 'Runner', avatarId, themeId, fontId }
    setProfile(profile)
    onComplete(profile)
  }

  const canNext = step === 0 ? name.trim().length > 0 : true

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      {/* Animated bg */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: themeId === 'midnight' ? 'hsl(38 92% 50%)' : `hsl(${themes.find(t => t.id === themeId)?.vars['--primary'] || '38 92% 50%'})` }} />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full opacity-10 blur-3xl" style={{ background: themeId === 'midnight' ? 'hsl(38 92% 50%)' : `hsl(${themes.find(t => t.id === themeId)?.vars['--primary'] || '38 92% 50%'})` }} />
      </div>

      <div className="relative mx-auto w-full max-w-lg px-4">
        {/* Steps indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[0, 1, 2, 3].map((s) => (
            <div key={s} className={`h-2 rounded-full transition-all duration-500 ${s === step ? 'w-10' : 'w-2'} ${s <= step ? 'bg-primary' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#1e1e2e] to-[#181825] p-8 shadow-2xl">
          {/* Logo */}
          <div className="mb-6 flex items-center justify-center gap-2 text-lg font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
              <Medal className="h-4 w-4 text-white" />
            </div>
            <span>Medal <span className="text-gradient">Holder</span></span>
          </div>

          {step === 0 && (
            <div className="animate-fade-up space-y-6">
              <div className="text-center">
                <Sparkles className="mx-auto h-8 w-8 text-primary mb-3" />
                <h2 className="text-2xl font-bold text-white">Welcome!</h2>
                <p className="mt-2 text-muted-foreground">Let&apos;s set up your personal medal wall. What should we call you?</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Your Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-up space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Pick Your Avatar</h2>
                <p className="mt-2 text-muted-foreground">Choose a runner that represents you.</p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {avatarOptions.map((av) => {
                  const selected = avatarId === av.id
                  return (
                    <button key={av.id} onClick={() => setAvatarId(av.id)}
                      className={`group relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                        selected
                          ? 'border-primary/50 bg-primary/10 shadow-lg shadow-primary/10'
                          : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}>
                      <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarBg(av.id)} transition-all ${selected ? 'scale-110 shadow-lg' : ''}`}>
                        {av.svg(36)}
                      </div>
                      <span className={`text-xs font-medium ${selected ? 'text-primary' : 'text-white/50'}`}>{av.label}</span>
                      {selected && <Check className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-primary p-1 text-white" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-up space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Choose Your Theme</h2>
                <p className="mt-2 text-muted-foreground">Pick a color scheme for your medal wall.</p>
              </div>
              <div className="grid gap-3 max-h-[380px] overflow-y-auto pr-1">
                {themes.map((t) => {
                  const selected = themeId === t.id
                  const hue = t.vars['--primary'].split(' ')[0]
                  return (
                    <button key={t.id} onClick={() => setThemeId(t.id)}
                      className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                        selected
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-white/5 bg-white/5 hover:border-white/20'
                      }`}>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl`}
                        style={{ background: `hsl(${t.vars['--primary']} / 0.2)` }}>
                        {t.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.desc}</div>
                      </div>
                      <div className="flex gap-1">
                        {['primary', 'card', 'muted'].map((part) => (
                          <div key={part} className="h-6 w-6 rounded-full border border-white/10"
                            style={{ background: `hsl(${t.vars[part === 'primary' ? '--primary' : part === 'card' ? '--card' : '--muted']})` }} />
                        ))}
                      </div>
                      {selected && <Check className="h-5 w-5 text-primary shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-up space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Pick Your Font</h2>
                <p className="mt-2 text-muted-foreground">Choose a typeface that feels right.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {fontOptions.map((f) => {
                  const selected = fontId === f.id
                  return (
                    <button key={f.id} onClick={() => setFontId(f.id)}
                      className={`flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all ${
                        selected
                          ? 'border-primary/50 bg-primary/10 shadow-lg shadow-primary/10'
                          : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}>
                      <span className={`text-xl font-bold text-white`} style={{ fontFamily: f.family }}>{f.name}</span>
                      <span className="text-xs text-muted-foreground">The quick brown fox jumps over the lazy dog</span>
                      {selected && <Check className="h-5 w-5 text-primary" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button onClick={() => setStep(Math.max(0, step - 1))}
              className={`flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                step === 0 ? 'invisible' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}>
              <ChevronLeft className="h-4 w-4" /> Back
            </button>

            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} disabled={!canNext}
                className="flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={handleFinish}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95">
                <Sparkles className="h-4 w-4" />
                Let&apos;s Go!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
