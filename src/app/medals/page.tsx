'use client'

import { useEffect, useState } from 'react'
import { Plus, Medal, MapPin, Clock, Calendar, Award, Trash2 } from 'lucide-react'
import { getMedals, addMedal, deleteMedal } from '@/lib/store'
import { sampleMedals } from '@/lib/seed-data'
import { generateId, formatDate } from '@/lib/utils'
import type { Medal as MedalType } from '@/types'
import { Modal } from '@/components/Modal'
import { EmptyState } from '@/components/EmptyState'
import { toast } from '@/components/Toaster'

const distances = ['5K', '10K', 'Half Marathon', 'Marathon', '10 Mile', '5 Mile', '1 Mile', 'Other']
const medalColors = ['gold', 'silver', 'bronze', 'other'] as const

export default function MedalsPage() {
  const [medals, setMedals] = useState<MedalType[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    raceName: '',
    eventDate: '',
    location: '',
    distance: '10K',
    time: '',
    pace: '',
    place: '',
    category: '',
    medalColor: 'gold' as MedalType['medalColor'],
    notes: '',
  })

  useEffect(() => {
    const m = getMedals()
    setMedals(m.length > 0 ? m : sampleMedals)
    setIsLoaded(true)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const medal: MedalType = {
      id: generateId(),
      raceName: form.raceName,
      eventDate: form.eventDate,
      location: form.location,
      distance: form.distance,
      time: form.time || undefined,
      pace: form.pace || undefined,
      place: form.place ? parseInt(form.place) : undefined,
      category: form.category || undefined,
      medalColor: form.medalColor,
      notes: form.notes || undefined,
    }
    addMedal(medal)
    setMedals(getMedals())
    setModalOpen(false)
    setForm({ raceName: '', eventDate: '', location: '', distance: '10K', time: '', pace: '', place: '', category: '', medalColor: 'gold', notes: '' })
    toast('Medal added!', 'success')
  }

  function handleDelete(id: string) {
    deleteMedal(id)
    setMedals(getMedals())
    toast('Medal removed', 'info')
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Medal Portfolio</h1>
          <p className="mt-1 text-muted-foreground">Your race medals collection</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-running-600 px-4 py-2 text-sm font-medium text-white hover:bg-running-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Medal
        </button>
      </div>

      {medals.length === 0 ? (
        <EmptyState
          title="No medals yet"
          description="Add your first race medal to start building your portfolio."
          actionLabel="Add Medal"
          onAction={() => setModalOpen(true)}
          icon={<Medal className="h-12 w-12" />}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {medals.map((medal, i) => (
            <MedalCard key={medal.id} medal={medal} onDelete={handleDelete} index={i} />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New Medal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Race Name</label>
            <input
              required
              value={form.raceName}
              onChange={(e) => setForm({ ...form, raceName: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-running-500"
              placeholder="London Marathon 2024"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                required
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-running-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Distance</label>
              <select
                value={form.distance}
                onChange={(e) => setForm({ ...form, distance: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-running-500"
              >
                {distances.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-running-500"
              placeholder="London, UK"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Finish Time</label>
              <input
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-running-500"
                placeholder="3:45:22"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pace (/km)</label>
              <input
                value={form.pace}
                onChange={(e) => setForm({ ...form, pace: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-running-500"
                placeholder="5:20"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Place</label>
              <input
                type="number"
                value={form.place}
                onChange={(e) => setForm({ ...form, place: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-running-500"
                placeholder="1250"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-running-500"
                placeholder="Senior Men"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Medal Color</label>
            <div className="flex gap-3">
              {medalColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, medalColor: c })}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    form.medalColor === c ? 'border-white scale-110' : 'border-transparent'
                  } ${
                    c === 'gold' ? 'bg-amber-500' :
                    c === 'silver' ? 'bg-gray-300' :
                    c === 'bronze' ? 'bg-orange-700' : 'bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-running-500"
              rows={3}
              placeholder="How did it go?"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-running-600 px-4 py-2 text-sm font-medium text-white hover:bg-running-700 transition-colors"
            >
              Save Medal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function MedalCard({ medal, onDelete, index }: { medal: MedalType; onDelete: (id: string) => void; index: number }) {
  const colorMap = {
    gold: 'from-amber-500/30 to-amber-600/20 border-amber-500/30',
    silver: 'from-gray-300/30 to-gray-400/20 border-gray-300/30',
    bronze: 'from-orange-700/30 to-orange-800/20 border-orange-700/30',
    other: 'from-gray-500/30 to-gray-600/20 border-gray-500/30',
  }

  return (
    <div
      className={`group relative animate-fade-up rounded-xl border bg-gradient-to-br ${colorMap[medal.medalColor || 'other']} bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-0.5`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <button
        onClick={() => onDelete(medal.id)}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/50 text-2xl backdrop-blur">
          🏅
        </div>
        <span className="rounded-full bg-background/50 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
          {medal.distance}
        </span>
      </div>

      <h3 className="font-semibold leading-tight">{medal.raceName}</h3>

      <div className="mt-3 space-y-1.5">
        {medal.location && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {medal.location}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDate(medal.eventDate)}
        </div>
        {medal.time && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {medal.time}
            {medal.pace && <span>&middot; {medal.pace} /km</span>}
          </div>
        )}
        {medal.place && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Award className="h-3 w-3" />
            #{medal.place} {medal.category ? `- ${medal.category}` : ''}
          </div>
        )}
      </div>

      {medal.notes && (
        <p className="mt-3 text-xs italic text-muted-foreground border-t border-border/50 pt-3">
          &ldquo;{medal.notes}&rdquo;
        </p>
      )}
    </div>
  )
}
