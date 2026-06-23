'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Medal, Trophy, Hash, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { href: '/', label: 'Medal Wall', icon: Medal },
  { href: '/pbs', label: 'Personal Bests', icon: Trophy },
  { href: '/bibs', label: 'Bib Numbers', icon: Hash },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0d0d1a]/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-600/20 transition-all group-hover:shadow-amber-600/40 group-hover:scale-110">
            <Medal className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold">
            Medal <span className="text-gradient">Holder</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-2xl p-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all',
                  active
                    ? 'bg-amber-500/20 text-amber-300 shadow-sm'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                )}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>

        <button onClick={() => setOpen(!open)}
          className="md:hidden rounded-xl p-2 text-white/50 hover:text-white hover:bg-white/5 transition-all">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-[#0d0d1a]/95 backdrop-blur-2xl md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    active ? 'bg-amber-500/20 text-amber-300' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  )}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
