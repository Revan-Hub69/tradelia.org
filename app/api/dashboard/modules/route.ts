import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getModules } from '@/lib/supabase/server-services';
import { getLocaleFromRequest } from '@/lib/i18n/api-messages';
import { translateModules } from '@/lib/i18n/modules-translations';

// Moduli di default da mostrare quando il database non ha dati
const DEFAULT_MODULES = {
  primary: [
    {
      id: 'analysis',
      title: 'Analisi',
      description: 'Report ufficiali verificabili e analisi conformi MiFID II',
      href: '/dashboard/analysis',
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
      id: 'utilities',
      title: 'Utilities',
      description: 'Strumenti finanziari professionali: calcolatori, simulatori e analisi avanzate',
      href: '/dashboard/utilities',
      icon: 'calculator',
      priority: 'primary' as const,
      is_active: true,
      order_index: 3,
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
      order_index: 4,
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
      order_index: 5,
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
      order_index: 6,
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
      order_index: 7,
      badge_count: 0,
    },
  ],
  secondary: [
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
    // Detect locale from request
    const locale = getLocaleFromRequest(request);
    
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
          const adminTranslation = translateModules([{
            id: 'admin',
            title: '',
            description: '',
            href: '/dashboard/admin',
            icon: 'shield',
            priority: 'secondary' as const,
            is_active: true,
            order_index: 0,
            badge_count: 0,
          }], locale)[0];
          
          const adminModule = {
            id: 'admin',
            title: adminTranslation.title,
            description: adminTranslation.description,
            href: '/dashboard/admin',
            icon: 'shield',
            priority: 'secondary' as const,
            is_active: true,
            order_index: 0, // Prima di tutti
            badge_count: 0,
          };
          modules = [adminModule, ...modules];
        }
        // Translate modules
        const translatedModules = translateModules(modules, locale);
        return NextResponse.json({ data: translatedModules });
      }

      // Se non ci sono dati o c'è un errore (es. tabella non esiste), usa moduli di default
      if (error) {
        console.warn('Error getting modules (table might not exist), using defaults:', error.message);
      }

      // Prepara moduli di default e traduci
      let primaryModules = translateModules([...DEFAULT_MODULES.primary], locale);
      let secondaryModules = translateModules([...DEFAULT_MODULES.secondary], locale);
      
      // Aggiungi admin solo se l'utente è admin
      if (isAdmin) {
        const adminTranslation = translateModules([{
          id: 'admin',
          title: '',
          description: '',
          href: '/dashboard/admin',
          icon: 'shield',
          priority: 'secondary' as const,
          is_active: true,
          order_index: 0,
          badge_count: 0,
        }], locale)[0];
        
        secondaryModules.unshift({
          id: 'admin',
          title: adminTranslation.title,
          description: adminTranslation.description,
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
      
      // Prepara moduli di default e traduci
      let primaryModules = translateModules([...DEFAULT_MODULES.primary], locale);
      let secondaryModules = translateModules([...DEFAULT_MODULES.secondary], locale);
      
      // Aggiungi admin solo se l'utente è admin
      if (isAdmin) {
        const adminTranslation = translateModules([{
          id: 'admin',
          title: '',
          description: '',
          href: '/dashboard/admin',
          icon: 'shield',
          priority: 'secondary' as const,
          is_active: true,
          order_index: 0,
          badge_count: 0,
        }], locale)[0];
        
        secondaryModules.unshift({
          id: 'admin',
          title: adminTranslation.title,
          description: adminTranslation.description,
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
    // Detect locale anche in caso di errore
    const locale = getLocaleFromRequest(request);
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
    
    // Translate default modules
    let primaryModules = translateModules([...DEFAULT_MODULES.primary], locale);
    let secondaryModules = translateModules([...DEFAULT_MODULES.secondary], locale);
    
    if (isAdmin) {
      const adminTranslation = translateModules([{
        id: 'admin',
        title: '',
        description: '',
        href: '/dashboard/admin',
        icon: 'shield',
        priority: 'secondary' as const,
        is_active: true,
        order_index: 0,
        badge_count: 0,
      }], locale)[0];
      
      secondaryModules.unshift({
        id: 'admin',
        title: adminTranslation.title,
        description: adminTranslation.description,
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

