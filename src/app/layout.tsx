import type { Metadata } from 'next'
import { Inter, Space_Grotesk, DM_Sans, Outfit, Sora } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { ProfileProvider } from '@/components/ProfileProvider'
import { AuthProvider } from '@/components/AuthProvider'
import { StravaCallbackHandler } from '@/components/StravaCallbackHandler'
import { Toaster } from '@/components/Toaster'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' })

const fontVars = [inter.variable, spaceGrotesk.variable, dmSans.variable, outfit.variable, sora.variable].join(' ')

export const metadata: Metadata = {
  title: 'Medal Holder',
  description: 'Your race medal collection & running portfolio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${fontVars}`}>
      <body className="min-h-screen bg-background antialiased" style={{ fontFamily: 'var(--font-active, Inter, sans-serif)' }}>
        <AuthProvider>
          <ProfileProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
          </ProfileProvider>
          <StravaCallbackHandler />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
