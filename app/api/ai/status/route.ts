import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Status API
 * AI is always enabled - uses intelligent RAG running on Vercel
 * 100% free, no external API calls, no costs
 * Runs entirely on Vercel serverless functions
 */
export async function GET(request: NextRequest) {
  try {
    // AI is always available (intelligent RAG on Vercel)
    return NextResponse.json({
      enabled: true,
      model: 'tradelia-rag-intelligent',
      free: true,
      hosted: 'vercel',
      description: 'Intelligent RAG system running on Vercel serverless functions. No external API calls, 100% free.',
    });
  } catch (error) {
    return NextResponse.json(
      { enabled: true, free: true, hosted: 'vercel', error: 'Error checking AI status' },
      { status: 500 }
    );
  }
}
