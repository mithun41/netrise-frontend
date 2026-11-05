"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./Table";
import TablePagination from "./TablePagination";
import TableToolbar from "./TableToolbar";
import TableSkeleton from "./TableSkeleton";
import TableEmptyState from "./TableEmptyState";

/**
 * Standard Reusable DataTable Component
 *
 * @param {Object} props
 * @param {Array} props.columns - Column configuration: [{ key, header, render, sortable, align, width }]
 * @param {Array} props.data - Array of row items
 * @param {boolean} [props.isLoading=false] - Shows skeleton loader
 * @param {number} [props.skeletonRows=6] - Number of skeleton rows while loading
 * @param {string} [props.rowKey="id"] - Unique key for each row item
 * @param {boolean} [props.selectable=false] - Enable row selection checkboxes
 * @param {Set|Array} [props.selectedRows] - Currently selected row keys
 * @param {Function} [props.onSelectRow] - Callback when a row checkbox toggles
 * @param {Function} [props.onSelectAll] - Callback when "Select All" toggles
 * @param {boolean} [props.isAllSelected=false] - Is "Select All" checked
 * @param {Function} [props.onRowClick] - Callback when clicking a row
 * @param {string} [props.sortKey] - Active sort column key
 * @param {string} [props.sortDirection] - "asc" | "desc"
 * @param {Function} [props.onSort] - Callback on column header click
 * @param {string} [props.searchValue] - Current search string
 * @param {Function} [props.onSearchChange] - Search input change handler
 * @param {string} [props.searchPlaceholder] - Search input placeholder
 * @param {React.ReactNode} [props.toolbarActions] - Action buttons on top right of table
 * @param {React.ReactNode} [props.toolbarFilters] - Extra filter dropdowns
 * @param {Function} [props.onRefresh] - Refresh button callback
 * @param {boolean} [props.isRefreshing=false] - Refresh button loading state
 * @param {Object} [props.pagination] - Pagination config: { currentPage, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange }
 * @param {string} [props.emptyTitle] - Title when no data exists
 * @param {string} [props.emptyDescription] - Description when no data exists
 * @param {Function} [props.onResetFilters] - Reset button handler in empty state
 * @param {string} [props.className] - Container wrapper extra classes
 */
export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  skeletonRows = 6,
  rowKey = "id",
  selectable = false,
  selectedRows = new Set(),
  onSelectRow,
  onSelectAll,
  isAllSelected = false,
  onRowClick,
  sortKey,
  sortDirection,
  onSort,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  toolbarActions,
  toolbarFilters,
  onRefresh,
  isRefreshing = false,
  pagination,
  emptyTitle,
  emptyDescription,
  onResetFilters,
  className,
}) {
  const selectedSet = selectedRows instanceof Set ? selectedRows : new Set(selectedRows);
  const totalCols = columns.length + (selectable ? 1 : 0);

  const showToolbar = onSearchChange || toolbarActions || toolbarFilters || onRefresh || selectedSet.size > 0;

  return (
    <div className={`w-full rounded-xl border border-gray-200/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 ${className || ""}`}>
      {/* Table Toolbar */}
      {showToolbar && (
        <TableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          selectedCount={selectedSet.size}
          onClearSelection={onSelectAll ? () => onSelectAll(false) : undefined}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          filters={toolbarFilters}
          actions={toolbarActions}
        />
      )}

      {/* Main Table Container */}
      <div className="relative w-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm text-left">
          <TableHeader>
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-3 align-middle">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={() => onSelectAll && onSelectAll(!isAllSelected)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    aria-label="Select all rows"
                  />
                </th>
              )}

              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  align={col.align || "left"}
                  sortable={col.sortable}
                  sortDirection={sortKey === col.key ? sortDirection : null}
                  onSort={() => onSort && onSort(col.key)}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </TableHead>
              ))}
            </tr>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={skeletonRows} columns={totalCols} />
            ) : data.length === 0 ? (
              <TableEmptyState
                colSpan={totalCols}
                title={emptyTitle}
                description={emptyDescription}
                onResetFilters={onResetFilters}
              />
            ) : (
              data.map((row, index) => {
                const id = row[rowKey] ?? index;
                const isSelected = selectedSet.has(id);

                return (
                  <TableRow
                    key={id}
                    isSelected={isSelected}
                    isClickable={Boolean(onRowClick)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <TableCell className="w-10 px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow && onSelectRow(id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          aria-label={`Select row ${id}`}
                        />
                      </TableCell>
                    )}

                    {columns.map((col) => (
                      <TableCell key={`${id}-${col.key}`} align={col.align || "left"}>
                        {col.render ? col.render(row[col.key], row, index) : (row[col.key] ?? "—")}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <TablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          pageSizeOptions={pagination.pageSizeOptions}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}

