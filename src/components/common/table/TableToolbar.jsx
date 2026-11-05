"use client";

import React from "react";
import Button from "@/components/common/Button";
import { Search, X, RotateCw, Trash2, Download } from "lucide-react";

export default function TableToolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search records...",
  selectedCount = 0,
  onClearSelection,
  onBulkDelete,
  onRefresh,
  isRefreshing = false,
  filters,
  actions,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 rounded-t-xl">
      {/* Left: Search input & Bulk indicator */}
      <div className="flex flex-1 items-center gap-3">
        {selectedCount > 0 ? (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <span>{selectedCount} item{selectedCount > 1 ? "s" : ""} selected</span>
            {onClearSelection && (
              <button
                type="button"
                onClick={onClearSelection}
                className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Clear
              </button>
            )}
            {onBulkDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={onBulkDelete}
                className="h-6 px-2 text-[11px] ml-2"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            )}
          </div>
        ) : onSearchChange ? (
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/60 pl-9 pr-8 py-1.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 transition-all"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : null}

        {filters && <div className="flex items-center gap-2">{filters}</div>}
      </div>

      {/* Right: Actions & Refresh */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            className="h-8 w-8 p-0"
            title="Refresh Table"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}

