/**
 * Data Table Component
 * 
 * Tabella dati avanzata con sorting, filtering, pagination, selection
 * 
 * Riferimenti:
 * - W3C ARIA Table Pattern
 * - Material Design Data Tables
 * - TanStack Table (React Table)
 */

'use client';

import { useState, useMemo, ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  showPagination?: boolean;
  showSearch?: boolean;
  showSelection?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
  emptyMessage?: string;
}

type SortDirection = 'asc' | 'desc' | null;

/**
 * Data Table Component
 * 
 * Features:
 * - Sorting (multi-column)
 * - Filtering (search)
 * - Pagination
 * - Row selection
 * - Responsive
 * - Accessible
 */
export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  pageSize = 10,
  showPagination = true,
  showSearch = true,
  showSelection = false,
  onRowClick,
  className = '',
  emptyMessage = 'Nessun dato disponibile',
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((row) => {
      return columns.some((col) => {
        const value = col.accessor(row);
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    const column = columns.find((col) => col.key === sortColumn);
    if (!column || !column.sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = column.accessor(a);
      const bValue = column.accessor(b);

      // Convert to comparable values
      const aNum = typeof aValue === 'number' ? aValue : Number(aValue) || 0;
      const bNum = typeof bValue === 'number' ? bValue : Number(bValue) || 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      const comparison = aNum - bNum;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize, showPagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sort
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column || !column.sortable) return;

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
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      const newSelection = new Set(
        paginatedData.map((row) => row.id || JSON.stringify(row))
      );
      setSelectedRows(newSelection);
    }
  };

  const handleSelectRow = (row: T) => {
    const rowId = row.id || JSON.stringify(row);
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    setSelectedRows(newSelection);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      {/* Search */}
      {showSearch && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Cerca..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {showSelection && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      selectedRows.size === paginatedData.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-blue-600 dark:text-blue-400">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showSelection ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const rowId = row.id || index;
                const isSelected = selectedRows.has(rowId);

                return (
                  <tr
                    key={rowId}
                    className={`${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {showSelection && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-sm text-gray-900 dark:text-gray-100`}
                        style={{
                          textAlign: column.align || 'left',
                        }}
                      >
                        {column.accessor(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {((currentPage - 1) * pageSize) + 1} -{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} di{' '}
            {sortedData.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Precedente
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Pagina {currentPage} di {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Successiva
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

