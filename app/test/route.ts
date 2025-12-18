import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-static'
export const revalidate = 300

export async function GET() {
  return NextResponse.json({ 
    message: 'API working',
    timestamp: new Date().toISOString()
  })
}