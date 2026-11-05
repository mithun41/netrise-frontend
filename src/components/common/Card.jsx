import React from "react";
import { cn } from "@/lib/utils";

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn("mb-4 flex flex-col space-y-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3
      className={cn("text-lg font-semibold tracking-tight text-gray-900 dark:text-zinc-100", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p
      className={cn("text-sm text-gray-500 dark:text-zinc-400", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return <div className={cn("pt-0", className)} {...props}>{children}</div>;
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn("mt-4 flex items-center pt-2 border-t border-gray-100 dark:border-zinc-800", className)}
      {...props}
    >
      {children}
    </div>
  );
}

