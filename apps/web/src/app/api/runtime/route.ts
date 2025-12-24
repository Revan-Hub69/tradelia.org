import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.API_INTERNAL_URL || process.env.API_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization') || ''
    const headers: Record<string, string> = {}
    if (auth) {
      headers.authorization = auth
    }

    const response = await fetch(`${API_BASE}/runtime`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Runtime API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
