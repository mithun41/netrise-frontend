"use client";

import React from "react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { ErrorNote, PageShell } from "@/components/common/PagePieces";
import { useApi } from "@/hooks/useApi";
import { api } from "@/services/api";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const { data, isLoading, error, reload } = useApi("/api/notifications/");
  const items = data?.results || [];

  return (
    <PageShell
      title="Notifications"
      description="Rank, commission and settlement updates."
      actions={
        data?.unread > 0 && (
          <Button size="sm" variant="outline" onClick={() => api.post("/api/notifications/read/", {}).then(reload)}>
            Mark all as read
          </Button>
        )
      }
    >
      <ErrorNote message={error} />
      {!isLoading && items.length === 0 && (
        <p className="py-16 text-center text-sm text-gray-500 dark:text-zinc-400">No notifications yet.</p>
      )}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</span>
                {!item.read_at && <Badge variant="info" size="sm">New</Badge>}
              </div>
              <span className="text-xs text-gray-400 shrink-0">{formatDate(item.created_at)}</span>
            </div>
            {item.body && <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">{item.body}</p>}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
