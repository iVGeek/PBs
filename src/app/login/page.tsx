'use client'

import { Medal, LogIn, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full glob-accent blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full glob-accent-dim blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'var(--gradient-btn)' }}>
              <Medal className="h-4 w-4 text-white" />
            </div>
            <span>Medal <span className="text-gradient">Holder</span></span>
          </Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#1e1e2e] to-[#181825] p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <LogIn className="mx-auto h-8 w-8 text-accent-bright mb-3" />
            <h1 className="text-2xl font-bold text-white">Welcome</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in with Strava to manage your medals</p>
          </div>

          <a href="/api/strava/auth"
            className="flex w-full items-center justify-center gap-3 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'var(--gradient-btn)' }}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.56l-2.836 5.56H0L7.716 24l7.716-12.056H12.37m9.723 5.56l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066"/></svg>
            Continue with Strava
          </a>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Your races, automatically imported
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
