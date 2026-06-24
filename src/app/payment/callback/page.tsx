'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Medal, Check, X, Loader2 } from 'lucide-react'
import { markUserPaid, getCurrentUser } from '@/lib/store'
import { useAuth } from '@/components/AuthProvider'
import { toast } from '@/components/Toaster'

export default function PaymentCallback() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (!reference) { setStatus('failed'); return }

    fetch(`/api/paystack/verify?reference=${reference}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          const session = getCurrentUser()
          if (session) { markUserPaid(session.userId); refreshUser() }
          setStatus('success')
          toast('Payment successful! Welcome to Medal Holder.', 'success')
        } else {
          setStatus('failed')
          toast('Payment verification failed', 'error')
        }
      })
      .catch(() => { setStatus('failed'); toast('Could not verify payment', 'error') })
  }, [searchParams, refreshUser])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#1e1e2e] to-[#181825] p-8 shadow-2xl max-w-sm w-full text-center">
        <div className="mb-4 flex justify-center">
          {status === 'verifying' && <Loader2 className="h-12 w-12 animate-spin text-accent-bright" />}
          {status === 'success' && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-light">
              <Check className="h-8 w-8 text-accent-bright" />
            </div>
          )}
          {status === 'failed' && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <X className="h-8 w-8 text-red-400" />
            </div>
          )}
        </div>

        {status === 'verifying' && (
          <>
            <h1 className="text-2xl font-bold text-white">Verifying Payment</h1>
            <p className="mt-2 text-sm text-muted-foreground">Please wait while we confirm your transaction...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
            <p className="mt-2 text-sm text-muted-foreground">You now have lifetime access. Let&apos;s set up your medal wall.</p>
            <button onClick={() => router.push('/')}
              className="mt-6 w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent transition-all hover:shadow-xl"
              style={{ background: 'var(--gradient-btn)' }}>
              Get Started
            </button>
          </>
        )}
        {status === 'failed' && (
          <>
            <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Please try again.</p>
            <button onClick={() => router.push('/payment')}
              className="mt-6 w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent transition-all hover:shadow-xl"
              style={{ background: 'var(--gradient-btn)' }}>
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
