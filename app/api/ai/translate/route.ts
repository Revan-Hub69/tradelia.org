import { NextResponse } from 'next/server';

interface TranslateRequest {
  text: string;
  targetLocale: string;
  sourceLocale?: string;
}

export async function POST(request: Request) {
  try {
    const body: TranslateRequest = await request.json();
    const { text, targetLocale, sourceLocale } = body;

    if (!text || !targetLocale) {
      return NextResponse.json(
        { success: false, error: 'Text and targetLocale are required' },
        { status: 400 }
      );
    }

    // Detect if text is already in target locale (simple heuristic)
    if (targetLocale === 'it' && /^[a-zA-Z\s.,!?;:'"()\[\]{}\-]+$/.test(text) && !text.match(/[àèéìíîòóùú]/)) {
      // Likely English, needs translation
    } else if (targetLocale === 'en' && text.match(/[àèéìíîòóùú]/)) {
      // Likely Italian, needs translation
    } else {
      // Might already be in target locale, return as-is
      return NextResponse.json({
        success: true,
        translated: text,
        confidence: 0.8,
      });
    }

    // Use AI translation (OpenAI or similar)
    // For now, use a simple approach with OpenAI API if available
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      // Fallback: return text as-is with note
      return NextResponse.json({
        success: true,
        translated: text,
        confidence: 0.5,
        note: 'OPENAI_API_KEY not configured - returning original text',
      });
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Cheaper model for translation
          messages: [
            {
              role: 'system',
              content: `You are a professional financial translator. Translate financial and market-related content accurately, preserving technical terms and maintaining the original meaning. Target locale: ${targetLocale === 'it' ? 'Italian' : 'English'}.`,
            },
            {
              role: 'user',
              content: `Translate the following text to ${targetLocale === 'it' ? 'Italian' : 'English'}. Preserve financial terms, numbers, and technical jargon. Only return the translation, no explanations:\n\n${text}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const translated = data.choices?.[0]?.message?.content?.trim() || text;

      return NextResponse.json({
        success: true,
        translated,
        confidence: 0.9,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800', // 1 day cache
        },
      });
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      // Fallback: return original text
      return NextResponse.json({
        success: true,
        translated: text,
        confidence: 0.5,
        note: 'Translation API error - returning original text',
      });
    }
  } catch (error) {
    console.error('Error in translate route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to translate' },
      { status: 500 }
    );
  }
}
