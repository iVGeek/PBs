'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Hash, Calendar, Trash2, Camera, X, Sparkles, ArrowRight } from 'lucide-react'
import { getBibs, addBib, deleteBib, seedSampleData } from '@/lib/store'
import { generateId, formatDate } from '@/lib/utils'
import type { BibNumber } from '@/types'
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

function BibCard({ bib, onDelete, index }: { bib: BibNumber; onDelete: (id: string) => void; index: number }) {
  const [imgError, setImgError] = useState(false)
  return (
    <div
      className="group relative animate-fade-up rounded-2xl border border-white/5 bg-gradient-to-b from-[#1e1e2e] to-[#181825] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:border-blue-500/20"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <button onClick={() => onDelete(bib.id)}
        className="absolute right-3 top-3 z-10 rounded-xl bg-black/60 p-2 text-white/60 opacity-0 group-hover:opacity-100 hover:bg-red-500/80 hover:text-white transition-all backdrop-blur-sm">
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="relative">
        {bib.imageUrl && !imgError ? (
          <div className="relative overflow-hidden">
            <img src={bib.imageUrl} alt={bib.raceName} className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImgError(true)} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181825] via-transparent to-transparent" />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-blue-500/5 via-blue-600/5 to-transparent">
            <div className="text-center">
              <Hash className="mx-auto h-8 w-8 text-blue-500/30 mb-2" />
              <span className="block font-mono text-2xl font-bold tracking-[0.2em] text-blue-400/60">{bib.number}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-white/90 group-hover:text-white transition-colors">{bib.raceName}</h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(bib.eventDate)}
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-medium">{bib.distance}</span>
        </div>
        {bib.notes && <p className="mt-3 text-xs italic text-muted-foreground/60 border-t border-white/5 pt-3">&ldquo;{bib.notes}&rdquo;</p>}
      </div>
    </div>
  )
}

export default function BibsPage() {
  const [bibs, setBibs] = useState<BibNumber[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ number: '', raceName: '', eventDate: '', distance: '10K', notes: '' })

  useEffect(() => {
    seedSampleData()
    setBibs(getBibs())
    setIsLoaded(true)
  }, [])

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast('Image too large (max 2MB)', 'error'); return }
    readFileAsDataURL(file).then(setImagePreview).catch(() => toast('Failed to read image', 'error'))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.number || !form.eventDate || !form.raceName) { toast('Please fill in required fields', 'error'); return }
    addBib({ id: generateId(), number: form.number, raceName: form.raceName, eventDate: form.eventDate, distance: form.distance, notes: form.notes || undefined, imageUrl: imagePreview || undefined })
    setBibs(getBibs())
    setModalOpen(false); setImagePreview(null)
    setForm({ number: '', raceName: '', eventDate: '', distance: '10K', notes: '' })
    toast('Bib saved!', 'success')
  }

  function handleDelete(id: string) { deleteBib(id); setBibs(getBibs()); toast('Bib removed', 'info') }

  if (!isLoaded) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /></div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent p-8 sm:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            Race Bib Collection
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">Bib Numbers</h1>
          <p className="mt-3 max-w-lg text-muted-foreground/80">Every race starts with a number. Keep your collection in one place.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40 hover:scale-105 active:scale-95">
              <Plus className="h-4 w-4" /> Add Bib
            </button>
            <Link href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/70 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white">
              Medal Wall <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {bibs.length === 0 ? (
        <EmptyState title="No bib numbers yet" description="Add your first race bib number." actionLabel="Add Bib" onAction={() => setModalOpen(true)} icon={<Hash className="h-12 w-12" />} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bibs.map((bib, i) => <BibCard key={bib.id} bib={bib} onDelete={handleDelete} index={i} />)}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setImagePreview(null) }} title="Add Bib Number">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div onClick={() => fileRef.current?.click()}
            className="relative flex h-36 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all overflow-hidden group">
            {imagePreview ? (
              <><img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                <button type="button" onClick={(e) => { e.stopPropagation(); setImagePreview(null); if (fileRef.current) fileRef.current.value = '' }}
                  className="absolute top-3 right-3 rounded-full bg-black/70 p-1.5 text-white hover:bg-red-500/80 transition-colors"><X className="h-4 w-4" /></button></>
            ) : (
              <div className="text-center text-muted-foreground group-hover:text-blue-400 transition-colors">
                <Camera className="mx-auto h-8 w-8 mb-1 opacity-50" />
                <span className="text-sm font-medium">Upload bib photo</span>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Bib Number</label>
            <input required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" placeholder="A1250" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Race Name</label>
            <input required value={form.raceName} onChange={(e) => setForm({ ...form, raceName: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" placeholder="London Marathon 2024" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/80">Date</label>
              <input required type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/80">Distance</label>
              <select value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all">
                {distances.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" rows={3} placeholder="Any memories?" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setModalOpen(false); setImagePreview(null) }}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:shadow-blue-600/30 hover:scale-105 active:scale-95">Save Bib</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
