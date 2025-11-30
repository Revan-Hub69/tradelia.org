import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API per gestire singolo evento
 * PUT /api/oslo/events/:id
 * DELETE /api/oslo/events/:id
 */

interface UpdateEventPayload {
  title?: string;
  description?: string;
  event_type?: 'raid' | 'war' | 'donation' | 'meeting' | 'general' | 'other';
  start_time?: string;
  end_time?: string;
  is_recurring?: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | null;
  recurrence_end_date?: string;
}

// PUT: Aggiorna evento
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const eventId = params.id;
    const body: UpdateEventPayload = await request.json();

    // Recupera evento per verificare permessi
    const { data: event, error: eventError } = await supabase
      .from('alliance_events')
      .select('alliance_id')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Evento non trovato' }, { status: 404 });
    }

    // Verifica permessi
    const { data: member, error: memberError } = await supabase
      .from('alliance_members')
      .select('role')
      .eq('alliance_id', event.alliance_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Non sei membro di questa alleanza' }, { status: 403 });
    }

    if (member.role !== 'admin' && member.role !== 'officer') {
      return NextResponse.json(
        { error: 'Solo admin e officer possono modificare eventi' },
        { status: 403 }
      );
    }

    // Aggiorna evento
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.event_type !== undefined) updateData.event_type = body.event_type;
    if (body.start_time !== undefined) updateData.start_time = body.start_time;
    if (body.end_time !== undefined) updateData.end_time = body.end_time;
    if (body.is_recurring !== undefined) updateData.is_recurring = body.is_recurring;
    if (body.recurrence_pattern !== undefined) updateData.recurrence_pattern = body.recurrence_pattern;
    if (body.recurrence_end_date !== undefined) updateData.recurrence_end_date = body.recurrence_end_date;

    const { data: updatedEvent, error } = await supabase
      .from('alliance_events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Errore aggiornamento evento:', error);
      return NextResponse.json({ error: 'Errore aggiornamento evento' }, { status: 500 });
    }

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error('Errore PUT events:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

// DELETE: Elimina evento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const eventId = params.id;

    // Recupera evento per verificare permessi
    const { data: event, error: eventError } = await supabase
      .from('alliance_events')
      .select('alliance_id')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Evento non trovato' }, { status: 404 });
    }

    // Verifica permessi
    const { data: member, error: memberError } = await supabase
      .from('alliance_members')
      .select('role')
      .eq('alliance_id', event.alliance_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Non sei membro di questa alleanza' }, { status: 403 });
    }

    if (member.role !== 'admin' && member.role !== 'officer') {
      return NextResponse.json(
        { error: 'Solo admin e officer possono eliminare eventi' },
        { status: 403 }
      );
    }

    // Elimina evento
    const { error } = await supabase
      .from('alliance_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Errore eliminazione evento:', error);
      return NextResponse.json({ error: 'Errore eliminazione evento' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore DELETE events:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

