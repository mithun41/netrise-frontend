import React from "react";
import { SITE_CONFIG } from "@/lib/constants";
import { Layers } from "lucide-react";

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-gray-200 bg-gray-50/50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Layers className="h-4 w-4" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {SITE_CONFIG.name}
            </span>
          </div>

          <div className="text-sm text-gray-500 dark:text-zinc-500">
            © {currentYear} {SITE_CONFIG.name}
          </div>
        </div>
      </div>
    </footer>
  );
}
