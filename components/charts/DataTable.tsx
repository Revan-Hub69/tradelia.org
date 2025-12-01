'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from '@/lib/i18n/use-translations';

export interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
}

type SortDirection = 'asc' | 'desc' | null;

/**
 * Data Table Component
 * Tabella sortable, paginated, filterable
 * Riferimento: Shneiderman (1998) - Information Visualization, WCAG 2.1 AAA
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder,
  pagination = true,
  pageSize = 10,
  className,
  emptyMessage,
}: DataTableProps<T>) {
  const { t } = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const value = row[col.key as keyof T];
        return value?.toString().toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn as keyof T];
      const bValue = b[sortColumn as keyof T];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;

    const columnKey = column.key as keyof T | string;
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (column: DataTableColumn<T>) => {
    if (!column.sortable) return null;
    if (sortColumn !== column.key) {
      return <ArrowUpDown className="w-3 h-3 text-text-tertiary" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-3 h-3 text-accent" />;
    }
    return <ArrowDown className="w-3 h-3 text-accent" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder || t('table.search') || 'Cerca...'}
            className="w-full pl-10 pr-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border-subtle">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-text-primary',
                    column.sortable && 'cursor-pointer hover:bg-bg-soft transition-colors',
                    column.width && `w-[${column.width}]`
                  )}
                  onClick={() => handleSort(column)}
                  aria-sort={
                    sortColumn === column.key
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-text-tertiary">
                  {emptyMessage || t('table.empty') || 'Nessun dato disponibile'}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-border-subtle hover:bg-bg-soft transition-colors"
                >
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-4 py-3 text-sm text-text-secondary">
                      {column.render
                        ? column.render(row[column.key as keyof T], row)
                        : String(row[column.key as keyof T] || '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-tertiary">
            {t('table.showing') || 'Mostrando'} {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedData.length)} {t('table.of') || 'di'} {sortedData.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-bg-soft border border-border-subtle text-text-primary hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={t('table.previous') || 'Pagina precedente'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-text-primary px-3">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-bg-soft border border-border-subtle text-text-primary hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={t('table.next') || 'Pagina successiva'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

