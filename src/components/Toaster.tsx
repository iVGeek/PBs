'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

let addToastFn: ((t: Omit<Toast, 'id'>) => void) | null = null

export function toast(message: string, type: Toast['type'] = 'info') {
  addToastFn?.({ message, type })
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    addToastFn = (t) => {
      const id = Math.random().toString(36).substring(2)
      setToasts((prev) => [...prev, { ...t, id }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id))
      }, 3000)
    }
    return () => { addToastFn = null }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'animate-fade-up rounded-lg px-4 py-3 text-sm font-medium shadow-lg',
            t.type === 'success' && 'bg-running-600 text-white',
            t.type === 'error' && 'bg-red-600 text-white',
            t.type === 'info' && 'bg-secondary text-foreground'
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
