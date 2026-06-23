'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Medal, Clock, MapPin, Trash2, Trophy, Hash, Camera, X } from 'lucide-react'
import { getMedals, addMedal, deleteMedal, seedSampleData, getPBs, getBibs } from '@/lib/store'
import { generateId, formatDate } from '@/lib/utils'
import type { Medal as MedalType } from '@/types'
import { Modal } from '@/components/Modal'
import { EmptyState } from '@/components/EmptyState'
import { toast } from '@/components/Toaster'
import Link from 'next/link'

const distances = ['5K', '10K', 'Half Marathon', 'Marathon', '10 Mile', '5 Mile', '1 Mile', 'Other']

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function MedalWall() {
  const [medals, setMedals] = useState<MedalType[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    raceName: '', eventDate: '', location: '', distance: '10K',
    time: '', pace: '', place: '', notes: '', isPB: false,
  })

  useEffect(() => {
    seedSampleData()
    setMedals(getMedals())
    setIsLoaded(true)
  }, [])

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast('Image too large (max 2MB)', 'error')
      return
    }
    readFileAsDataURL(file).then(setImagePreview).catch(() => toast('Failed to read image', 'error'))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    addMedal({
      id: generateId(),
      raceName: form.raceName,
      eventDate: form.eventDate,
      location: form.location || undefined,
      distance: form.distance,
      time: form.time || undefined,
      pace: form.pace || undefined,
      place: form.place ? parseInt(form.place) : undefined,
      notes: form.notes || undefined,
      imageUrl: imagePreview || undefined,
      isPB: form.isPB,
    })
    setMedals(getMedals())
    setModalOpen(false)
    setImagePreview(null)
    setForm({ raceName: '', eventDate: '', location: '', distance: '10K', time: '', pace: '', place: '', notes: '', isPB: false })
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
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400">
          Race Medal Collection
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Medal <span className="text-gradient">Holder</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
          Your personal wall of race medals, personal bests, and bib numbers.
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <Link href="/pbs" className="rounded-xl border border-border bg-card p-4 text-center hover:border-running-500/30 transition-all hover:shadow-md">
          <Trophy className="mx-auto h-5 w-5 text-running-500 mb-1" />
          <div className="text-2xl font-bold">{pbs.length}</div>
          <div className="text-xs text-muted-foreground">Personal Bests</div>
        </Link>
        <div className="rounded-xl border border-amber-500/20 bg-card p-4 text-center">
          <Medal className="mx-auto h-5 w-5 text-amber-500 mb-1" />
          <div className="text-2xl font-bold">{medals.length}</div>
          <div className="text-xs text-muted-foreground">Medals</div>
        </div>
        <Link href="/bibs" className="rounded-xl border border-border bg-card p-4 text-center hover:border-blue-500/30 transition-all hover:shadow-md">
          <Hash className="mx-auto h-5 w-5 text-blue-500 mb-1" />
          <div className="text-2xl font-bold">{bibs.length}</div>
          <div className="text-xs text-muted-foreground">Bibs</div>
        </Link>
      </div>

      <div className="mb-8 text-center">
        <button onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-medium text-white hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20">
          <Plus className="h-4 w-4" />
          Add New Medal
        </button>
      </div>

      {medals.length === 0 ? (
        <EmptyState title="No medals yet" description="Add your first race medal to start your collection." actionLabel="Add Medal" onAction={() => setModalOpen(true)} icon={<Medal className="h-12 w-12" />} />
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {medals.map((medal, i) => (
            <MedalCard key={medal.id} medal={medal} onDelete={handleDelete} index={i} />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setImagePreview(null) }} title="Add New Medal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <div
              onClick={() => fileRef.current?.click()}
              className="relative flex h-40 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 hover:border-amber-500/50 transition-colors overflow-hidden"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setImagePreview(null); if (fileRef.current) fileRef.current.value = '' }}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80">
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Camera className="mx-auto h-8 w-8 mb-1" />
                  <span className="text-sm">Upload medal photo</span>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
            </div>
          </div>

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
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPB} onChange={(e) => setForm({ ...form, isPB: e.target.checked })}
                  className="h-4 w-4 rounded border-border bg-background text-running-500 focus:ring-running-500" />
                <span className="text-sm font-medium">This is a Personal Best</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" rows={3} placeholder="How did it go?" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setModalOpen(false); setImagePreview(null) }} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors">Save Medal</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function MedalCard({ medal, onDelete, index }: { medal: MedalType; onDelete: (id: string) => void; index: number }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className="group relative inline-block w-full animate-fade-up rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 break-inside-avoid"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <button onClick={() => onDelete(medal.id)}
        className="absolute right-2 top-2 z-10 rounded-lg bg-black/50 p-1.5 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500/70 transition-all backdrop-blur-sm">
        <Trash2 className="h-4 w-4" />
      </button>

      {/* PB Badge */}
      {medal.isPB && (
        <div className="absolute left-2 top-2 z-10 rounded-full bg-running-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg shadow-running-500/30 flex items-center gap-1">
          <Trophy className="h-3 w-3" />
          PB
        </div>
      )}

      {/* Medal Image */}
      {medal.imageUrl && !imgError ? (
        <img
          src={medal.imageUrl}
          alt={medal.raceName}
          className="w-full aspect-[4/3] object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <div className="text-center">
            <Medal className="mx-auto h-12 w-12 text-amber-500/40" />
            <p className="mt-2 text-xs text-muted-foreground">{medal.distance}</p>
          </div>
        </div>
      )}

      {/* Info overlay */}
      <div className="p-4">
        <h3 className="font-semibold leading-tight">{medal.raceName}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {medal.time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono font-medium text-foreground">{medal.time}</span>
            </span>
          )}
          {medal.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {medal.location}
            </span>
          )}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {formatDate(medal.eventDate)}
          {medal.pace && <span> &middot; {medal.pace} /km</span>}
        </div>
        {medal.notes && (
          <p className="mt-2 text-xs italic text-muted-foreground border-t border-border/50 pt-2">
            &ldquo;{medal.notes}&rdquo;
          </p>
        )}
      </div>
    </div>
  )
}
