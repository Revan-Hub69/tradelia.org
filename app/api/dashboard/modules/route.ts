import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getModules } from '@/lib/supabase/server-services';
import { getLocaleFromRequest } from '@/lib/i18n/api-messages';
import { translateModules } from '@/lib/i18n/modules-translations';

// Moduli Pro-only (richiedono account Pro)
const PRO_ONLY_MODULES = ['voting', 'requests'];
// NOTA: widgets e watchlist rimossi - richiedono API real-time non disponibili

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
      description: 'Corsi formativi basati su framework AI verificabili e glossario',
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
      order_index: 4,
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
      order_index: 5,
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
      order_index: 6,
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
      order_index: 7,
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
      order_index: 8,
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
      title: 'Widget',
      description: 'Widget crypto installabili: whale, depth, movers e altro',
      href: '/dashboard/widgets',
      icon: 'layout',
      priority: 'secondary' as const,
      is_active: true,
      order_index: 2,
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
      order_index: 3,
      badge_count: 0,
    },
  ],
};

export async function GET(request: NextRequest) {
  try {
    // Detect locale from request
    const locale = getLocaleFromRequest(request);
    
    const supabase = await createClient();
    
    // Verifica ruolo utente (guest/user/pro/desk/admin)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    let userRole: 'guest' | 'trial' | 'pro' | 'desk' | 'admin' = 'guest';
    let isAdmin = false;
    let isPro = false;
    
    if (user) {
      // Verifica ruolo da user_roles
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, valid_until')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (roleData) {
        const role = roleData.role as 'trial' | 'pro' | 'desk' | 'admin';
        const validUntil = roleData.valid_until ? new Date(roleData.valid_until) : null;
        
        // Verifica se il ruolo è ancora valido
        if (!validUntil || validUntil > new Date()) {
          userRole = role;
          isPro = role === 'pro' || role === 'desk' || role === 'admin';
          isAdmin = role === 'admin';
        } else {
          // Ruolo scaduto, default a trial
          userRole = 'trial';
        }
      } else {
        // Nessun ruolo trovato, default a trial (utente registrato)
        userRole = 'trial';
      }
      
      // Verifica anche da profiles per admin (fallback)
      if (!isAdmin) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role === 'admin') {
          isAdmin = true;
          userRole = 'admin';
          isPro = true;
        }
      }
    }

    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority') as 'primary' | 'secondary' | null;

    try {
      const { data, error } = await getModules(priority || undefined);

      // Se ci sono dati dal database, usali
      if (!error && data && data.length > 0) {
        // Filtra moduli in base al ruolo utente
        let modules = data.filter(module => {
          // Moduli Pro-only: mostra solo se isPro
          if (PRO_ONLY_MODULES.includes(module.id)) {
            return isPro;
          }
          // Altri moduli: visibili a tutti
          return true;
        });
        
        // Aggiungi admin solo se l'utente è admin
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

      // Prepara moduli di default e filtra per ruolo
      let primaryModules = DEFAULT_MODULES.primary.filter(module => {
        if (PRO_ONLY_MODULES.includes(module.id)) {
          return isPro;
        }
        return true;
      });
      
      let secondaryModules = DEFAULT_MODULES.secondary.filter(module => {
        if (PRO_ONLY_MODULES.includes(module.id)) {
          return isPro;
        }
        return true;
      });
      
      // Traduci moduli
      primaryModules = translateModules(primaryModules, locale);
      secondaryModules = translateModules(secondaryModules, locale);
      
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
      
      // Prepara moduli di default e filtra per ruolo
      let primaryModules = DEFAULT_MODULES.primary.filter(module => {
        if (PRO_ONLY_MODULES.includes(module.id)) {
          return isPro;
        }
        return true;
      });
      
      let secondaryModules = DEFAULT_MODULES.secondary.filter(module => {
        if (PRO_ONLY_MODULES.includes(module.id)) {
          return isPro;
        }
        return true;
      });
      
      // Traduci moduli
      primaryModules = translateModules(primaryModules, locale);
      secondaryModules = translateModules(secondaryModules, locale);
      
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
    // In caso di errore, restituisci moduli di default con filtri per ruolo
    const locale = getLocaleFromRequest(request);
    const priority = new URL(request.url).searchParams.get('priority') as 'primary' | 'secondary' | null;
    
    // Verifica ruolo utente anche in caso di errore
    let isAdmin = false;
    let isPro = false;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role, valid_until')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (roleData) {
          const role = roleData.role as 'trial' | 'pro' | 'desk' | 'admin';
          const validUntil = roleData.valid_until ? new Date(roleData.valid_until) : null;
          if (!validUntil || validUntil > new Date()) {
            isPro = role === 'pro' || role === 'desk' || role === 'admin';
            isAdmin = role === 'admin';
          }
        }
        
        // Fallback per admin da profiles
        if (!isAdmin) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          if (profile?.role === 'admin') {
            isAdmin = true;
            isPro = true;
          }
        }
      }
    } catch {
      // Ignora errori di verifica ruolo
    }
    
    // Filtra e traduce moduli di default
    let primaryModules = DEFAULT_MODULES.primary.filter(module => {
      if (PRO_ONLY_MODULES.includes(module.id)) {
        return isPro;
      }
      return true;
    });
    
    let secondaryModules = DEFAULT_MODULES.secondary.filter(module => {
      if (PRO_ONLY_MODULES.includes(module.id)) {
        return isPro;
      }
      return true;
    });
    
    primaryModules = translateModules(primaryModules, locale);
    secondaryModules = translateModules(secondaryModules, locale);
    
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

