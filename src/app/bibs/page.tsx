'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Hash, Calendar, Trash2, Camera, X } from 'lucide-react'
import { getBibs, addBib, deleteBib, seedSampleData } from '@/lib/store'
import { generateId, formatDate } from '@/lib/utils'
import type { BibNumber } from '@/types'
import { Modal } from '@/components/Modal'
import { EmptyState } from '@/components/EmptyState'
import { toast } from '@/components/Toaster'

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
    <div className="group relative animate-fade-up rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ animationDelay: `${index * 50}ms` }}>
      <button onClick={() => onDelete(bib.id)}
        className="absolute right-2 top-2 z-10 rounded-lg bg-black/50 p-1.5 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500/70 transition-all backdrop-blur-sm">
        <Trash2 className="h-4 w-4" />
      </button>

      {bib.imageUrl && !imgError ? (
        <img src={bib.imageUrl} alt={bib.raceName} className="w-full aspect-[4/3] object-cover" onError={() => setImgError(true)} />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <div className="text-center">
            <Hash className="mx-auto h-8 w-8 text-blue-500/40" />
            <span className="mt-1 block font-mono text-lg font-bold tracking-widest text-blue-400">{bib.number}</span>
          </div>
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold">{bib.raceName}</h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDate(bib.eventDate)}
          <span className="rounded-full bg-secondary px-2 py-0.5">{bib.distance}</span>
        </div>
        {bib.notes && <p className="mt-2 text-xs italic text-muted-foreground border-t border-border/50 pt-2">&ldquo;{bib.notes}&rdquo;</p>}
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
    if (file.size > 2 * 1024 * 1024) {
      toast('Image too large (max 2MB)', 'error')
      return
    }
    readFileAsDataURL(file).then(setImagePreview).catch(() => toast('Failed to read image', 'error'))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.number || !form.eventDate || !form.raceName) {
      toast('Please fill in required fields', 'error')
      return
    }
    addBib({
      id: generateId(),
      number: form.number,
      raceName: form.raceName,
      eventDate: form.eventDate,
      distance: form.distance,
      notes: form.notes || undefined,
      imageUrl: imagePreview || undefined,
    })
    setBibs(getBibs())
    setModalOpen(false)
    setImagePreview(null)
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
            <BibCard key={bib.id} bib={bib} onDelete={handleDelete} index={i} />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setImagePreview(null) }} title="Add Bib Number">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div onClick={() => fileRef.current?.click()}
              className="relative flex h-36 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 hover:border-blue-500/50 transition-colors overflow-hidden">
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
                  <span className="text-sm">Upload bib photo</span>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
            </div>
          </div>
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
            <button type="button" onClick={() => { setModalOpen(false); setImagePreview(null) }} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">Save Bib</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
