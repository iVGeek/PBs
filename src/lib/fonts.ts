export interface FontOption {
  id: string
  name: string
  variable: string
  family: string
}

export const fontOptions: FontOption[] = [
  { id: 'inter', name: 'Inter', variable: '--font-inter', family: "'Inter', sans-serif" },
  { id: 'space-grotesk', name: 'Space Grotesk', variable: '--font-space-grotesk', family: "'Space Grotesk', sans-serif" },
  { id: 'dm-sans', name: 'DM Sans', variable: '--font-dm-sans', family: "'DM Sans', sans-serif" },
  { id: 'outfit', name: 'Outfit', variable: '--font-outfit', family: "'Outfit', sans-serif" },
  { id: 'sora', name: 'Sora', variable: '--font-sora', family: "'Sora', sans-serif" },
]

export function applyFont(fontId: string) {
  const font = fontOptions.find(f => f.id === fontId)
  if (font) {
    document.documentElement.style.setProperty('--font-active', font.family)
  }
}
