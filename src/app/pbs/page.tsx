'use client'

import { useEffect, useState } from 'react'
import { Plus, Trophy, Clock, Route, Sparkles, ArrowRight, Medal, Cpu } from 'lucide-react'
import { addPB, deletePB, seedSampleData, mergeComputedPBs } from '@/lib/store'
import { generateId, formatDate } from '@/lib/utils'
import type { PersonalBest } from '@/types'
import { Modal } from '@/components/Modal'
import { EmptyState } from '@/components/EmptyState'
import { toast } from '@/components/Toaster'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useProfile } from '@/components/ProfileProvider'
import Link from 'next/link'

const distances = ['1 Mile', '5K', '5 Mile', '10K', '10 Mile', 'Half Marathon', 'Marathon', '50K', 'Other']

export default function PBsPage() {
  const { profile } = useProfile()
  const [pbs, setPbs] = useState<PersonalBest[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ distance: '5K', time: '', pace: '', date: '', race: '' })

  useEffect(() => {
    seedSampleData()
    setPbs(mergeComputedPBs())
    setIsLoaded(true)
  }, [])

  function refresh() {
    setPbs(mergeComputedPBs())
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.time || !form.date || !form.race) { toast('Please fill in all required fields', 'error'); return }
    addPB({ id: generateId(), distance: form.distance, time: form.time, pace: form.pace || '', date: form.date, race: form.race })
    refresh(); setModalOpen(false)
    setForm({ distance: '5K', time: '', pace: '', date: '', race: '' })
    toast('PB saved!', 'success')
  }

  function handleDelete(id: string) {
    if (id.startsWith('pb_')) { toast('This PB is auto-computed from your medals. Remove the medal instead.', 'info'); return }
    deletePB(id); refresh(); toast('PB removed', 'info')
  }

  if (!isLoaded) {
    return <LoadingSpinner />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/5 p-8 sm:p-12"
        style={{ background: `linear-gradient(to bottom right, hsl(var(--accent) / 0.1), hsl(var(--accent) / 0.05), transparent)` }}>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full glob-accent blur-3xl" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[20%] top-[15%] h-2 w-2 rounded-full bg-accent-bright/40 animate-float" />
          <div className="absolute left-[80%] top-[25%] h-1.5 w-1.5 rounded-full bg-accent-dim/30 animate-float-slow" style={{ animationDelay: '-4s' }} />
          <div className="absolute left-[50%] top-[70%] h-1 w-1 rounded-full bg-accent-muted/40 animate-float" style={{ animationDelay: '-2s' }} />
        </div>
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border-accent bg-accent-light px-4 py-1.5 text-sm font-medium text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Fastest Times
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">{profile?.name ? `${profile.name}'s ` : ''}Personal Bests</h1>
          <p className="mt-3 max-w-lg text-muted-foreground/80">Your fastest time per distance, automatically computed from your medals.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent transition-all hover:shadow-xl hover:scale-105 active:scale-95"
              style={{ background: 'var(--gradient-btn)' }}>
              <Plus className="h-4 w-4" /> Add PB
            </button>
            <Link href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/70 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white">
              Medal Wall <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Records List */}
      {pbs.length === 0 ? (
        <EmptyState title="No personal bests yet" description="Add medals with times and your PBs will be computed automatically." actionLabel="Add PB" onAction={() => setModalOpen(true)} icon={<Trophy className="h-12 w-12" />} />
      ) : (
        <div className="space-y-3">
          {pbs.map((pb, idx) => {
            const isComputed = pb.id.startsWith('pb_')
            return (
              <div key={pb.id}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-[#1e1e2e] to-[#181825] p-5 sm:p-6 transition-all hover:border-white/10 hover:shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  {/* Rank */}
                  <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-light text-accent-bright font-bold text-lg">
                    {idx + 1}
                  </div>
                  {/* Distance */}
                  <div className="sm:w-44 shrink-0">
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-accent-bright shrink-0" />
                      <span className="font-bold text-lg text-white">{pb.distance}</span>
                    </div>
                    {isComputed && (
                      <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-accent-muted">
                        <Cpu className="h-3 w-3" /> from medals
                      </span>
                    )}
                  </div>
                  {/* Time */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <Clock className="h-4 w-4 text-accent-bright shrink-0 hidden sm:block" />
                      <span className="font-mono font-bold text-2xl sm:text-3xl text-white tracking-tight">{pb.time}</span>
                      {pb.pace && <span className="text-sm text-muted-foreground ml-2">({pb.pace} /km)</span>}
                    </div>
                  </div>
                  {/* Race + Date */}
                  <div className="sm:text-right">
                    <div className="flex items-center gap-2 sm:justify-end">
                      <Medal className="h-3.5 w-3.5 text-accent-muted shrink-0" />
                      <span className="text-sm text-white/70">{pb.race}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{formatDate(pb.date)}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Personal Best">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Distance</label>
            <select value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 ring-accent focus:border-accent-strong transition-all">
              {distances.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/80">Time</label>
              <input required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 ring-accent focus:border-accent-strong transition-all" placeholder="42:15" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/80">Pace</label>
              <input value={form.pace} onChange={(e) => setForm({ ...form, pace: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 ring-accent focus:border-accent-strong transition-all" placeholder="4:13 /km" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Date</label>
            <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 ring-accent focus:border-accent-strong transition-all [color-scheme:dark]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Race / Event</label>
            <input required value={form.race} onChange={(e) => setForm({ ...form, race: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 ring-accent focus:border-accent-strong transition-all" placeholder="Brighton 10K" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent transition-all hover:shadow-xl hover:scale-105 active:scale-95"
              style={{ background: 'var(--gradient-btn)' }}>Save PB</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
