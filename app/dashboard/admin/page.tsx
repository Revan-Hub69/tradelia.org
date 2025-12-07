'use client';

import { useState, useEffect } from 'react';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { Users, BarChart3, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string;
}


interface Stats {
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  reports: number;
  watchlist: number;
  notifications: number;
  completedCourses: number;
}

export default function AdminPage() {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<'users' | 'stats'>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userPage, setUserPage] = useState(1);

  // Carica statistiche
  useEffect(() => {
    if (activeTab === 'stats') {
      loadStats();
    }
  }, [activeTab]);

  // Carica utenti
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, userPage, searchTerm]);


  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Errore nel caricamento statistiche');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: userPage.toString(),
        limit: '20',
      });
      if (searchTerm) params.append('search', searchTerm);
      
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Errore nel caricamento utenti');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            Admin Panel
          </h1>
          <p className="text-text-secondary">
            Gestione utenti, tabelle e statistiche Supabase
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}


        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-border-subtle">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'stats'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Statistiche
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Utenti
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-accent" />
          </div>
        )}

        {!loading && activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
              <h3 className="text-sm text-text-secondary mb-2">Utenti Totali</h3>
              <p className="text-3xl font-bold text-text-primary">{stats.users.total}</p>
              <div className="mt-4 space-y-1">
                {Object.entries(stats.users.byRole).map(([role, count]) => (
                  <div key={role} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{role}:</span>
                    <span className="text-text-primary font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
              <h3 className="text-sm text-text-secondary mb-2">Report</h3>
              <p className="text-3xl font-bold text-text-primary">{stats.reports}</p>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
              <h3 className="text-sm text-text-secondary mb-2">Watchlist</h3>
              <p className="text-3xl font-bold text-text-primary">{stats.watchlist}</p>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
              <h3 className="text-sm text-text-secondary mb-2">Notifiche</h3>
              <p className="text-3xl font-bold text-text-primary">{stats.notifications}</p>
            </div>
          </div>
        )}

        {!loading && activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Cerca utenti..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary"
                />
              </div>
              <button
                onClick={loadUsers}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-bg-soft border-b border-border-subtle">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Ruolo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Creato</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border-subtle hover:bg-bg-soft">
                      <td className="px-4 py-3 text-sm text-text-primary">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{user.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {new Date(user.created_at).toLocaleDateString('it-IT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setUserPage(Math.max(1, userPage - 1))}
                disabled={userPage === 1}
                className="px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg disabled:opacity-50"
              >
                Precedente
              </button>
              <span className="text-text-secondary">Pagina {userPage}</span>
              <button
                onClick={() => setUserPage(userPage + 1)}
                disabled={users.length < 20}
                className="px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg disabled:opacity-50"
              >
                Successivo
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
