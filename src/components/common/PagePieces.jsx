"use client";

import React from "react";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { DataTable } from "@/components/common/table";
import { useDataTable } from "@/hooks/useDataTable";

export function PageShell({ title, description, actions, children }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{title}</h1>
          {description && <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function StatGrid({ items }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">{item.label}</div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">{item.value}</div>
          {item.hint && <div className="mt-1 text-xs text-gray-500 dark:text-zinc-400">{item.hint}</div>}
        </div>
      ))}
    </div>
  );
}

export function ErrorNote({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function SectionTitle({ children }) {
  return <h2 className="text-sm font-bold text-gray-900 dark:text-white">{children}</h2>;
}

/** The standard DataTable with search, sorting and pagination already connected. */
export function ListTable({ columns, rows, isLoading, searchKeys = [], actions, emptyTitle, onRefresh, rowKey }) {
  const table = useDataTable({ data: rows || [], searchKeys });

  return (
    <DataTable
      columns={columns}
      data={table.data}
      rowKey={rowKey}
      isLoading={isLoading}
      sortKey={table.sortKey}
      sortDirection={table.sortDirection}
      onSort={table.handleSort}
      searchValue={searchKeys.length ? table.searchTerm : undefined}
      onSearchChange={searchKeys.length ? table.setSearchTerm : undefined}
      searchPlaceholder="Search..."
      toolbarActions={actions}
      onRefresh={onRefresh}
      emptyTitle={emptyTitle || "Nothing here yet"}
      pagination={{
        currentPage: table.currentPage,
        totalPages: table.totalPages,
        totalItems: table.totalItems,
        pageSize: table.pageSize,
        onPageChange: table.setCurrentPage,
        onPageSizeChange: table.setPageSize,
      }}
    />
  );
}

/** Staff-only page content. The API refuses members anyway; this explains why the page is empty. */
export function AdminOnly({ children }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isStaff = Boolean(user?.is_staff || user?.is_superuser || user?.user_type === "ADMIN");

  if (isAuthenticated && !isStaff) {
    return (
      <div className="flex flex-col items-center gap-2 py-24 text-center text-gray-500 dark:text-zinc-400">
        <ShieldAlert className="h-8 w-8" />
        <p className="text-sm font-semibold">This page is for administrators only.</p>
      </div>
    );
  }
  return children;
}
