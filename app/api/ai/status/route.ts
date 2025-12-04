import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Status API
 * Groq (primary, free tier) + Simple RAG (final fallback)
 */
export async function GET(request: NextRequest) {
  try {
    const groqEnabled = !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 0;
    
    return NextResponse.json({
      enabled: groqEnabled,
      primary: groqEnabled ? 'groq' : 'fallback',
      fallback: 'simple-rag',
      description: 'Groq (free tier) → Simple RAG fallback',
    });
  } catch (error) {
    return NextResponse.json(
      { enabled: false, error: 'Error checking AI status' },
      { status: 500 }
    );
  }
}
