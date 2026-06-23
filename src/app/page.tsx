'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Medal, Clock, MapPin, Trash2, Trophy, Hash, Camera, X, Sparkles, ArrowRight, Timer, Map, Target } from 'lucide-react'
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
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  const pbs = getPBs()
  const bibs = getBibs()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero Section */}
      <div className="relative mb-16 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent p-8 sm:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            Race Medal Collection
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Medal <span className="text-gradient-hero">Holder</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground/80">
            Your personal wall of race medals, personal bests, and bib numbers.
            Every race tells a story worth keeping.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-600/30 transition-all hover:shadow-xl hover:shadow-amber-600/40 hover:scale-105 active:scale-95">
              <Plus className="h-4 w-4" />
              Add Medal
            </button>
            <Link href="/pbs"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/70 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white">
              <Trophy className="h-4 w-4" />
              View PBs
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mb-10 grid gap-3 sm:grid-cols-3">
        <Link href="/pbs"
          className="group relative overflow-hidden rounded-2xl border border-running-500/20 bg-gradient-to-br from-running-500/10 to-running-600/5 p-5 transition-all hover:shadow-lg hover:shadow-running-500/10 hover:-translate-y-0.5">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-running-500/10 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-running-500/20">
              <Trophy className="h-6 w-6 text-running-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{pbs.length}</div>
              <div className="text-sm text-running-300/70">Personal Bests</div>
            </div>
          </div>
        </Link>

        <div className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-5 transition-all hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-amber-500/10 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
              <Medal className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{medals.length}</div>
              <div className="text-sm text-amber-300/70">Medals Earned</div>
            </div>
          </div>
        </div>

        <Link href="/bibs"
          className="group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-5 transition-all hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-blue-500/10 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
              <Hash className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{bibs.length}</div>
              <div className="text-sm text-blue-300/70">Bib Numbers</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Medal Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Medal className="h-5 w-5 text-amber-500" />
          Your Medal Collection
        </h2>
        <span className="text-sm text-muted-foreground">{medals.length} medal{medals.length !== 1 ? 's' : ''}</span>
      </div>

      {medals.length === 0 ? (
        <EmptyState title="No medals yet" description="Add your first race medal to start your collection." actionLabel="Add Medal" onAction={() => setModalOpen(true)} icon={<Medal className="h-12 w-12" />} />
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {medals.map((medal, i) => (
            <MedalCard key={medal.id} medal={medal} onDelete={handleDelete} index={i} />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setImagePreview(null) }} title="Add New Medal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <div onClick={() => fileRef.current?.click()}
              className="relative flex h-44 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all overflow-hidden group">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setImagePreview(null); if (fileRef.current) fileRef.current.value = '' }}
                    className="absolute top-3 right-3 rounded-full bg-black/70 p-1.5 text-white hover:bg-red-500/80 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="text-center text-muted-foreground group-hover:text-amber-400 transition-colors">
                  <Camera className="mx-auto h-10 w-10 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span className="text-sm font-medium">Upload medal photo</span>
                  <p className="text-xs text-muted-foreground/60 mt-1">Click to browse (max 2MB)</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Race Name</label>
            <input required value={form.raceName} onChange={(e) => setForm({ ...form, raceName: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all" placeholder="London Marathon 2024" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/80">Date</label>
              <input required type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/80">Distance</label>
              <select value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all">
                {distances.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all" placeholder="London, UK" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/80">Finish Time</label>
              <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-mono" placeholder="3:45:22" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/80">Pace</label>
              <input value={form.pace} onChange={(e) => setForm({ ...form, pace: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all" placeholder="5:20 /km" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/80">Place</label>
              <input type="number" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all" placeholder="1250" />
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" checked={form.isPB} onChange={(e) => setForm({ ...form, isPB: e.target.checked })}
                    className="peer h-5 w-5 rounded-lg border border-white/20 bg-white/5 text-running-500 focus:ring-running-500/50 focus:ring-offset-0 cursor-pointer" />
                  <div className="pointer-events-none absolute inset-0 rounded-lg bg-running-500/20 opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-running-400" />
                  Personal Best
                </span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none" rows={3} placeholder="How did it go?" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setModalOpen(false); setImagePreview(null) }}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/20 transition-all hover:shadow-xl hover:shadow-amber-600/30 hover:scale-105 active:scale-95">Save Medal</button>
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
      className="group relative inline-block w-full animate-fade-up break-inside-avoid rounded-2xl border border-white/5 bg-gradient-to-b from-[#1e1e2e] to-[#181825] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 hover:border-amber-500/20"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Delete button */}
      <button onClick={() => onDelete(medal.id)}
        className="absolute right-3 top-3 z-10 rounded-xl bg-black/60 p-2 text-white/60 opacity-0 group-hover:opacity-100 hover:bg-red-500/80 hover:text-white transition-all backdrop-blur-sm">
        <Trash2 className="h-4 w-4" />
      </button>

      {/* PB Badge */}
      {medal.isPB && (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-running-500 to-running-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-running-500/40 flex items-center gap-1.5">
          <Trophy className="h-3 w-3" />
          PERSONAL BEST
        </div>
      )}

      {/* Image */}
      <div className="relative">
        {medal.imageUrl && !imgError ? (
          <div className="relative overflow-hidden">
            <img src={medal.imageUrl} alt={medal.raceName}
              className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImgError(true)} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181825] via-transparent to-transparent" />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-amber-500/5 via-amber-600/5 to-transparent">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                <Medal className="h-8 w-8 text-amber-500/30" />
              </div>
              <p className="text-xs font-medium text-white/30">{medal.distance}</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base font-bold leading-tight text-white/90 group-hover:text-white transition-colors">
          {medal.raceName}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {medal.time && (
            <span className="flex items-center gap-1.5 text-sm">
              <Timer className="h-3.5 w-3.5 text-amber-400/70" />
              <span className="font-mono font-semibold text-white/80">{medal.time}</span>
            </span>
          )}
          {medal.location && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Map className="h-3.5 w-3.5" />
              {medal.location}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(medal.eventDate)}</span>
          {medal.pace && <><span className="text-white/10">|</span><span>{medal.pace} /km</span></>}
          {medal.place && <><span className="text-white/10">|</span><span>#{medal.place}</span></>}
        </div>
        {medal.notes && (
          <p className="mt-3 text-xs italic text-muted-foreground/60 border-t border-white/5 pt-3 leading-relaxed">
            &ldquo;{medal.notes}&rdquo;
          </p>
        )}
      </div>
    </div>
  )
}
