'use client';

import { useState, useEffect } from 'react';
import { Database, Trash2, Plus, Edit, Search, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApi } from '@/lib/hooks/useApi';
import { toast } from '@/components/ui/Toast';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { cn } from '@/lib/utils/cn';

interface TableData {
  [key: string]: any;
}

/**
 * Supabase Management Component
 * Permette agli admin di vedere, modificare e cancellare dati in Supabase
 */
export function SupabaseManagement() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [limit] = useState(50);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [newRecord, setNewRecord] = useState<any>({});

  const { data: tablesData, loading: tablesLoading, error: tablesError, retry: retryTables } = useApi<string[]>(
    '/api/admin/supabase/tables',
    {
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: tableData, loading: dataLoading, error: dataError, retry: retryData } = useApi<{
    data: TableData[];
    count: number;
    limit: number;
    offset: number;
  }>(
    selectedTable ? `/api/admin/supabase/data?table=${selectedTable}&limit=${limit}&offset=${page * limit}` : null,
    {
      cacheTime: 0, // No cache for data
    }
  );

  const handleDelete = async (id: string) => {
    if (!selectedTable || !confirm(`Sei sicuro di voler eliminare questo record?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/supabase/data?table=${selectedTable}&id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore durante l\'eliminazione');
      }

      toast.success('Record eliminato con successo');
      retryData();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error(error instanceof Error ? error.message : 'Errore durante l\'eliminazione');
    }
  };

  const handleAdd = async () => {
    if (!selectedTable) return;

    try {
      const response = await fetch('/api/admin/supabase/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: selectedTable,
          data: newRecord,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore durante l\'aggiunta');
      }

      toast.success('Record aggiunto con successo');
      setShowAddModal(false);
      setNewRecord({});
      retryData();
    } catch (error) {
      console.error('Error adding record:', error);
      toast.error(error instanceof Error ? error.message : 'Errore durante l\'aggiunta');
    }
  };

  const handleEdit = async () => {
    if (!selectedTable || !editingRecord?.id) return;

    try {
      const { id, ...updateData } = editingRecord;

      const response = await fetch('/api/admin/supabase/data', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: selectedTable,
          id,
          data: updateData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore durante la modifica');
      }

      toast.success('Record modificato con successo');
      setShowEditModal(false);
      setEditingRecord(null);
      retryData();
    } catch (error) {
      console.error('Error editing record:', error);
      toast.error(error instanceof Error ? error.message : 'Errore durante la modifica');
    }
  };

  const filteredTables = tablesData?.filter((table) =>
    table.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredData = tableData?.data?.filter((record) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return Object.values(record).some((value) =>
      String(value).toLowerCase().includes(searchLower)
    );
  }) || [];

  const totalPages = tableData ? Math.ceil((tableData.count || 0) / limit) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Database className="w-6 h-6 text-accent" />
            Gestione Supabase
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Visualizza, modifica e gestisci i dati del database Supabase
          </p>
        </div>
        {selectedTable && (
          <button
            onClick={() => {
              setShowAddModal(true);
              setNewRecord({});
            }}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Aggiungi Record
          </button>
        )}
      </div>

      {/* Tables List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Tables */}
        <div className="lg:col-span-1">
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca tabella..."
                className="flex-1 bg-bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
              />
            </div>

            {tablesLoading ? (
              <LoadingState message="Caricamento tabelle..." size="sm" />
            ) : tablesError ? (
              <ErrorState
                title="Errore"
                message="Impossibile caricare le tabelle"
                onRetry={retryTables}
              />
            ) : (
              <div className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
                {filteredTables.map((table) => (
                  <button
                    key={table}
                    onClick={() => {
                      setSelectedTable(table);
                      setPage(0);
                      setSearchQuery('');
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      selectedTable === table
                        ? 'bg-accent/20 text-accent border border-accent/40'
                        : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
                    )}
                  >
                    {table}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Table Data */}
        <div className="lg:col-span-2">
          {!selectedTable ? (
            <div className="bg-bg-soft border border-border-subtle rounded-xl p-12 text-center">
              <Database className="w-12 h-12 mx-auto mb-3 text-text-tertiary opacity-50" />
              <p className="text-text-secondary">Seleziona una tabella per visualizzare i dati</p>
            </div>
          ) : dataLoading ? (
            <LoadingState message="Caricamento dati..." />
          ) : dataError ? (
            <ErrorState
              title="Errore"
              message="Impossibile caricare i dati"
              onRetry={retryData}
            />
          ) : (
            <div className="bg-bg-soft border border-border-subtle rounded-xl overflow-hidden">
              {/* Table Header */}
              <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary">{selectedTable}</h3>
                  <p className="text-xs text-text-tertiary mt-1">
                    {tableData?.count || 0} record totali
                  </p>
                </div>
                <button
                  onClick={() => retryData()}
                  className="p-2 rounded-lg hover:bg-bg-surface text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="Ricarica dati"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-text-tertiary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca nei dati..."
                    className="flex-1 bg-bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {filteredData.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-text-tertiary">Nessun dato trovato</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-bg-surface border-b border-border-subtle">
                      <tr>
                        {Object.keys(filteredData[0] || {}).map((key) => (
                          <th
                            key={key}
                            className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                          >
                            {key}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                          Azioni
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {filteredData.map((record, index) => {
                        const recordKey = record.id || record.user_id || record.report_id || record.course_id || record.module_id || index;
                        return (
                        <tr key={recordKey} className="hover:bg-bg-surface transition-colors">
                          {Object.entries(record).map(([key, value]) => (
                            <td key={key} className="px-4 py-3 text-sm text-text-primary">
                              {typeof value === 'object' && value !== null ? (
                                <pre className="text-xs bg-bg-surface p-2 rounded overflow-x-auto max-w-xs">
                                  {JSON.stringify(value, null, 2)}
                                </pre>
                              ) : (
                                <span className="truncate block max-w-xs">{String(value || '—')}</span>
                              )}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingRecord({ ...record });
                                  setShowEditModal(true);
                                }}
                                className="p-1.5 rounded hover:bg-accent/20 text-text-secondary hover:text-accent transition-colors"
                                aria-label="Modifica"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(record.id || record.user_id || String(index))}
                                className="p-1.5 rounded hover:bg-error/20 text-text-secondary hover:text-error transition-colors"
                                aria-label="Elimina"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-border-subtle flex items-center justify-between">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-3 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-sm text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Precedente
                  </button>
                  <span className="text-sm text-text-secondary">
                    Pagina {page + 1} di {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-sm text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Successiva
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && selectedTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-border-subtle">
              <h3 className="text-lg font-semibold text-text-primary">Aggiungi Record a {selectedTable}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Dati (JSON)</label>
                <textarea
                  value={JSON.stringify(newRecord, null, 2)}
                  onChange={(e) => {
                    try {
                      setNewRecord(JSON.parse(e.target.value));
                    } catch {
                      // Ignora errori di parsing durante la digitazione
                    }
                  }}
                  className="w-full h-64 bg-bg-soft border border-border-subtle rounded-lg px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent"
                  placeholder='{"key": "value"}'
                />
              </div>
            </div>
            <div className="p-6 border-t border-border-subtle flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewRecord({});
                }}
                className="px-4 py-2 rounded-lg bg-bg-soft border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors"
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRecord && selectedTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-border-subtle">
              <h3 className="text-lg font-semibold text-text-primary">Modifica Record in {selectedTable}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Dati (JSON)</label>
                <textarea
                  value={JSON.stringify(editingRecord, null, 2)}
                  onChange={(e) => {
                    try {
                      setEditingRecord(JSON.parse(e.target.value));
                    } catch {
                      // Ignora errori di parsing durante la digitazione
                    }
                  }}
                  className="w-full h-64 bg-bg-soft border border-border-subtle rounded-lg px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="p-6 border-t border-border-subtle flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRecord(null);
                }}
                className="px-4 py-2 rounded-lg bg-bg-soft border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors"
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

