import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const clientId = process.env.STRAVA_CLIENT_ID
  if (!clientId) {
    return new NextResponse('STRAVA_CLIENT_ID not configured', { status: 500 })
  }

  const redirectUri = process.env.STRAVA_REDIRECT_URI
  if (!redirectUri) {
    return new NextResponse('STRAVA_REDIRECT_URI not configured', { status: 500 })
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,read:email,activity:read_all',
  })

  return NextResponse.redirect(`https://www.strava.com/oauth/authorize?${params}`)
}
