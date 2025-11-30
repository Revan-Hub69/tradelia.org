import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * API per gestire eventi alleanza
 * GET /api/oslo/events?alliance_id=xxx
 * POST /api/oslo/events
 * PUT /api/oslo/events/:id
 * DELETE /api/oslo/events/:id
 */

interface CreateEventPayload {
  alliance_id: string;
  title: string;
  description?: string;
  event_type?: 'raid' | 'war' | 'donation' | 'meeting' | 'general' | 'other';
  start_time: string; // ISO string
  end_time?: string; // ISO string
  is_recurring?: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | null;
  recurrence_end_date?: string; // ISO string
}

// GET: Lista eventi
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const allianceId = searchParams.get('alliance_id');

    if (!allianceId) {
      return NextResponse.json({ error: 'alliance_id richiesto' }, { status: 400 });
    }

    // Verifica che l'utente sia membro dell'alleanza
    const { data: member, error: memberError } = await supabase
      .from('alliance_members')
      .select('role')
      .eq('alliance_id', allianceId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Non sei membro di questa alleanza' }, { status: 403 });
    }

    // Recupera eventi
    const { data: events, error } = await supabase
      .from('alliance_events')
      .select('*')
      .eq('alliance_id', allianceId)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Errore recupero eventi:', error);
      return NextResponse.json({ error: 'Errore recupero eventi' }, { status: 500 });
    }

    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error('Errore GET events:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

// POST: Crea nuovo evento
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const body: CreateEventPayload = await request.json();

    // Validazione
    if (!body.alliance_id || !body.title || !body.start_time) {
      return NextResponse.json(
        { error: 'alliance_id, title e start_time sono richiesti' },
        { status: 400 }
      );
    }

    // Verifica che l'utente sia admin o officer
    const { data: member, error: memberError } = await supabase
      .from('alliance_members')
      .select('role')
      .eq('alliance_id', body.alliance_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Non sei membro di questa alleanza' }, { status: 403 });
    }

    if (member.role !== 'admin' && member.role !== 'officer') {
      return NextResponse.json(
        { error: 'Solo admin e officer possono creare eventi' },
        { status: 403 }
      );
    }

    // Crea evento
    const { data: event, error } = await supabase
      .from('alliance_events')
      .insert({
        alliance_id: body.alliance_id,
        title: body.title,
        description: body.description || null,
        event_type: body.event_type || 'general',
        start_time: body.start_time,
        end_time: body.end_time || null,
        is_recurring: body.is_recurring || false,
        recurrence_pattern: body.recurrence_pattern || null,
        recurrence_end_date: body.recurrence_end_date || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Errore creazione evento:', error);
      return NextResponse.json({ error: 'Errore creazione evento' }, { status: 500 });
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Errore POST events:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

