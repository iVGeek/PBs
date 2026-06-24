'use client'

import { useState } from 'react'
import { Medal, CreditCard, Sparkles, Check, ArrowRight, Shield, Globe } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from '@/components/Toaster'
import { PAYMENT_PRICES } from '@/types'

export default function PaymentPage() {
  const { userEmail, userId, userName, isPaid, refreshUser } = useAuth()
  const router = useRouter()
  const [currency, setCurrency] = useState('KES')
  const [loading, setLoading] = useState(false)

  if (isPaid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#1e1e2e] to-[#181825] p-8 shadow-2xl max-w-sm w-full text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-light">
            <Check className="h-8 w-8 text-accent-bright" />
          </div>
          <h1 className="text-2xl font-bold text-white">Already Paid!</h1>
          <p className="mt-2 text-sm text-muted-foreground">You have full access. Start building your medal wall.</p>
          <button onClick={() => router.push('/')}
            className="mt-6 w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent transition-all hover:shadow-xl"
            style={{ background: 'var(--gradient-btn)' }}>
            Go to Medal Wall
          </button>
        </div>
      </div>
    )
  }

  async function handlePay() {
    if (!userId) { router.push('/login'); return }
    const email = userEmail
    setLoading(true)
    try {
      const resp = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userId, currency }),
      })
      const data = await resp.json()
      if (data.error) { toast(data.error, 'error'); setLoading(false); return }
      window.location.href = data.authorization_url
    } catch {
      toast('Failed to connect to payment gateway', 'error')
      setLoading(false)
    }
  }

  const price = PAYMENT_PRICES[currency]

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
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
            <CreditCard className="mx-auto h-8 w-8 text-accent-bright mb-3" />
            <h1 className="text-2xl font-bold text-white">One-Time Payment</h1>
            <p className="mt-1 text-sm text-muted-foreground">Lifetime access for {userName || 'you'}</p>
          </div>

          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-5 text-center">
            <div className="text-4xl font-bold text-white">{price?.label || 'KES 5,000'}</div>
            <div className="mt-1 text-xs text-muted-foreground">Pay once, use forever</div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-white/60 mb-2">Currency</label>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.entries(PAYMENT_PRICES).map(([code, p]) => (
                <button key={code} onClick={() => setCurrency(code)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    currency === code ? 'border-accent-strong bg-accent text-accent-bright' : 'border-white/5 text-white/50 hover:border-white/20 hover:text-white/80'
                  }`}>
                  {code}
                </button>
              ))}
            </div>
          </div>

          <ul className="mb-6 space-y-2 text-sm">
            {['Unlimited medals & PBs', 'Bib number collection', 'All themes & fonts', 'Strava integration', 'Future updates'].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-white/70">
                <Check className="h-4 w-4 text-accent-bright shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <button onClick={handlePay} disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg shadow-accent transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'var(--gradient-btn)' }}>
            {loading ? 'Processing...' : <>Pay {price?.label || 'KES 5,000'} <ArrowRight className="h-4 w-4" /></>}
          </button>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            Secured by Paystack
          </div>
        </div>
      </div>
    </div>
  )
}
