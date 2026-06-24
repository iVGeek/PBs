import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let refreshToken: string
  try {
    const body = await req.json()
    refreshToken = body.refresh_token
  } catch {
    return NextResponse.json({ error: 'Missing refresh_token' }, { status: 400 })
  }

  try {
    const res = await fetch('https://www.strava.com/api/v3/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Refresh failed' }, { status: 401 })
    }

    const data = await res.json()
    return NextResponse.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      athlete: data.athlete ? { id: data.athlete.id, firstname: data.athlete.firstname, lastname: data.athlete.lastname } : undefined,
    })
  } catch {
    return NextResponse.json({ error: 'Network error' }, { status: 500 })
  }
}
