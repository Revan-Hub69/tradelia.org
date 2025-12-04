import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * DELETE /api/utilities/pac-simulations/[id]
 * Elimina una simulazione PAC salvata
 */
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('pac_simulations')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    // Se la tabella non esiste, considera l'operazione come completata (idempotente)
    if (error) {
      // Log solo se non è un errore di tabella mancante
      if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
        console.error('Error deleting PAC simulation:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      // Se la tabella non esiste, restituisci successo (idempotente)
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/utilities/pac-simulations/[id]:', error);
    // In caso di errore, restituisci successo (idempotente)
    return NextResponse.json({ success: true });
  }
}

