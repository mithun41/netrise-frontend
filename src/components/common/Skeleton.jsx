import React from "react";
import { cn } from "@/lib/utils";

/**
 * Universal Skeleton Loader for smooth layout placeholders
 */
export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200/80 dark:bg-zinc-800/80",
        className
      )}
      {...props}
    />
  );
}

