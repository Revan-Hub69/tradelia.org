import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-static'
export const revalidate = 300

export async function GET() {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
      cwd: process.cwd(),
      message: 'Debug endpoint working'
    }

    return NextResponse.json(debugInfo, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      error: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}