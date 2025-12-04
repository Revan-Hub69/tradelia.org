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
      description: 'Calcolatori finanziari e PAC simulator per analisi e pianificazione',
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
      description: 'Widget personalizzabili per watchlist, portfolio e alert (Coming Soon)',
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
      description: 'Monitora i tuoi asset preferiti con alert personalizzati (Coming Soon)',
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
    
    // Verifica se l'utente è admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      isAdmin = profile?.role === 'admin';
    }

    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority') as 'primary' | 'secondary' | null;

    try {
      const { data, error } = await getModules(priority || undefined);

      // Se ci sono dati dal database, usali
      if (!error && data && data.length > 0) {
        // Aggiungi admin solo se l'utente è admin
        let modules = data;
        if (isAdmin && !modules.find(m => m.id === 'admin')) {
          const adminModule = {
            id: 'admin',
            title: 'Admin',
            description: 'Area amministrazione e gestione Supabase',
            href: '/dashboard/admin',
            icon: 'shield',
            priority: 'secondary' as const,
            is_active: true,
            order_index: 0, // Prima di tutti
            badge_count: 0,
          };
          modules = [adminModule, ...modules];
        }
        return NextResponse.json({ data: modules });
      }

      // Se non ci sono dati o c'è un errore (es. tabella non esiste), usa moduli di default
      if (error) {
        console.warn('Error getting modules (table might not exist), using defaults:', error.message);
      }

      // Prepara moduli di default
      let primaryModules = [...DEFAULT_MODULES.primary];
      let secondaryModules = [...DEFAULT_MODULES.secondary];
      
      // Aggiungi admin solo se l'utente è admin
      if (isAdmin) {
        secondaryModules.unshift({
          id: 'admin',
          title: 'Admin',
          description: 'Area amministrazione e gestione Supabase',
          href: '/dashboard/admin',
          icon: 'shield',
          priority: 'secondary' as const,
          is_active: true,
          order_index: 0,
          badge_count: 0,
        });
      }

      // Restituisci moduli di default basati sulla priorità
      if (priority === 'primary') {
        return NextResponse.json({ data: primaryModules });
      } else if (priority === 'secondary') {
        return NextResponse.json({ data: secondaryModules });
      } else {
        // Se non c'è priorità, restituisci tutti i moduli
        return NextResponse.json({ 
          data: [...primaryModules, ...secondaryModules] 
        });
      }
    } catch (dbError) {
      // Se c'è un errore del database (tabella mancante), usa moduli di default
      console.warn('Database error in modules GET (table might not exist), using defaults:', dbError);
      
      // Prepara moduli di default
      let primaryModules = [...DEFAULT_MODULES.primary];
      let secondaryModules = [...DEFAULT_MODULES.secondary];
      
      // Aggiungi admin solo se l'utente è admin
      if (isAdmin) {
        secondaryModules.unshift({
          id: 'admin',
          title: 'Admin',
          description: 'Area amministrazione e gestione Supabase',
          href: '/dashboard/admin',
          icon: 'shield',
          priority: 'secondary' as const,
          is_active: true,
          order_index: 0,
          badge_count: 0,
        });
      }
      
      if (priority === 'primary') {
        return NextResponse.json({ data: primaryModules });
      } else if (priority === 'secondary') {
        return NextResponse.json({ data: secondaryModules });
      } else {
        return NextResponse.json({ 
          data: [...primaryModules, ...secondaryModules] 
        });
      }
    }
  } catch (error) {
    console.error('Error in modules API:', error);
    // In caso di errore, restituisci moduli di default
    const priority = new URL(request.url).searchParams.get('priority') as 'primary' | 'secondary' | null;
    
    // Verifica se l'utente è admin anche in caso di errore
    let isAdmin = false;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        isAdmin = profile?.role === 'admin';
      }
    } catch {
      // Ignora errori di verifica admin
    }
    
    let primaryModules = [...DEFAULT_MODULES.primary];
    let secondaryModules = [...DEFAULT_MODULES.secondary];
    
    if (isAdmin) {
      secondaryModules.unshift({
        id: 'admin',
        title: 'Admin',
        description: 'Area amministrazione e gestione Supabase',
        href: '/dashboard/admin',
        icon: 'shield',
        priority: 'secondary' as const,
        is_active: true,
        order_index: 0,
        badge_count: 0,
      });
    }
    
    if (priority === 'primary') {
      return NextResponse.json({ data: primaryModules });
    } else if (priority === 'secondary') {
      return NextResponse.json({ data: secondaryModules });
    } else {
      return NextResponse.json({ 
        data: [...primaryModules, ...secondaryModules] 
      });
    }
  }
}

