'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import styles from './AdminComponents.module.css';

interface Report {
  id: string;
  report_type: string;
  slug: string;
  title: string;
  status: string;
  notes?: string;
  chart_path?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  report_modules?: any[];
  report_template_versions?: any;
}

interface ReportsManagementProps {
  adminToken?: string;
}

export function ReportsManagement({ adminToken }: ReportsManagementProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${adminToken || 'admin@tradelia.org'}`, // TODO: Get from auth
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.report_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo report?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reports/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken || 'admin@tradelia.org'}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      await fetchReports();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete report');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} aria-label="Loading reports" />
        <p>Caricamento report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p>{error}</p>
        <button onClick={fetchReports} className={styles.retryButton}>
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className={styles.managementContainer}>
      {/* Header with Actions */}
      <div className={styles.managementHeader}>
        <div className={styles.managementHeaderLeft}>
          <h2 className={styles.managementTitle}>Gestione Report</h2>
          <p className={styles.managementSubtitle}>
            {reports.length} report totali
          </p>
        </div>
        <button
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className={styles.buttonIcon} aria-hidden="true" />
          <span>Nuovo Report</span>
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            placeholder="Cerca report..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <Filter className={styles.filterIcon} aria-hidden="true" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Tutti gli stati</option>
            <option value="draft">Bozza</option>
            <option value="published">Pubblicato</option>
            <option value="archived">Archiviato</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Titolo</th>
              <th>Tipo</th>
              <th>Slug</th>
              <th>Stato</th>
              <th>Modificato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  Nessun report trovato
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <strong>{report.title}</strong>
                    {report.notes && (
                      <div className={styles.notes}>{report.notes}</div>
                    )}
                  </td>
                  <td>
                    <span className={styles.badge}>{report.report_type}</span>
                  </td>
                  <td>
                    <code className={styles.code}>{report.slug}</code>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${styles[`status-${report.status}`]}`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td>
                    {new Date(report.updated_at).toLocaleDateString('it-IT')}
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.actionButton}
                        title="Visualizza"
                        aria-label={`Visualizza ${report.title}`}
                      >
                        <Eye className={styles.actionIcon} aria-hidden="true" />
                      </button>
                      <button
                        className={styles.actionButton}
                        title="Modifica"
                        aria-label={`Modifica ${report.title}`}
                      >
                        <Edit className={styles.actionIcon} aria-hidden="true" />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.dangerButton}`}
                        title="Elimina"
                        aria-label={`Elimina ${report.title}`}
                        onClick={() => handleDelete(report.id)}
                      >
                        <Trash2 className={styles.actionIcon} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal - TODO: Implement */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Nuovo Report</h3>
            <p>Form di creazione report - da implementare</p>
            <button onClick={() => setShowCreateModal(false)}>Chiudi</button>
          </div>
        </div>
      )}
    </div>
  );
}
