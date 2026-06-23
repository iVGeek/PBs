'use client'

import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  href: string
  color: 'gold' | 'green' | 'blue' | 'purple'
}

const colorMap = {
  gold: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'hover:border-amber-500/30',
  },
  green: {
    bg: 'bg-running-500/10',
    text: 'text-running-500',
    border: 'hover:border-running-500/30',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    border: 'hover:border-blue-500/30',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    border: 'hover:border-purple-500/30',
  },
}

export function StatCard({ title, value, icon: Icon, href, color }: StatCardProps) {
  const c = colorMap[color]
  return (
    <Link
      href={href}
      className={`rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md ${c.border}`}
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-lg ${c.bg} p-2`}>
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{title}</div>
      </div>
    </Link>
  )
}
