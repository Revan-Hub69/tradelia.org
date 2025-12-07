'use client';

import { useState, useEffect } from 'react';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { Users, Database, BarChart3, Search, Plus, Edit, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string;
}

interface TableData {
  table: string;
  data: any[];
  total: number;
  page: number;
  limit: number;
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
  const [activeTab, setActiveTab] = useState<'users' | 'tables' | 'stats'>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [tablePage, setTablePage] = useState(1);
  const [adminEmails, setAdminEmails] = useState<any[]>([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [creatingAdmins, setCreatingAdmins] = useState(false);

  // Carica email admin
  useEffect(() => {
    loadAdminEmails();
  }, []);

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

  // Carica tabelle
  useEffect(() => {
    if (activeTab === 'tables') {
      loadTables();
    }
  }, [activeTab]);

  // Carica dati tabella
  useEffect(() => {
    if (activeTab === 'tables' && selectedTable) {
      loadTableData();
    }
  }, [activeTab, selectedTable, tablePage]);

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

  const loadTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/tables');
      if (!res.ok) throw new Error('Errore nel caricamento tabelle');
      const data = await res.json();
      setTables(data.tables || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async () => {
    if (!selectedTable) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: tablePage.toString(),
        limit: '50',
      });
      
      const res = await fetch(`/api/admin/tables/${selectedTable}?${params}`);
      if (!res.ok) throw new Error('Errore nel caricamento dati');
      const data = await res.json();
      setTableData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminEmails = async () => {
    try {
      const res = await fetch('/api/admin/create-admin-users');
      if (!res.ok) throw new Error('Errore nel caricamento email admin');
      const data = await res.json();
      setAdminEmails(data.admin_emails || []);
    } catch (err) {
      console.error('Error loading admin emails:', err);
    }
  };

  const handleCreateAdminUsers = async () => {
    if (!adminPassword || adminPassword.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      return;
    }

    setCreatingAdmins(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/create-admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Errore nella creazione utenti admin');
      }

      const data = await res.json();
      const resultsMessage = data.results.map((r: any) => 
        `- ${r.email}: ${r.status}\n  ${r.message}${r.user_id ? `\n  User ID: ${r.user_id}` : ''}`
      ).join('\n\n');
      
      alert(`Utenti admin creati/aggiornati:\n\n${resultsMessage}\n\nPassword impostata: ${adminPassword}\n\nIMPORTANTE: Usa questa password per fare login!`);
      setAdminPassword('');
      loadAdminEmails();
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setCreatingAdmins(false);
    }
  };

  const handleCheckUser = async (email: string) => {
    try {
      const res = await fetch('/api/admin/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Errore nella verifica utente');
      }

      const data = await res.json();
      if (data.exists) {
        alert(`Utente trovato:\n\nEmail: ${data.email}\nUser ID: ${data.user_id}\nEmail confermata: ${data.email_confirmed ? 'Sì' : 'No'}\nRuolo: ${data.role}\nPuò fare login: ${data.can_login ? 'Sì' : 'No'}\nCreato: ${new Date(data.created_at).toLocaleString('it-IT')}`);
      } else {
        alert(`Utente non trovato per email: ${email}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Errore nell\'eliminazione');
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
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

        {/* Admin Users Section */}
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Gestione Utenti Admin</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Password per utenti admin
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Inserisci password (min 8 caratteri)"
                  className="flex-1 px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary"
                />
                <button
                  onClick={handleCreateAdminUsers}
                  disabled={creatingAdmins || !adminPassword || adminPassword.length < 8}
                  className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creatingAdmins ? 'Creazione...' : 'Crea/Resetta Utenti Admin'}
                </button>
              </div>
              <p className="mt-2 text-xs text-text-tertiary">
                Crea o resetta la password per tutte le email admin configurate
              </p>
            </div>
            {adminEmails.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Email Admin Configurate:</h3>
                <div className="space-y-2">
                  {adminEmails.map((ae) => (
                    <div
                      key={ae.email}
                      className="flex items-center justify-between p-2 bg-bg-surface rounded text-sm"
                    >
                      <span className="text-text-primary">{ae.email}</span>
                      <div className="flex items-center gap-2">
                        {ae.has_user ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                            ✓ Utente creato
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                            ✗ Utente non creato
                          </span>
                        )}
                        {ae.role === 'admin' ? (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs">
                            Ruolo non assegnato
                          </span>
                        )}
                        <button
                          onClick={() => handleCheckUser(ae.email)}
                          className="px-2 py-1 bg-bg-soft hover:bg-bg-elevated border border-border-subtle rounded text-xs text-text-secondary hover:text-text-primary transition-colors"
                          title="Verifica dettagli utente"
                        >
                          Verifica
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'tables'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Database className="w-4 h-4 inline mr-2" />
            Tabelle
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
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Azioni</th>
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
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(`/api/admin/users/${user.id}`, '_blank')}
                            className="p-1 text-text-secondary hover:text-accent transition-colors"
                            title="Visualizza"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Elimina"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

        {!loading && activeTab === 'tables' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <h3 className="text-sm font-medium text-text-secondary mb-2">Tabelle</h3>
                <div className="bg-bg-surface border border-border-subtle rounded-lg p-2 max-h-[600px] overflow-y-auto">
                  {tables.map((table) => (
                    <button
                      key={table}
                      onClick={() => {
                        setSelectedTable(table);
                        setTablePage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        selectedTable === table
                          ? 'bg-accent/20 text-accent'
                          : 'text-text-secondary hover:bg-bg-soft hover:text-text-primary'
                      }`}
                    >
                      {table}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                {selectedTable ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-text-primary">{selectedTable}</h3>
                      <button
                        onClick={loadTableData}
                        className="p-2 bg-bg-surface border border-border-subtle rounded-lg hover:bg-bg-soft transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    {tableData && (
                      <>
                        <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-bg-soft border-b border-border-subtle">
                                <tr>
                                  {tableData.data.length > 0 &&
                                    Object.keys(tableData.data[0]).map((key) => (
                                      <th
                                        key={key}
                                        className="px-3 py-2 text-left text-xs font-medium text-text-secondary"
                                      >
                                        {key}
                                      </th>
                                    ))}
                                </tr>
                              </thead>
                              <tbody>
                                {tableData.data.map((row, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-b border-border-subtle hover:bg-bg-soft"
                                  >
                                    {Object.values(row).map((value: any, cellIdx) => (
                                      <td
                                        key={cellIdx}
                                        className="px-3 py-2 text-text-primary text-xs"
                                      >
                                        {typeof value === 'object'
                                          ? JSON.stringify(value)
                                          : String(value)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-text-secondary">
                          <span>
                            Mostrando {tableData.data.length} di {tableData.total} record
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setTablePage(Math.max(1, tablePage - 1))}
                              disabled={tablePage === 1}
                              className="px-3 py-1 bg-bg-surface border border-border-subtle rounded disabled:opacity-50"
                            >
                              Precedente
                            </button>
                            <span>Pagina {tablePage}</span>
                            <button
                              onClick={() => setTablePage(tablePage + 1)}
                              disabled={tableData.data.length < 50}
                              className="px-3 py-1 bg-bg-surface border border-border-subtle rounded disabled:opacity-50"
                            >
                              Successivo
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-text-secondary">
                    Seleziona una tabella per visualizzare i dati
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
