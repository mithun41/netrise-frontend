import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export function Table({ className, containerClassName, children, ...props }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-x-auto rounded-xl border border-gray-200/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900",
        containerClassName
      )}
    >
      <table
        className={cn("w-full caption-bottom text-sm text-left", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead
      className={cn(
        "border-b border-gray-200 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody
      className={cn(
        "divide-y divide-gray-100 dark:divide-zinc-800/80 bg-white dark:bg-zinc-900",
        className
      )}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableFooter({ className, children, ...props }) {
  return (
    <tfoot
      className={cn(
        "border-t border-gray-200 bg-gray-50/50 font-medium text-gray-900 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-200",
        className
      )}
      {...props}
    >
      {children}
    </tfoot>
  );
}

export function TableRow({
  className,
  isSelected = false,
  isClickable = false,
  children,
  ...props
}) {
  return (
    <tr
      className={cn(
        "transition-colors duration-150",
        isClickable && "cursor-pointer",
        isSelected
          ? "bg-blue-50/70 hover:bg-blue-50 dark:bg-blue-950/30 dark:hover:bg-blue-950/40"
          : "hover:bg-gray-50/70 dark:hover:bg-zinc-800/50",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  className,
  children,
  sortable = false,
  sortDirection = null, // "asc" | "desc" | null
  onSort,
  align = "left",
  ...props
}) {
  const alignClass = {
    left: "text-left justify-start",
    center: "text-center justify-center",
    right: "text-right justify-end",
  }[align] || "text-left justify-start";

  return (
    <th
      className={cn(
        "h-11 px-4 py-3 align-middle text-xs font-semibold tracking-wider text-gray-600 dark:text-zinc-400 whitespace-nowrap",
        sortable && "cursor-pointer select-none hover:text-gray-900 dark:hover:text-white transition-colors",
        className
      )}
      onClick={sortable && onSort ? onSort : undefined}
      {...props}
    >
      <div className={cn("inline-flex items-center gap-1.5", alignClass)}>
        <span>{children}</span>
        {sortable && (
          <span className="shrink-0 text-gray-400">
            {sortDirection === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            ) : sortDirection === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-50 hover:opacity-100" />
            )}
          </span>
        )}
      </div>
    </th>
  );
}

export function TableCell({ className, align = "left", children, ...props }) {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align] || "text-left";

  return (
    <td
      className={cn(
        "px-4 py-3.5 align-middle text-sm text-gray-700 dark:text-zinc-300",
        alignClass,
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableCaption({ className, children, ...props }) {
  return (
    <caption
      className={cn("mt-4 text-xs text-gray-500 dark:text-zinc-400", className)}
      {...props}
    >
      {children}
    </caption>
  );
}

