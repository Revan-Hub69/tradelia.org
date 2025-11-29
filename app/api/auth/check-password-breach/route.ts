import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Verifica se una password è stata compromessa in data breach
 * 
 * ✅ GRATUITO: Usa Have I Been Pwned Password API (k-anonymity)
 * - Completamente gratuito, nessuna API key richiesta
 * - Privacy: usa k-anonymity (solo primi 5 caratteri dell'hash SHA-1)
 * - Non espone la password completa
 * 
 * Riferimenti:
 * - https://haveibeenpwned.com/API/v3#PwnedPasswords
 * - https://www.troyhunt.com/ive-just-launched-pwned-passwords-version-2/
 */
export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password richiesta' },
        { status: 400 }
      );
    }

    // Calcola SHA-1 hash della password
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.substring(0, 5); // Primi 5 caratteri (k-anonymity)
    const suffix = hash.substring(5); // Resto dell'hash

    // Chiama Have I Been Pwned Password API (GRATUITA, k-anonymity)
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          'User-Agent': 'Tradelia-Security-Check/1.0',
        },
      }
    );

    if (!response.ok) {
      // In caso di errore, non blocchiamo (restituisci "non compromessa")
      return NextResponse.json({
        pwned: false,
        count: 0,
        note: 'Servizio temporaneamente non disponibile',
      });
    }

    // Leggi la lista di hash che iniziano con questo prefisso
    const text = await response.text();
    const hashes = text.split('\n');

    // Cerca se il nostro hash completo è nella lista
    for (const line of hashes) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix) {
        return NextResponse.json({
          pwned: true,
          count: parseInt(count, 10) || 0,
          message: `Questa password è stata trovata in ${count} data breach. Usa una password più sicura.`,
        });
      }
    }

    // Password non trovata = sicura
    return NextResponse.json({
      pwned: false,
      count: 0,
    });
  } catch (error) {
    console.error('Errore verifica password breach:', error);
    // In caso di errore, non blocchiamo la registrazione
    return NextResponse.json(
      { 
        pwned: false, 
        count: 0,
        note: 'Servizio temporaneamente non disponibile' 
      },
      { status: 503 }
    );
  }
}

