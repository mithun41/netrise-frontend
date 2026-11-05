import React from "react";
import Skeleton from "@/components/common/Skeleton";
import { TableRow, TableCell } from "./Table";

/**
 * High-performance Table Skeleton to prevent Cumulative Layout Shift (CLS)
 * @param {number} rows - Number of skeleton rows to render
 * @param {number} columns - Number of columns or array of column widths
 */
export default function TableSkeleton({ rows = 5, columns = 5 }) {
  const rowArray = Array.from({ length: rows });
  const colArray = Array.from({ length: columns });

  return (
    <>
      {rowArray.map((_, rIndex) => (
        <TableRow key={`skeleton-row-${rIndex}`} className="animate-pulse">
          {colArray.map((_, cIndex) => (
            <TableCell key={`skeleton-col-${cIndex}`} className="py-4">
              <Skeleton
                className={`h-4 ${
                  cIndex === 0
                    ? "w-28"
                    : cIndex === 1
                    ? "w-40"
                    : cIndex === columns - 1
                    ? "w-16"
                    : "w-24"
                }`}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

