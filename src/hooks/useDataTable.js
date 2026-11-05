"use client";

import { useState, useMemo, useCallback } from "react";

/**
 * High-performance hook for sorting, searching, filtering, and paginating data.
 *
 * @param {Object} options
 * @param {Array} options.data - The raw data array
 * @param {Array<string>} [options.searchKeys] - Keys to match search term against
 * @param {number} [options.initialPageSize] - Initial rows per page (default: 10)
 * @param {string} [options.initialSortKey] - Initial column key to sort
 * @param {string} [options.initialSortDirection] - "asc" | "desc"
 */
export function useDataTable({
  data = [],
  searchKeys = [],
  initialPageSize = 10,
  initialSortKey = null,
  initialSortDirection = "asc",
} = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState(initialSortKey);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Handle column sort toggle
  const handleSort = useCallback((key) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDirection("asc");
      return key;
    });
  }, []);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim() || searchKeys.length === 0) {
      return data;
    }

    const lowerQuery = searchTerm.toLowerCase().trim();

    return data.filter((item) => {
      return searchKeys.some((key) => {
        const val = item[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(lowerQuery);
      });
    });
  }, [data, searchTerm, searchKeys]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedData.length / pageSize));
  }, [sortedData.length, pageSize]);

  // Paginated slice
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Reset page when search term or page size changes
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Selection helpers
  const toggleSelectRow = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === paginatedData.length && paginatedData.length > 0) {
        return new Set();
      }
      return new Set(paginatedData.map((item) => item.id || item._id));
    });
  }, [paginatedData]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    // Data outputs
    data: paginatedData,
    allFilteredData: sortedData,
    totalItems: sortedData.length,
    totalPages,

    // Search state
    searchTerm,
    setSearchTerm: handleSearchChange,

    // Sort state
    sortKey,
    sortDirection,
    handleSort,

    // Pagination state
    currentPage,
    setCurrentPage: handlePageChange,
    pageSize,
    setPageSize: handlePageSizeChange,

    // Selection state
    selectedIds,
    isAllSelected:
      paginatedData.length > 0 && selectedIds.size === paginatedData.length,
    toggleSelectRow,
    toggleSelectAll,
    clearSelection,
  };
}

