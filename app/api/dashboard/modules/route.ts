import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getModules } from '@/lib/supabase/server-services';

// Moduli di default da mostrare quando il database non ha dati
const DEFAULT_MODULES = {
  primary: [
    {
      id: 'reports',
      title: 'Report',
      description: 'Report ufficiali verificabili e analisi conformi MiFID II',
      href: '/dashboard/reports',
      icon: 'file-text',
      priority: 'primary' as const,
      is_active: true,
      order_index: 1,
      badge_count: 0,
    },
    {
      id: 'education',
      title: 'Formazione',
      description: 'Corsi formativi basati su framework AI verificabili',
      href: '/dashboard/education',
      icon: 'book-open',
      priority: 'primary' as const,
      is_active: true,
      order_index: 2,
      badge_count: 0,
    },
    {
      id: 'requests',
      title: 'Richieste',
      description: 'Gestisci le tue richieste di analisi',
      href: '/dashboard/requests',
      icon: 'send',
      priority: 'primary' as const,
      is_active: true,
      order_index: 3,
      badge_count: 0,
    },
    {
      id: 'voting',
      title: 'Votazioni',
      description: 'Partecipa alle votazioni per nuovi asset',
      href: '/dashboard/voting',
      icon: 'vote',
      priority: 'primary' as const,
      is_active: true,
      order_index: 4,
      badge_count: 0,
    },
    {
      id: 'settings',
      title: 'Impostazioni',
      description: 'Gestisci profilo, notifiche e preferenze',
      href: '/dashboard/settings',
      icon: 'settings',
      priority: 'primary' as const,
      is_active: true,
      order_index: 5,
      badge_count: 0,
    },
    {
      id: 'favorites',
      title: 'Preferiti',
      description: 'I tuoi contenuti salvati per accesso rapido',
      href: '/dashboard/favorites',
      icon: 'star',
      priority: 'primary' as const,
      is_active: true,
      order_index: 6,
      badge_count: 0,
    },
  ],
  secondary: [
    {
      id: 'utilities',
      title: 'Utilities',
      description: 'Calcolatori finanziari, PAC simulator e expense tracker',
      href: '/dashboard/utilities',
      icon: 'calculator',
      priority: 'secondary' as const,
      is_active: true,
      order_index: 1,
      badge_count: 0,
    },
    {
      id: 'widgets',
      title: 'Widgets',
      description: 'Widget personalizzabili per watchlist, portfolio e alert',
      href: '/dashboard/widgets',
      icon: 'layout',
      priority: 'secondary' as const,
      is_active: true,
      order_index: 2,
      badge_count: 0,
    },
    {
      id: 'watchlist',
      title: 'Watchlist',
      description: 'Monitora i tuoi asset preferiti con alert personalizzati',
      href: '/dashboard/watchlist',
      icon: 'eye',
      priority: 'secondary' as const,
      is_active: true,
      order_index: 3,
      badge_count: 0,
    },
    {
      id: 'billing',
      title: 'Billing',
      description: 'Gestisci crediti, pagamenti e fatture',
      href: '/dashboard/billing',
      icon: 'credit-card',
      priority: 'secondary' as const,
      is_active: true,
      order_index: 4,
      badge_count: 0,
    },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Modules are public (visible to all, including guests)
    // Non richiediamo autenticazione per i moduli

    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority') as 'primary' | 'secondary' | null;

    try {
      const { data, error } = await getModules(priority || undefined);

      // Se ci sono dati dal database, usali
      if (!error && data && data.length > 0) {
        return NextResponse.json({ data });
      }

      // Se non ci sono dati o c'è un errore (es. tabella non esiste), usa moduli di default
      if (error) {
        console.warn('Error getting modules (table might not exist), using defaults:', error.message);
      }

      // Restituisci moduli di default basati sulla priorità
      if (priority === 'primary') {
        return NextResponse.json({ data: DEFAULT_MODULES.primary });
      } else if (priority === 'secondary') {
        return NextResponse.json({ data: DEFAULT_MODULES.secondary });
      } else {
        // Se non c'è priorità, restituisci tutti i moduli
        return NextResponse.json({ 
          data: [...DEFAULT_MODULES.primary, ...DEFAULT_MODULES.secondary] 
        });
      }
    } catch (dbError) {
      // Se c'è un errore del database (tabella mancante), usa moduli di default
      console.warn('Database error in modules GET (table might not exist), using defaults:', dbError);
      
      if (priority === 'primary') {
        return NextResponse.json({ data: DEFAULT_MODULES.primary });
      } else if (priority === 'secondary') {
        return NextResponse.json({ data: DEFAULT_MODULES.secondary });
      } else {
        return NextResponse.json({ 
          data: [...DEFAULT_MODULES.primary, ...DEFAULT_MODULES.secondary] 
        });
      }
    }
  } catch (error) {
    console.error('Error in modules API:', error);
    // In caso di errore, restituisci moduli di default
    const priority = new URL(request.url).searchParams.get('priority') as 'primary' | 'secondary' | null;
    if (priority === 'primary') {
      return NextResponse.json({ data: DEFAULT_MODULES.primary });
    } else if (priority === 'secondary') {
      return NextResponse.json({ data: DEFAULT_MODULES.secondary });
    } else {
      return NextResponse.json({ 
        data: [...DEFAULT_MODULES.primary, ...DEFAULT_MODULES.secondary] 
      });
    }
  }
}

