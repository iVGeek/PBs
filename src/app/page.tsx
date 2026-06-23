'use client'

import { useEffect, useState } from 'react'
import { Plus, Medal, MapPin, Clock, Calendar, Award, Trash2, Trophy, Hash } from 'lucide-react'
import { getMedals, addMedal, deleteMedal, seedSampleData, getPBs, getBibs } from '@/lib/store'
import { generateId, formatDate } from '@/lib/utils'
import type { Medal as MedalType } from '@/types'
import { Modal } from '@/components/Modal'
import { EmptyState } from '@/components/EmptyState'
import { toast } from '@/components/Toaster'
import Link from 'next/link'

const distances = ['5K', '10K', 'Half Marathon', 'Marathon', '10 Mile', '5 Mile', '1 Mile', 'Other']
const medalColors = ['gold', 'silver', 'bronze', 'other'] as const

export default function MedalWall() {
  const [medals, setMedals] = useState<MedalType[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    raceName: '', eventDate: '', location: '', distance: '10K',
    time: '', pace: '', place: '', category: '',
    medalColor: 'gold' as MedalType['medalColor'], notes: '',
  })

  useEffect(() => {
    seedSampleData()
    setMedals(getMedals())
    setIsLoaded(true)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    addMedal({
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
    })
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  const pbs = getPBs()
  const bibs = getBibs()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400">
          Race Medal Collection
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Medal <span className="text-gradient">Holder</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
          Your personal wall of race medals, personal bests, and bib numbers.
          Every race tells a story.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <Link href="/pbs" className="rounded-xl border border-border bg-card p-4 text-center hover:border-running-500/30 transition-all hover:shadow-md">
          <Trophy className="mx-auto h-5 w-5 text-running-500 mb-1" />
          <div className="text-2xl font-bold">{pbs.length}</div>
          <div className="text-xs text-muted-foreground">Personal Bests</div>
        </Link>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Medal className="mx-auto h-5 w-5 text-amber-500 mb-1" />
          <div className="text-2xl font-bold">{medals.length}</div>
          <div className="text-xs text-muted-foreground">Medals Earned</div>
        </div>
        <Link href="/bibs" className="rounded-xl border border-border bg-card p-4 text-center hover:border-blue-500/30 transition-all hover:shadow-md">
          <Hash className="mx-auto h-5 w-5 text-blue-500 mb-1" />
          <div className="text-2xl font-bold">{bibs.length}</div>
          <div className="text-xs text-muted-foreground">Bib Numbers</div>
        </Link>
      </div>

      {/* Add Medal Button */}
      <div className="mb-8 text-center">
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-medium text-white hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20"
        >
          <Plus className="h-4 w-4" />
          Add New Medal
        </button>
      </div>

      {/* Medal Wall */}
      {medals.length === 0 ? (
        <EmptyState
          title="No medals yet"
          description="Add your first race medal to start building your collection wall."
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

      {/* Add Medal Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New Medal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Race Name</label>
            <input required value={form.raceName} onChange={(e) => setForm({ ...form, raceName: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="London Marathon 2024" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input required type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Distance</label>
              <select value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                {distances.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="London, UK" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Finish Time</label>
              <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="3:45:22" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pace (/km)</label>
              <input value={form.pace} onChange={(e) => setForm({ ...form, pace: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="5:20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Place</label>
              <input type="number" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="1250" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Senior Men" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Medal Color</label>
            <div className="flex gap-3">
              {medalColors.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, medalColor: c })}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${form.medalColor === c ? 'border-white scale-110' : 'border-transparent'} ${
                    c === 'gold' ? 'bg-amber-500' : c === 'silver' ? 'bg-gray-300' : c === 'bronze' ? 'bg-orange-700' : 'bg-gray-500'
                  }`} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" rows={3} placeholder="How did it go?" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors">Save Medal</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function MedalCard({ medal, onDelete, index }: { medal: MedalType; onDelete: (id: string) => void; index: number }) {
  const ribbonMap = {
    gold: { bg: 'from-amber-500 via-amber-400 to-amber-600', shadow: 'shadow-amber-500/20' },
    silver: { bg: 'from-gray-300 via-gray-200 to-gray-400', shadow: 'shadow-gray-300/20' },
    bronze: { bg: 'from-orange-700 via-orange-600 to-orange-800', shadow: 'shadow-orange-700/20' },
    other: { bg: 'from-gray-500 via-gray-400 to-gray-600', shadow: 'shadow-gray-500/20' },
  }
  const ribbon = ribbonMap[medal.medalColor || 'other']

  return (
    <div
      className={`group relative animate-fade-up rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${ribbon.shadow}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Ribbon */}
      <div className={`h-2 w-full bg-gradient-to-r ${ribbon.bg}`} />

      {/* Ribbon loop accent */}
      <div className={`absolute top-2 right-4 h-6 w-6 rounded-full border-2 ${ribbon.bg} bg-gradient-to-br opacity-60`} />

      <button onClick={() => onDelete(medal.id)}
        className="absolute right-3 top-8 rounded-lg p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all z-10">
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="p-5">
        {/* Medal Circle */}
        <div className="mb-4 flex items-start justify-between">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${ribbon.bg} shadow-lg`}>
            <span className="text-2xl">
              {medal.medalColor === 'gold' ? '🥇' : medal.medalColor === 'silver' ? '🥈' : medal.medalColor === 'bronze' ? '🥉' : '🏅'}
            </span>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{medal.distance}</span>
        </div>

        <h3 className="font-semibold text-lg leading-tight">{medal.raceName}</h3>

        <div className="mt-3 space-y-1.5">
          {medal.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {medal.location}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {formatDate(medal.eventDate)}
          </div>
          {medal.time && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono font-medium text-foreground">{medal.time}</span>
              {medal.pace && <span className="text-xs">&middot; {medal.pace} /km</span>}
            </div>
          )}
          {medal.place && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-3.5 w-3.5 shrink-0" />
              #{medal.place} {medal.category ? `- ${medal.category}` : ''}
            </div>
          )}
        </div>

        {medal.notes && (
          <p className="mt-3 text-sm italic text-muted-foreground border-t border-border/50 pt-3">
            &ldquo;{medal.notes}&rdquo;
          </p>
        )}
      </div>
    </div>
  )
}
