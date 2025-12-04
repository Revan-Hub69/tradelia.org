import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Status API
 * Together AI (primary, $25 free) + Groq (fallback) + Simple RAG (final fallback)
 */
export async function GET(request: NextRequest) {
  try {
    const togetherEnabled = !!process.env.TOGETHER_API_KEY && process.env.TOGETHER_API_KEY.length > 0;
    const groqEnabled = !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 0;
    
    return NextResponse.json({
      enabled: togetherEnabled || groqEnabled,
      primary: togetherEnabled ? 'together-ai' : groqEnabled ? 'groq' : 'fallback',
      fallback: groqEnabled ? 'groq' : 'simple-rag',
      finalFallback: 'simple-rag',
      description: 'Together AI ($25 free) → Groq fallback → Simple RAG final fallback',
    });
  } catch (error) {
    return NextResponse.json(
      { enabled: false, error: 'Error checking AI status' },
      { status: 500 }
    );
  }
}
