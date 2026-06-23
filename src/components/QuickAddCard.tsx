import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'

interface QuickAddCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  variant: 'gold' | 'green' | 'blue'
}

const variantMap = {
  gold: {
    bg: 'bg-gradient-to-br from-amber-500/10 to-amber-600/5',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    border: 'hover:border-amber-500/30',
  },
  green: {
    bg: 'bg-gradient-to-br from-running-500/10 to-running-600/5',
    iconBg: 'bg-running-500/10',
    iconColor: 'text-running-500',
    border: 'hover:border-running-500/30',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    border: 'hover:border-blue-500/30',
  },
}

export function QuickAddCard({ title, description, icon: Icon, href, variant }: QuickAddCardProps) {
  const v = variantMap[variant]
  return (
    <Link
      href={href}
      className={`rounded-xl border border-border ${v.bg} p-4 transition-all hover:shadow-md ${v.border}`}
    >
      <div className={`mb-3 inline-flex rounded-lg ${v.iconBg} p-2`}>
        <Icon className={`h-5 w-5 ${v.iconColor}`} />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Link>
  )
}
