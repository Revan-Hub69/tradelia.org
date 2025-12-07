'use client';

import { useState, useEffect } from 'react';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { Users, BarChart3, Search, RefreshCw, AlertCircle, CreditCard, FileText, Database, Shield, Edit2, Save, X, FileSearch } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string;
}

interface UserDetail extends User {
  role_valid_until?: string;
  plan_source?: string;
  stats?: any;
  preferences?: any;
  counts?: {
    reports: number;
    watchlist: number;
  };
}

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  created_at: string;
  completed_at?: string;
}

interface Report {
  id: string;
  user_id: string;
  type: string;
  title?: string;
  created_at: string;
}

interface Stats {
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  reports: number; // Solo report pubblici/generati
  analysisRequests: number; // Richieste personali (a personam)
  watchlist: number;
  notifications: number;
  completedCourses: number;
}

export default function AdminPage() {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'payments' | 'reports' | 'analysis-requests' | 'sql'>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [analysisRequests, setAnalysisRequests] = useState<any[]>([]);
  const [analysisRequestPage, setAnalysisRequestPage] = useState(1);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);
  const [editingRole, setEditingRole] = useState<{ userId: string; role: string; validUntil?: string } | null>(null);
  const [sqlQuery, setSqlQuery] = useState('');
  const [sqlResult, setSqlResult] = useState<any>(null);

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

  // Carica pagamenti
  useEffect(() => {
    if (activeTab === 'payments') {
      loadPayments();
    }
  }, [activeTab, paymentPage]);

  // Carica report
  useEffect(() => {
    if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab, reportPage]);

  // Carica richieste di analisi
  useEffect(() => {
    if (activeTab === 'analysis-requests') {
      loadAnalysisRequests();
    }
  }, [activeTab, analysisRequestPage]);

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
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Non autorizzato - Accesso admin richiesto');
        }
        throw new Error('Errore nel caricamento utenti');
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetail = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error('Errore nel caricamento dettagli utente');
      const data = await res.json();
      setSelectedUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  };

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: paymentPage.toString(),
        limit: '20',
      });
      
      const res = await fetch(`/api/admin/payments?${params}`);
      if (!res.ok) throw new Error('Errore nel caricamento pagamenti');
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: reportPage.toString(),
        limit: '20',
      });
      
      const res = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) throw new Error('Errore nel caricamento report');
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysisRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: analysisRequestPage.toString(),
        limit: '20',
      });
      
      const res = await fetch(`/api/admin/analysis-requests?${params}`);
      if (!res.ok) throw new Error('Errore nel caricamento richieste di analisi');
      const data = await res.json();
      setAnalysisRequests(data.analysisRequests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      const res = await fetch(`/api/admin/users/${editingRole.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editingRole.role,
          role_valid_until: editingRole.validUntil || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Errore nell\'aggiornamento ruolo');
      }

      setEditingRole(null);
      loadUsers();
      if (selectedUser) {
        loadUserDetail(selectedUser.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  };

  const handleExecuteSQL = async () => {
    if (!sqlQuery.trim()) {
      setError('Inserisci una query SQL');
      return;
    }

    setLoading(true);
    setError(null);
    setSqlResult(null);

    try {
      const res = await fetch('/api/admin/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore nell\'esecuzione query');
      }

      setSqlResult(data);
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
            Gestione completa sistema - Solo amministratori
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-border-subtle overflow-x-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
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
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Utenti
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'payments'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Pagamenti
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'reports'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Report
          </button>
          <button
            onClick={() => setActiveTab('analysis-requests')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'analysis-requests'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <FileSearch className="w-4 h-4 inline mr-2" />
            Richieste Analisi
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'sql'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Database className="w-4 h-4 inline mr-2" />
            SQL Query
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-accent" />
          </div>
        )}

        {/* Stats Tab */}
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
              <h3 className="text-sm text-text-secondary mb-2">Report Pubblici</h3>
              <p className="text-3xl font-bold text-text-primary">{stats.reports}</p>
              <p className="text-xs text-text-tertiary mt-1">Report generati (non a personam)</p>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
              <h3 className="text-sm text-text-secondary mb-2">Richieste Analisi</h3>
              <p className="text-3xl font-bold text-text-primary">{stats.analysisRequests || 0}</p>
              <p className="text-xs text-text-tertiary mt-1">Richieste personali (a personam)</p>
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

        {/* Users Tab */}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
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
                            <button
                              onClick={() => loadUserDetail(user.id)}
                              className="px-3 py-1 bg-bg-soft hover:bg-bg-elevated border border-border-subtle rounded text-xs transition-colors"
                            >
                              Dettagli
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center mt-4">
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

              {selectedUser && (
                <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">Dettagli Utente</h3>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-text-tertiary hover:text-text-primary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-text-secondary">Email</label>
                      <p className="text-sm text-text-primary">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary">Nome</label>
                      <p className="text-sm text-text-primary">{selectedUser.name}</p>
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary">Ruolo</label>
                      {editingRole?.userId === selectedUser.id ? (
                        <div className="space-y-2 mt-1">
                          <select
                            value={editingRole.role}
                            onChange={(e) => setEditingRole({ ...editingRole, role: e.target.value })}
                            className="w-full px-3 py-2 bg-bg-soft border border-border-subtle rounded text-sm"
                          >
                            <option value="guest">Guest</option>
                            <option value="trial">Trial</option>
                            <option value="pro">Pro</option>
                            <option value="desk">Desk</option>
                            <option value="admin">Admin</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdateRole}
                              className="flex-1 px-3 py-1 bg-accent hover:bg-accent-hover text-white rounded text-xs"
                            >
                              <Save className="w-3 h-3 inline mr-1" />
                              Salva
                            </button>
                            <button
                              onClick={() => setEditingRole(null)}
                              className="px-3 py-1 bg-bg-soft hover:bg-bg-elevated border border-border-subtle rounded text-xs"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                            {selectedUser.role}
                          </span>
                          <button
                            onClick={() => setEditingRole({ userId: selectedUser.id, role: selectedUser.role })}
                            className="p-1 text-text-secondary hover:text-accent"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    {selectedUser.counts && (
                      <div>
                        <label className="text-xs text-text-secondary">Statistiche</label>
                        <div className="mt-1 space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Report:</span>
                            <span className="text-text-primary">{selectedUser.counts.reports}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Watchlist:</span>
                            <span className="text-text-primary">{selectedUser.counts.watchlist}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-text-secondary">Creato</label>
                      <p className="text-sm text-text-primary">
                        {new Date(selectedUser.created_at).toLocaleString('it-IT')}
                      </p>
                    </div>
                    {selectedUser.last_sign_in_at && (
                      <div>
                        <label className="text-xs text-text-secondary">Ultimo accesso</label>
                        <p className="text-sm text-text-primary">
                          {new Date(selectedUser.last_sign_in_at).toLocaleString('it-IT')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {!loading && activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-bg-soft border-b border-border-subtle">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Utente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Importo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Stato</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Metodo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border-subtle hover:bg-bg-soft">
                      <td className="px-4 py-3 text-sm text-text-primary font-mono text-xs">
                        {payment.id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary font-mono text-xs">
                        {payment.user_id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {payment.amount} {payment.currency}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          payment.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          payment.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          payment.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-bg-soft text-text-secondary'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {payment.payment_method || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {new Date(payment.created_at).toLocaleDateString('it-IT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setPaymentPage(Math.max(1, paymentPage - 1))}
                disabled={paymentPage === 1}
                className="px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg disabled:opacity-50"
              >
                Precedente
              </button>
              <span className="text-text-secondary">Pagina {paymentPage}</span>
              <button
                onClick={() => setPaymentPage(paymentPage + 1)}
                disabled={payments.length < 20}
                className="px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg disabled:opacity-50"
              >
                Successivo
              </button>
            </div>
          </div>
        )}

        {/* Analysis Requests Tab */}
        {!loading && activeTab === 'analysis-requests' && (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <FileSearch className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-1">Richieste di Analisi (a personam)</h3>
                  <p className="text-xs text-text-secondary">
                    Queste sono richieste personali degli utenti, separate dai report pubblici. 
                    Non vengono conteggiate nei report totali.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-bg-soft border-b border-border-subtle">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Utente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Asset</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Stato</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisRequests.map((request) => (
                    <tr key={request.id} className="border-b border-border-subtle hover:bg-bg-soft">
                      <td className="px-4 py-3 text-sm text-text-primary font-mono text-xs">
                        {request.id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary font-mono text-xs">
                        {request.user_id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {request.asset_symbol || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          {request.request_type || 'analysis'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          request.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          request.status === 'processing' ? 'bg-amber-500/20 text-amber-400' :
                          request.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-bg-soft text-text-secondary'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {new Date(request.created_at).toLocaleDateString('it-IT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setAnalysisRequestPage(Math.max(1, analysisRequestPage - 1))}
                disabled={analysisRequestPage === 1}
                className="px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg disabled:opacity-50"
              >
                Precedente
              </button>
              <span className="text-text-secondary">Pagina {analysisRequestPage}</span>
              <button
                onClick={() => setAnalysisRequestPage(analysisRequestPage + 1)}
                disabled={analysisRequests.length < 20}
                className="px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg disabled:opacity-50"
              >
                Successivo
              </button>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {!loading && activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-bg-soft border-b border-border-subtle">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Utente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Titolo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-border-subtle hover:bg-bg-soft">
                      <td className="px-4 py-3 text-sm text-text-primary font-mono text-xs">
                        {report.id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary font-mono text-xs">
                        {report.user_id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {report.title || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {new Date(report.created_at).toLocaleDateString('it-IT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setReportPage(Math.max(1, reportPage - 1))}
                disabled={reportPage === 1}
                className="px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg disabled:opacity-50"
              >
                Precedente
              </button>
              <span className="text-text-secondary">Pagina {reportPage}</span>
              <button
                onClick={() => setReportPage(reportPage + 1)}
                disabled={reports.length < 20}
                className="px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg disabled:opacity-50"
              >
                Successivo
              </button>
            </div>
          </div>
        )}

        {/* SQL Query Tab */}
        {!loading && activeTab === 'sql' && (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-400 mb-1">Sicurezza SQL</h3>
                  <p className="text-xs text-text-secondary">
                    Solo query SELECT sono permesse per motivi di sicurezza. 
                    Query con DROP, DELETE, INSERT, UPDATE, ALTER, CREATE sono bloccate.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Query SQL (solo SELECT)
                </label>
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="SELECT * FROM users LIMIT 10;"
                  className="w-full h-32 px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary font-mono text-sm"
                />
              </div>
              <button
                onClick={handleExecuteSQL}
                disabled={!sqlQuery.trim() || loading}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Esegui Query
              </button>
            </div>

            {sqlResult && (
              <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-2">Risultato</h3>
                <pre className="text-xs text-text-primary overflow-x-auto">
                  {JSON.stringify(sqlResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
