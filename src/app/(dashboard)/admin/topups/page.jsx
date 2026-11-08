"use client";

import React from "react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { AdminOnly, ErrorNote, ListTable, PageShell } from "@/components/common/PagePieces";
import { useAction, useApi } from "@/hooks/useApi";
import { api } from "@/services/api";
import { formatDate, formatTaka, statusVariant } from "@/lib/utils";

export default function AdminTopupsPage() {
  const { data, isLoading, error, reload } = useApi("/api/wallet/topups/admin/");
  const { isBusy, error: actionError, run } = useAction(reload);
  const act = (row, action) => run(() => api.post(`/api/wallet/topups/admin/${action}/`, { request_id: row.request_id }));

  const columns = [
    { key: "request_id", header: "Request" },
    { key: "username", header: "Member" },
    { key: "amount", header: "Amount", render: (value) => formatTaka(value) },
    { key: "payment_method_display", header: "Method" },
    { key: "payment_reference", header: "Reference" },
    { key: "created_at", header: "Date", render: (value) => formatDate(value) },
    {
      key: "status",
      header: "Status",
      render: (value, row) => <Badge variant={statusVariant(value)} size="sm">{row.status_display}</Badge>,
    },
    {
      key: "actions",
      header: "",
      render: (_, row) =>
        row.status === "PENDING" && (
          <div className="flex gap-1.5">
            <Button size="sm" disabled={isBusy} onClick={() => act(row, "approve")}>
              Approve
            </Button>
            <Button size="sm" variant="outline" disabled={isBusy} onClick={() => act(row, "reject")}>
              Reject
            </Button>
          </div>
        ),
    },
  ];

  return (
    <AdminOnly>
      <PageShell title="E-Wallet Top-ups" description="Check the payment reference first, then approve.">
        <ErrorNote message={error || actionError} />
        <ListTable
          columns={columns}
          rows={data?.results}
          isLoading={isLoading}
          searchKeys={["request_id", "username", "payment_reference"]}
          emptyTitle="No top-up requests yet"
        />
      </PageShell>
    </AdminOnly>
  );
}
