import { NextResponse } from 'next/server'

// Strava OAuth configuration
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || ''
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || ''
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || 'http://localhost:3000/api/strava/callback'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  // If no code, redirect to Strava auth
  if (!code) {
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${STRAVA_REDIRECT_URI}&response_type=code&approval_prompt=auto&scope=read,activity:read_all`
    return NextResponse.redirect(authUrl)
  }

  // Exchange code for token
  try {
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: 'Failed to exchange token' }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()

    // Fetch athlete info
    const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const athlete = await athleteResponse.json()

    return NextResponse.json({
      athlete,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Strava auth failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 400 })
    }

    // Fetch recent activities
    const activitiesResponse = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=50',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!activitiesResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 400 })
    }

    const activities = await activitiesResponse.json()

    // Extract PBs from activities
    const pbs = activities
      .filter((a: any) => a.type === 'Run' && a.pr_rank)
      .map((a: any) => ({
        id: a.id.toString(),
        distance: a.distance,
        time: a.moving_time,
        name: a.name,
        date: a.start_date_local,
        pr_rank: a.pr_rank,
      }))

    return NextResponse.json({ activities, pbs })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}
