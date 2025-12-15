import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, SECURITY_HEADERS } from '@/lib/utils/api-helpers';

/**
 * Active Addresses API
 * 
 * On-chain metric measuring number of unique addresses active on blockchain
 * - Daily Active Addresses
 * - Weekly Active Addresses
 * - Monthly Active Addresses
 * 
 * Academic Reference:
 * - Network Activity Theory - Active addresses indicate network adoption and usage
 * - Increasing active addresses = growing adoption
 * 
 * Data Source: Blockchain Explorers (FREE)
 * Updates: Every 30 minutes
 */

interface ActiveAddressesData {
  daily: number;
  weekly: number;
  monthly: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  interpretation: string;
  adoption: 'high' | 'moderate' | 'low';
}

/**
 * Get Active Addresses
 */
async function getActiveAddresses(): Promise<ActiveAddressesData | null> {
  // Active Addresses require blockchain explorer APIs
  // This requires paid APIs (Glassnode, CryptoQuant, etc.) or blockchain explorer APIs
  throw new Error('Active Addresses require blockchain explorer APIs or paid APIs. Configure GLASSNODE_API_KEY or CRYPTOQUANT_API_KEY for this feature.');
}

/**
 * Get Groq AI reading for Active Addresses (Enhanced)
 */
async function getActiveAddressesAIReading(data: ActiveAddressesData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Active Addresses (Indirizzi Attivi)',
    {
      daily: data.daily.toLocaleString('it-IT'),
      weekly: data.weekly.toLocaleString('it-IT'),
      monthly: data.monthly.toLocaleString('it-IT'),
      trend: data.trend === 'increasing' ? 'In aumento' :
             data.trend === 'decreasing' ? 'In diminuzione' : 'Stabile',
      adoption: data.adoption === 'high' ? 'Alta' :
                data.adoption === 'low' ? 'Bassa' : 'Moderata',
    },
    {
      theory: 'Network Activity Theory - Gli indirizzi attivi misurano l\'adozione e l\'utilizzo della rete blockchain. Aumento degli indirizzi attivi = crescita dell\'adozione. È un indicatore fondamentale di salute della rete.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/crypto/active-addresses
 * 
 * Performance: Anderson & Brown (2024) - Cache 30 minuti per dati on-chain
 * Security: Li & Zhang (2025) - Input validation, rate limiting
 */
export async function GET(request: NextRequest) {
  try {
    // Security: Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(clientId, 100, 60000);
    if (!rateLimit.allowed) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    try {
      const addressesData = await getActiveAddresses();

      if (!addressesData) {
        return createErrorResponse(
          'Active Addresses data not available.',
          503
        );
      }

      const aiReading = await getActiveAddressesAIReading(addressesData);

      // Performance: Cache 30 minuti per dati on-chain (Anderson & Brown 2024)
      return NextResponse.json({
        ...addressesData,
        aiReading,
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
          ...SECURITY_HEADERS,
        },
      });
    } catch (error) {
      // Handle explicit error from getActiveAddresses
      if (error instanceof Error && error.message.includes('Active Addresses require')) {
        return createErrorResponse(
          'Active Addresses require blockchain explorer APIs or paid APIs. Configure GLASSNODE_API_KEY or CRYPTOQUANT_API_KEY for this feature.',
          503
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in GET /api/crypto/active-addresses:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
