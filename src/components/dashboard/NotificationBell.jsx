"use client";

import React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useApi } from "@/hooks/useApi";

export default function NotificationBell() {
  const { data } = useApi("/api/notifications/");
  const unread = data?.unread || 0;

  return (
    <Link
      href="/notifications"
      title="Notifications"
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 shadow-2xs transition-colors"
    >
      <Bell className="h-4 w-4" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-4 rounded-full bg-red-600 px-1 text-center text-[10px] font-bold text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
