'use client'

import { useEffect, useState } from 'react'
import { Plus, Trophy, Clock, Route, Trash2 } from 'lucide-react'
import { getPBs, addPB, deletePB, seedSampleData } from '@/lib/store'
import { generateId, formatDate } from '@/lib/utils'
import type { PersonalBest } from '@/types'
import { Modal } from '@/components/Modal'
import { EmptyState } from '@/components/EmptyState'
import { toast } from '@/components/Toaster'

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
    if (!form.time || !form.date || !form.race) {
      toast('Please fill in all required fields', 'error')
      return
    }
    addPB({ id: generateId(), distance: form.distance, time: form.time, pace: form.pace || '', date: form.date, race: form.race })
    setPbs(getPBs())
    setModalOpen(false)
    setForm({ distance: '5K', time: '', pace: '', date: '', race: '' })
    toast('Personal best saved!', 'success')
  }

  function handleDelete(id: string) {
    deletePB(id)
    setPbs(getPBs())
    toast('PB removed', 'info')
  }

  const filtered = filterDist === 'all' ? pbs : pbs.filter((p) => p.distance === filterDist)
  const uniqueDistances = Array.from(new Set(pbs.map((p) => p.distance)))

  if (!isLoaded) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-running-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personal Bests</h1>
          <p className="mt-1 text-muted-foreground">Your fastest times across every distance</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-running-600 px-4 py-2 text-sm font-medium text-white hover:bg-running-700 transition-colors">
          <Plus className="h-4 w-4" /> Add PB
        </button>
      </div>

      {uniqueDistances.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button onClick={() => setFilterDist('all')}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filterDist === 'all' ? 'bg-running-600 text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>All</button>
          {uniqueDistances.map((d) => (
            <button key={d} onClick={() => setFilterDist(d)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filterDist === d ? 'bg-running-600 text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>{d}</button>
          ))}
        </div>
      )}

      {pbs.length === 0 ? (
        <EmptyState title="No personal bests yet" description="Add your first PB to track your fastest times." actionLabel="Add PB" onAction={() => setModalOpen(true)} icon={<Trophy className="h-12 w-12" />} />
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No PBs for this distance yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Distance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Pace</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Race</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((pb) => (
                <tr key={pb.id} className="group hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Route className="h-4 w-4 text-running-500" /><span className="font-medium">{pb.distance}</span></div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /><span className="font-mono font-bold text-lg">{pb.time}</span></div></td>
                  <td className="px-4 py-3"><span className="text-sm text-muted-foreground">{pb.pace}</span></td>
                  <td className="px-4 py-3 text-sm">{pb.race}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(pb.date)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(pb.id)}
                      className="rounded-lg p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Personal Best">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Distance</label>
            <select value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-running-500">
              {distances.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-running-500" placeholder="42:15" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pace (/km)</label>
              <input value={form.pace} onChange={(e) => setForm({ ...form, pace: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-running-500" placeholder="4:13" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-running-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Race / Event Name</label>
            <input required value={form.race} onChange={(e) => setForm({ ...form, race: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-running-500" placeholder="Brighton 10K" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button type="submit" className="rounded-lg bg-running-600 px-4 py-2 text-sm font-medium text-white hover:bg-running-700 transition-colors">Save PB</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
