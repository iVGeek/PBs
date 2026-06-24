import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(new URL('/login?strava=error', req.url))
  }

  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/login?strava=error', req.url))
  }

  try {
    // Exchange code for tokens
    const res = await fetch('https://www.strava.com/api/v3/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!res.ok) {
      return NextResponse.redirect(new URL('/login?strava=error', req.url))
    }

    const data = await res.json()
    const athlete = data.athlete

    // Fetch athlete email (requires separate scope)
    let athleteEmail = ''
    try {
      const emailRes = await fetch('https://www.strava.com/api/v3/athlete', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      })
      if (emailRes.ok) {
        const athleteData = await emailRes.json()
        athleteEmail = athleteData.email || ''
      }
    } catch { /* email is optional */ }

    // Redirect back to app with athlete data in hash fragment
    const hash = new URLSearchParams({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: String(data.expires_at),
      athlete_id: String(athlete.id),
      athlete_name: `${athlete.firstname} ${athlete.lastname}`.trim(),
      athlete_email: athleteEmail,
    }).toString()

    return NextResponse.redirect(new URL(`/#${hash}`, req.url))
  } catch {
    return NextResponse.redirect(new URL('/login?strava=error', req.url))
  }
}
