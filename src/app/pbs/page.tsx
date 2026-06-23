'use client'

import { useEffect, useState } from 'react'
import { Plus, Trophy, Clock, Route, Trash2, Sparkles, ArrowRight, Target } from 'lucide-react'
import { getPBs, addPB, deletePB, seedSampleData } from '@/lib/store'
import { generateId, formatDate } from '@/lib/utils'
import type { PersonalBest } from '@/types'
import { Modal } from '@/components/Modal'
import { EmptyState } from '@/components/EmptyState'
import { toast } from '@/components/Toaster'
import Link from 'next/link'

const distances = ['1 Mile', '5K', '5 Mile', '10K', '10 Mile', 'Half Marathon', 'Marathon', '50K', 'Other']

export default function PBsPage() {
  const [pbs, setPbs] = useState<PersonalBest[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [filterDist, setFilterDist] = useState<string>('all')
  const [form, setForm] = useState({ distance: '5K', time: '', pace: '', date: '', race: '' })

  useEffect(() => {
    seedSampleData()
    setPbs(getPBs())
    setIsLoaded(true)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.time || !form.date || !form.race) { toast('Please fill in all required fields', 'error'); return }
    addPB({ id: generateId(), distance: form.distance, time: form.time, pace: form.pace || '', date: form.date, race: form.race })
    setPbs(getPBs()); setModalOpen(false)
    setForm({ distance: '5K', time: '', pace: '', date: '', race: '' })
    toast('PB saved!', 'success')
  }

  function handleDelete(id: string) { deletePB(id); setPbs(getPBs()); toast('PB removed', 'info') }

  const filtered = filterDist === 'all' ? pbs : pbs.filter((p) => p.distance === filterDist)
  const uniqueDistances = Array.from(new Set(pbs.map((p) => p.distance)))

  if (!isLoaded) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-running-500 border-t-transparent" /></div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-running-500/10 via-running-600/5 to-transparent p-8 sm:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-running-500/20 blur-3xl" />
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-running-500/20 bg-running-500/10 px-4 py-1.5 text-sm font-medium text-running-300">
            <Sparkles className="h-3.5 w-3.5" />
            Fastest Times
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">Personal Bests</h1>
          <p className="mt-3 max-w-lg text-muted-foreground/80">Your fastest times across every distance. Every PB tells a story of hard work.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-running-500 to-running-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-running-600/30 transition-all hover:shadow-xl hover:shadow-running-600/40 hover:scale-105 active:scale-95">
              <Plus className="h-4 w-4" /> Add PB
            </button>
            <Link href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/70 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white">
              Medal Wall <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Filter */}
      {uniqueDistances.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button onClick={() => setFilterDist('all')}
            className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${filterDist === 'all' ? 'bg-running-500/20 text-running-300 border border-running-500/30' : 'bg-white/5 text-white/50 border border-white/5 hover:text-white/80 hover:bg-white/10'}`}>All</button>
          {uniqueDistances.map((d) => (
            <button key={d} onClick={() => setFilterDist(d)}
              className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${filterDist === d ? 'bg-running-500/20 text-running-300 border border-running-500/30' : 'bg-white/5 text-white/50 border border-white/5 hover:text-white/80 hover:bg-white/10'}`}>{d}</button>
          ))}
        </div>
      )}

      {/* Desktop Table */}
      {pbs.length === 0 ? (
        <EmptyState title="No personal bests yet" description="Add your first PB to track your fastest times." actionLabel="Add PB" onAction={() => setModalOpen(true)} icon={<Trophy className="h-12 w-12" />} />
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No PBs for this distance yet.</p>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden sm:block overflow-hidden rounded-2xl border border-white/5 bg-[#1e1e2e]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Distance</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pace</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Race</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-5 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((pb) => (
                  <tr key={pb.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4"><div className="flex items-center gap-2.5"><Route className="h-4 w-4 text-running-400" /><span className="font-semibold text-white/80">{pb.distance}</span></div></td>
                    <td className="px-5 py-4"><div className="flex items-center gap-2.5"><Clock className="h-4 w-4 text-amber-400" /><span className="font-mono font-bold text-xl text-white">{pb.time}</span></div></td>
                    <td className="px-5 py-4"><span className="text-sm text-muted-foreground">{pb.pace}</span></td>
                    <td className="px-5 py-4 text-sm text-white/70">{pb.race}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{formatDate(pb.date)}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleDelete(pb.id)}
                        className="rounded-xl p-2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {filtered.map((pb) => (
              <div key={pb.id} className="group relative rounded-2xl border border-white/5 bg-gradient-to-b from-[#1e1e2e] to-[#181825] p-5">
                <button onClick={() => handleDelete(pb.id)}
                  className="absolute right-3 top-3 rounded-xl p-1.5 text-muted-foreground hover:bg-red-500/20 hover:text-red-400 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <Route className="h-4 w-4 text-running-400" />
                    <span className="font-semibold text-white/80">{pb.distance}</span>
                  </div>
                  <span className="font-mono font-bold text-lg text-white">{pb.time}</span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{pb.pace}</span>
                  <span className="text-white/10">|</span>
                  <span>{pb.race}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{formatDate(pb.date)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Personal Best">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Distance</label>
            <select value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-running-500/50 focus:border-running-500/50 transition-all">
              {distances.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/80">Time</label>
              <input required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-running-500/50 focus:border-running-500/50 transition-all" placeholder="42:15" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/80">Pace</label>
              <input value={form.pace} onChange={(e) => setForm({ ...form, pace: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-running-500/50 focus:border-running-500/50 transition-all" placeholder="4:13 /km" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Date</label>
            <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-running-500/50 focus:border-running-500/50 transition-all [color-scheme:dark]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Race / Event</label>
            <input required value={form.race} onChange={(e) => setForm({ ...form, race: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-running-500/50 focus:border-running-500/50 transition-all" placeholder="Brighton 10K" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit"
              className="rounded-xl bg-gradient-to-r from-running-500 to-running-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-running-600/20 transition-all hover:shadow-xl hover:shadow-running-600/30 hover:scale-105 active:scale-95">Save PB</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
