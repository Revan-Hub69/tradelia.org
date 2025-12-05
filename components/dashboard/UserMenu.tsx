'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Settings, LogOut, Bell, ChevronDown, Mail } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { supabase } from '@/lib/supabase/client';
import { useSafeRouter } from '@/lib/hooks/useSafeRouter';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import Link from 'next/link';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: number;
  onClick?: () => void;
  danger?: boolean;
}

export function UserMenu() {
  const { t } = useTranslations();
  const router = useSafeRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const isPro = useIsPro();

  // Blocca scroll quando menu è aperto
  useBodyScrollLock(isOpen);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Prova prima con getSession (più veloce)
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            email: session.user.email || undefined,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          });
          return;
        }
        
        // Se non c'è sessione, prova con getUser (più lento ma più affidabile)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser({
            email: user.email || undefined,
            name: user.user_metadata?.full_name || user.email?.split('@')[0],
          });
        } else {
          // Se non c'è utente, imposta null
          setUser(null);
        }
      } catch (error) {
        // In caso di errore, imposta null e logga
        console.error('Error fetching user in UserMenu:', error);
        setUser(null);
      }
    };

    // IMPORTANTE: Esegui fetchUser SOLO sul client e dopo l'hydration
    // Questo evita hydration mismatch
    if (typeof window === 'undefined') {
      return;
    }

    // Usa setTimeout per assicurarsi che l'hydration sia completata
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        fetchUser();
      });
    }, 100);

    // Ascolta cambiamenti auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        fetchUser();
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/list?limit=1&unreadOnly=true', {
          credentials: 'include',
        });
        
        // Se 401, l'utente non è autenticato - gestisci silenziosamente
        if (response.status === 401) {
          setUnreadCount(0);
          return;
        }
        
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unreadCount || 0);
        } else {
          // Per altri errori, imposta 0 silenziosamente
          setUnreadCount(0);
        }
      } catch (error) {
        // Gestisci errori silenziosamente - non loggare 401 come errore
        if (error instanceof Error && !error.message.includes('401')) {
          console.error('Error fetching unread count:', error);
        }
        setUnreadCount(0);
      }
    };

    // Aspetta che il componente sia montato prima di fare la richiesta
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        fetchUnreadCount();
      });
    }
  }, []);

  // Click outside per chiudere
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      label: t('dashboard.userMenu.profile') || 'Profilo',
      icon: User,
      href: '/dashboard',
    },
    {
      id: 'notifications',
      label: t('dashboard.userMenu.notifications') || 'Notifiche',
      icon: Bell,
      href: '/dashboard/notifications',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'settings',
      label: t('dashboard.userMenu.settings') || 'Impostazioni',
      icon: Settings,
      href: '/dashboard/settings',
    },
  ];

  // Admin area rimossa - non più disponibile

  menuItems.push({
    id: 'logout',
    label: t('dashboard.userMenu.logout') || 'Esci',
    icon: LogOut,
    href: '#',
    onClick: handleLogout,
    danger: true,
  });

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
      >
        {t('dashboard.userMenu.login') || 'Accedi'}
      </Link>
    );
  }

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user.email?.[0].toUpperCase() || 'U';

  return (
    <div ref={menuRef} className="relative z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-soft border border-border-subtle hover:border-accent/40 transition-all duration-200 group"
        aria-label={t('dashboard.userMenu.open') || 'Menu utente'}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white text-xs font-semibold">
          {initials}
        </div>
        <span className="hidden md:inline text-sm text-text-primary font-medium max-w-[120px] truncate">
          {user.name || user.email}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-text-tertiary transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] bg-bg-surface border border-border-subtle rounded-xl shadow-2xl overflow-hidden z-[100]"
            role="menu"
            aria-orientation="vertical"
          >
            {/* User Info */}
            <div className="p-4 border-b border-border-subtle bg-bg-soft/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white text-sm font-semibold">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary text-sm truncate">
                    {user.name || 'Utente'}
                  </p>
                  <p className="text-xs text-text-tertiary truncate">{user.email}</p>
                  {isPro && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-xs text-amber-300 font-medium">
                      Pro
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm',
                      item.danger
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-soft'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 bg-accent text-white rounded-full text-xs font-semibold min-w-[20px] text-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                );

                if (item.onClick) {
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className="w-full text-left"
                      role="menuitem"
                    >
                      {content}
                    </button>
                  );
                }

                if (!item.href || item.href === '#') {
                  return (
                    <div key={item.id} className="block" role="menuitem">
                      {content}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block"
                    role="menuitem"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

