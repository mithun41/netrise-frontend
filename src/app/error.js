"use client";

import { useEffect } from "react";
import Button from "@/components/common/Button";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-amber-50 p-4 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 mb-4">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Something went wrong!
      </h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 max-w-sm">
        {error?.message || "An unexpected error occurred while loading this page."}
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={() => reset()} variant="primary">
          Try Again
        </Button>
      </div>
    </div>
  );
}

