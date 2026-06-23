'use client'

import { useEffect, useState } from 'react'
import { Plus, Hash, Calendar, Trash2 } from 'lucide-react'
import { getBibs, addBib, deleteBib, seedSampleData } from '@/lib/store'
import { generateId, formatDate } from '@/lib/utils'
import type { BibNumber } from '@/types'
import { Modal } from '@/components/Modal'
import { EmptyState } from '@/components/EmptyState'
import { toast } from '@/components/Toaster'

const distances = ['5K', '10K', 'Half Marathon', 'Marathon', '10 Mile', '5 Mile', '1 Mile', 'Other']

export default function BibsPage() {
  const [bibs, setBibs] = useState<BibNumber[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ number: '', raceName: '', eventDate: '', distance: '10K', notes: '' })

  useEffect(() => {
    seedSampleData()
    setBibs(getBibs())
    setIsLoaded(true)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.number || !form.eventDate || !form.raceName) {
      toast('Please fill in required fields', 'error')
      return
    }
    addBib({ id: generateId(), number: form.number, raceName: form.raceName, eventDate: form.eventDate, distance: form.distance, notes: form.notes || undefined })
    setBibs(getBibs())
    setModalOpen(false)
    setForm({ number: '', raceName: '', eventDate: '', distance: '10K', notes: '' })
    toast('Bib number saved!', 'success')
  }

  function handleDelete(id: string) {
    deleteBib(id)
    setBibs(getBibs())
    toast('Bib removed', 'info')
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bib Numbers</h1>
          <p className="mt-1 text-muted-foreground">Your race bib collection</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Bib
        </button>
      </div>

      {bibs.length === 0 ? (
        <EmptyState title="No bib numbers yet" description="Add your first race bib number." actionLabel="Add Bib" onAction={() => setModalOpen(true)} icon={<Hash className="h-12 w-12" />} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bibs.map((bib, i) => (
            <div key={bib.id} className="group relative animate-fade-up rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ animationDelay: `${i * 50}ms` }}>
              <button onClick={() => handleDelete(bib.id)}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-32 w-40 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-dashed border-blue-500/30">
                  <div className="text-center">
                    <Hash className="mx-auto h-5 w-5 text-blue-500 mb-1" />
                    <span className="block font-mono text-2xl font-bold tracking-widest text-blue-400">{bib.number}</span>
                  </div>
                </div>
              </div>

              <h3 className="text-center font-semibold">{bib.raceName}</h3>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(bib.eventDate)}
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2 py-0.5">{bib.distance}</span>
                </div>
              </div>
              {bib.notes && <p className="mt-3 text-center text-xs italic text-muted-foreground border-t border-border/50 pt-3">&ldquo;{bib.notes}&rdquo;</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Bib Number">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bib Number</label>
            <input required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="A1250" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Race Name</label>
            <input required value={form.raceName} onChange={(e) => setForm({ ...form, raceName: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="London Marathon 2024" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input required type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Distance</label>
              <select value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {distances.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Any memories from this race?" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">Save Bib</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
