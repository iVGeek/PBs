import { NextResponse } from 'next/server'

let bibs: any[] = []

export async function GET() {
  return NextResponse.json(bibs)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const bib = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      ...body,
      createdAt: new Date().toISOString(),
    }
    bibs.unshift(bib)
    return NextResponse.json(bib, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
