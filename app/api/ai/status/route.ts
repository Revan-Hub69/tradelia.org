import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Status API
 * Checks if AI service is enabled (API key configured)
 * Returns status without exposing the actual key
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    const enabled = !!apiKey && apiKey.length > 0 && !apiKey.includes('your_');

    return NextResponse.json({
      enabled,
      model: enabled ? 'llama-3.3-70b-versatile' : null,
    });
  } catch (error) {
    return NextResponse.json(
      { enabled: false, error: 'Error checking AI status' },
      { status: 500 }
    );
  }
}
