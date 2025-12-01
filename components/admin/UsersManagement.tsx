'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Mail } from 'lucide-react';
import styles from './AdminComponents.module.css';

interface UserRole {
  id: string;
  role: string;
  plan_source?: string;
  valid_until?: string;
}

interface User {
  user_id: string;
  display_name?: string;
  company?: string;
  country?: string;
  user_type?: string;
  created_at: string;
  updated_at: string;
  user_roles?: UserRole[];
  auth_users?: {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at?: string;
  };
}

interface UsersManagementProps {
  adminToken?: string;
}

export function UsersManagement({ adminToken }: UsersManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, userTypeFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }
      if (userTypeFilter !== 'all') {
        params.append('user_type', userTypeFilter);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${adminToken || 'admin@tradelia.org'}`, // TODO: Get from auth
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      // Assicurati che data.data sia sempre un array
      setUsers(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter((user) => {
    const email = user.auth_users?.email || '';
    const displayName = user.display_name || '';
    const company = user.company || '';
    const matchesSearch =
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) : [];

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} aria-label="Loading users" />
        <p>Caricamento utenti...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p>{error}</p>
        <button onClick={fetchUsers} className={styles.retryButton}>
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className={styles.managementContainer}>
      {/* Header */}
      <div className={styles.managementHeader}>
        <div className={styles.managementHeaderLeft}>
          <h2 className={styles.managementTitle}>Gestione Utenti</h2>
          <p className={styles.managementSubtitle}>
            {users.length} utenti totali
          </p>
        </div>
        <button className={styles.createButton}>
          <Plus className={styles.buttonIcon} aria-hidden="true" />
          <span>Nuovo Utente</span>
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            placeholder="Cerca utenti..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <Filter className={styles.filterIcon} aria-hidden="true" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Tutti i ruoli</option>
            <option value="trial">Trial</option>
            <option value="pro">Pro</option>
            <option value="desk">Desk</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Tutti i tipi</option>
            <option value="retail">Retail</option>
            <option value="pro">Pro</option>
            <option value="desk">Desk</option>
            <option value="internal">Internal</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Nome</th>
              <th>Azienda</th>
              <th>Tipo</th>
              <th>Ruolo</th>
              <th>Registrato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                  Nessun utente trovato
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>
                    <div className={styles.emailCell}>
                      <Mail className={styles.emailIcon} aria-hidden="true" />
                      {user.auth_users?.email || 'N/A'}
                    </div>
                  </td>
                  <td>{user.display_name || '—'}</td>
                  <td>{user.company || '—'}</td>
                  <td>
                    {user.user_type && (
                      <span className={styles.badge}>{user.user_type}</span>
                    )}
                  </td>
                  <td>
                    {user.user_roles && user.user_roles.length > 0 ? (
                      <div className={styles.rolesList}>
                        {user.user_roles.map((role) => (
                          <span key={role.id} className={styles.roleBadge}>
                            {role.role}
                          </span>
                        ))}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {user.auth_users?.created_at
                      ? new Date(user.auth_users.created_at).toLocaleDateString('it-IT')
                      : '—'}
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.actionButton}
                        title="Modifica"
                        aria-label={`Modifica ${user.auth_users?.email}`}
                      >
                        <Edit className={styles.actionIcon} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
