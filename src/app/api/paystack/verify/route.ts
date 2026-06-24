import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('reference')
    if (!reference) return NextResponse.json({ error: 'Reference required' }, { status: 400 })

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })

    const resp = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    })
    const data = await resp.json()
    if (!data.status) return NextResponse.json({ error: data.message || 'Verification failed' }, { status: 400 })
    return NextResponse.json({ status: data.data.status, amount: data.data.amount, currency: data.data.currency, email: data.data.customer.email })
  } catch {
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}
