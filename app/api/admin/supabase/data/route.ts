import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isAdminEmail } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/supabase/data?table=table_name&limit=100&offset=0
 * Ottiene i dati di una tabella specifica
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const admin = await isAdminEmail(user.email);
    if (!admin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const orderBy = searchParams.get('orderBy') || 'created_at';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    if (!tableName) {
      return NextResponse.json({ error: 'Nome tabella richiesto' }, { status: 400 });
    }

    // Validazione nome tabella (prevenzione SQL injection)
    if (!/^[a-z_][a-z0-9_]*$/.test(tableName)) {
      return NextResponse.json({ error: 'Nome tabella non valido' }, { status: 400 });
    }

    // Ottieni dati
    let query = supabaseAdmin.from(tableName).select('*', { count: 'exact' });

    // Order by
    if (orderBy) {
      query = query.order(orderBy, { ascending: order === 'asc' });
    }

    // Limit e offset
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching data:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data || [],
      count: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/supabase/data:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/supabase/data?table=table_name&id=record_id
 * Cancella un record specifico
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const admin = await isAdminEmail(user.email);
    if (!admin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');
    const id = searchParams.get('id');

    if (!tableName || !id) {
      return NextResponse.json({ error: 'Nome tabella e ID richiesti' }, { status: 400 });
    }

    // Validazione
    if (!/^[a-z_][a-z0-9_]*$/.test(tableName)) {
      return NextResponse.json({ error: 'Nome tabella non valido' }, { status: 400 });
    }

    // Prova prima con 'id' (campo più comune)
    let { error } = await supabaseAdmin.from(tableName).delete().eq('id', id);

    if (error) {
      // Se fallisce, prova con altre colonne comuni come chiave primaria
      const altColumns = ['user_id', 'report_id', 'course_id', 'module_id', 'notification_id'];
      let deleted = false;

      for (const col of altColumns) {
        const { error: altError } = await supabaseAdmin.from(tableName).delete().eq(col, id);
        if (!altError) {
          deleted = true;
          break;
        }
      }

      if (!deleted) {
        // Se ancora fallisce, prova a usare il primo campo del record come chiave
        // Questo è un fallback per tabelle con strutture non standard
        return NextResponse.json({ 
          error: `Impossibile eliminare. Errore: ${error.message}. Prova a specificare la colonna ID corretta.` 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Record eliminato con successo' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/supabase/data:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/supabase/data
 * Aggiunge un nuovo record
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const admin = await isAdminEmail(user.email);
    if (!admin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const body = await request.json();
    const { table, data } = body;

    if (!table || !data) {
      return NextResponse.json({ error: 'Tabella e dati richiesti' }, { status: 400 });
    }

    // Validazione
    if (!/^[a-z_][a-z0-9_]*$/.test(table)) {
      return NextResponse.json({ error: 'Nome tabella non valido' }, { status: 400 });
    }

    const { data: inserted, error } = await supabaseAdmin.from(table).insert(data).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: inserted });
  } catch (error) {
    console.error('Error in POST /api/admin/supabase/data:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/supabase/data
 * Modifica un record esistente
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const admin = await isAdminEmail(user.email);
    if (!admin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const body = await request.json();
    const { table, id, data } = body;

    if (!table || !id || !data) {
      return NextResponse.json({ error: 'Tabella, ID e dati richiesti' }, { status: 400 });
    }

    // Validazione
    if (!/^[a-z_][a-z0-9_]*$/.test(table)) {
      return NextResponse.json({ error: 'Nome tabella non valido' }, { status: 400 });
    }

    // Prova prima con 'id'
    let { data: updated, error } = await supabaseAdmin.from(table).update(data).eq('id', id).select().single();

    if (error) {
      // Se fallisce, prova con altre colonne comuni
      const altColumns = ['user_id', 'report_id', 'course_id', 'module_id'];
      let updatedRecord = false;

      for (const col of altColumns) {
        const { data: altData, error: altError } = await supabaseAdmin.from(table).update(data).eq(col, id).select().single();
        if (!altError && altData) {
          updated = altData;
          updatedRecord = true;
          break;
        }
      }

      if (!updatedRecord) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in PATCH /api/admin/supabase/data:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

