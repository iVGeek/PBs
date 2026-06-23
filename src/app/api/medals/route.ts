import { NextResponse } from 'next/server'

// In-memory store (for demo; replace with DB in production)
let medals: any[] = []

export async function GET() {
  return NextResponse.json(medals)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const medal = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      ...body,
      createdAt: new Date().toISOString(),
    }
    medals.unshift(medal)
    return NextResponse.json(medal, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
