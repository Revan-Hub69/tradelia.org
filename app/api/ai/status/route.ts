import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Status API
 * AI is always enabled - uses FREE Hugging Face API + RAG fallback
 * No API keys required - 100% free solution
 */
export async function GET(request: NextRequest) {
  try {
    // AI is always available (free Hugging Face + RAG)
    return NextResponse.json({
      enabled: true,
      model: 'huggingface-llama2-7b (free) + RAG fallback',
      free: true,
    });
  } catch (error) {
    return NextResponse.json(
      { enabled: true, free: true, error: 'Error checking AI status' },
      { status: 500 }
    );
  }
}
