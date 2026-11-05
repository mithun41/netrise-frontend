import React from "react";
import Button from "@/components/common/Button";
import { TableRow, TableCell } from "./Table";
import { Inbox, RotateCcw } from "lucide-react";

export default function TableEmptyState({
  colSpan = 5,
  title = "No data found",
  description = "We couldn't find any results matching your search or filters.",
  onResetFilters,
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-12 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500 mb-3">
            <Inbox className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
            {title}
          </h4>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
            {description}
          </p>
          {onResetFilters && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

