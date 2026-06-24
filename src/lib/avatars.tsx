export interface AvatarOption {
  id: string
  label: string
  svg: (size?: number) => React.ReactNode
}

const bgColors = [
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-green-600',
  'from-blue-500 to-cyan-600',
  'from-violet-500 to-purple-600',
  'from-red-500 to-rose-600',
  'from-pink-500 to-fuchsia-600',
  'from-cyan-500 to-teal-600',
  'from-orange-500 to-pink-600',
]

function RunnerSvg({ size = 40, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="8" r="4.5" fill={color} />
      <path d="M12 20l4-3 2 4 3-5 5 2 2 3" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M18 24l-3 6M22 22l2 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function SprintSvg({ size = 40, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="7" r="4" fill={color} />
      <path d="M10 22l5-4 3 3 4-6 4 2 3 4" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M17 25l-4 5M21 23l1 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M28 13l3-3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function FinishSvg({ size = 40, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="8" r="4" fill={color} />
      <path d="M8 24l6-5 3 4 3-7 5 3 2 4" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M17 28l-3 4M21 25l1 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M30 32l-2-6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function StrideSvg({ size = 40, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="7" r="4.5" fill={color} />
      <path d="M11 21l4-3 2 4 4-5 4 2 3 3" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M18 25l-3 5M22 23l2 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="30" cy="16" r="1.5" fill={color} />
    </svg>
  )
}

function TrailSvg({ size = 40, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="7" r="4" fill={color} />
      <path d="M9 23l5-4 3 3 4-6 4 2 3 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M17 26l-4 4M21 24l1 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M28 20l3-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function RaceSvg({ size = 40, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="8" r="4" fill={color} />
      <path d="M7 26l6-6 3 4 4-7 5 3 2 5" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M17 29l-2 3M22 27l1 5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PaceSvg({ size = 40, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="7" r="4.5" fill={color} />
      <path d="M12 22l4-3 2 3 3-5 5 3 2 3" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M18 25l-2 5M23 23l1 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M30 15l2-2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MedalSvg({ size = 40, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="7" r="4" fill={color} />
      <path d="M10 23l5-4 3 3 4-6 4 3 3 3" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M17 26l-3 5M22 24l2 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M26 16l3-2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const avatarSvgs = [RunnerSvg, SprintSvg, FinishSvg, StrideSvg, TrailSvg, RaceSvg, PaceSvg, MedalSvg]
const labels = ['Runner', 'Sprinter', 'Finisher', 'Stride', 'Trail', 'Racer', 'Pacer', 'Champion']

export const avatarOptions: AvatarOption[] = avatarSvgs.map((Svg, i) => ({
  id: `avatar-${i}`,
  label: labels[i],
  svg: (size = 40) => <Svg size={size} />,
}))

export function getAvatarBg(id: string): string {
  const idx = avatarOptions.findIndex(a => a.id === id)
  return bgColors[idx >= 0 ? idx : 0]
}

export function getAvatarLabel(id: string): string {
  const a = avatarOptions.find(a => a.id === id)
  return a?.label || 'Runner'
}
