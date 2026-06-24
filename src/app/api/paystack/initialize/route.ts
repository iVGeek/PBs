import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, currency } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })

    const prices: Record<string, number> = {
      KES: 5000, USD: 4000, GBP: 3000, EUR: 3500, NGN: 5000000, GHS: 48000, ZAR: 70000,
    }
    const amount = prices[currency] || prices['KES']
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/callback`

    const resp = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount, currency: currency || 'KES', callback_url: callbackUrl }),
    })
    const data = await resp.json()
    if (!data.status) return NextResponse.json({ error: data.message || 'Paystack error' }, { status: 400 })
    return NextResponse.json({ authorization_url: data.data.authorization_url, reference: data.data.reference })
  } catch {
    return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 })
  }
}
