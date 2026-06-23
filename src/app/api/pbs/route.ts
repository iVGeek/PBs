import { NextResponse } from 'next/server'

let pbs: any[] = []

export async function GET() {
  return NextResponse.json(pbs)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const pb = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      ...body,
      createdAt: new Date().toISOString(),
    }
    pbs.unshift(pb)
    return NextResponse.json(pb, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
