import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getUserFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
} from '@/lib/supabase/server-services';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { data, error } = await getUserFavorites(user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Errore nel caricamento dei preferiti' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in favorites GET API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { item_id, item_type, title, description, href, icon } = body;

    if (!item_id || !item_type || !title || !href) {
      return NextResponse.json(
        { error: 'Campi mancanti' },
        { status: 400 }
      );
    }

    const { data, error } = await addFavorite(user.id, {
      item_id,
      item_type,
      title,
      description: description || null,
      href,
      icon: icon || null,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Errore nell\'aggiunta del preferito' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in favorites POST API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const favoriteId = searchParams.get('id');

    if (!favoriteId) {
      return NextResponse.json(
        { error: 'ID preferito mancante' },
        { status: 400 }
      );
    }

    const { data, error } = await removeFavorite(user.id, favoriteId);

    if (error) {
      return NextResponse.json(
        { error: 'Errore nella rimozione del preferito' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in favorites DELETE API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

