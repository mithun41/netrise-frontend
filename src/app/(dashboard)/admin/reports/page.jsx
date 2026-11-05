"use client";

import React, { useState } from "react";
import { Printer } from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { AdminOnly, ErrorNote, ListTable, PageShell, SectionTitle, StatGrid } from "@/components/common/PagePieces";
import { useApi } from "@/hooks/useApi";
import { formatDate, formatTaka } from "@/lib/utils";

const RANK_COLUMNS = [
  { key: "current_rank", header: "Rank" },
  { key: "count", header: "Members" },
];

const EARNER_COLUMNS = [
  { key: "username", header: "Member" },
  { key: "earned", header: "Earned", render: (value) => formatTaka(value) },
];

const AUDIT_COLUMNS = [
  { key: "created_at", header: "When", render: (value) => formatDate(value) },
  { key: "actor_name", header: "By" },
  { key: "action", header: "Action" },
  { key: "target", header: "Target" },
  { key: "summary", header: "Details" },
];

export default function AdminReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data, isLoading, error } = useApi(`/api/reports/summary/?from=${from}&to=${to}`);
  const audit = useApi("/api/reports/audit/");

  return (
    <AdminOnly>
      <PageShell
        title="Reports & Audit (প্রতিবেদন)"
        description="Business totals for any date range, and every admin action."
        actions={
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
        }
      >
        <ErrorNote message={error || audit.error} />
        <div className="flex flex-wrap gap-3 max-w-md">
          <div className="flex-1 min-w-36">
            <Input id="report-from" label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="flex-1 min-w-36">
            <Input id="report-to" label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>

        <StatGrid
          items={[
            { label: "Sales", value: formatTaka(data?.sales.amount), hint: `${data?.sales.orders ?? 0} orders, PV ${data?.sales.pv ?? 0}` },
            { label: "New Members", value: data?.members.new ?? 0, hint: `Total: ${data?.members.total ?? 0}` },
            { label: "Cash Paid Out", value: formatTaka(data?.settlements.withdrawn), hint: `Pending: ${formatTaka(data?.settlements.pending)}` },
            { label: "Top-ups", value: formatTaka(data?.settlements.topups) },
            { label: "DSC Paid", value: formatTaka(data?.commissions.dsc) },
            { label: "Level Commission", value: formatTaka(data?.commissions.level) },
            { label: "Company Profit", value: formatTaka(data?.commissions.company_profit), hint: `Unclaimed: ${formatTaka(data?.commissions.unclaimed)}` },
            { label: "Incentive Pool", value: formatTaka(data?.commissions.incentive_pool), hint: `Super Shop: ${formatTaka(data?.commissions.super_shop)}` },
          ]}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <SectionTitle>Members by Rank</SectionTitle>
            <ListTable columns={RANK_COLUMNS} rows={data?.members.by_rank} rowKey="current_rank" isLoading={isLoading} />
          </div>
          <div className="space-y-2">
            <SectionTitle>Top Earners</SectionTitle>
            <ListTable columns={EARNER_COLUMNS} rows={data?.top_earners} rowKey="username" isLoading={isLoading} />
          </div>
        </div>

        <div className="space-y-2">
          <SectionTitle>Audit Trail</SectionTitle>
          <ListTable
            columns={AUDIT_COLUMNS}
            rows={audit.data?.results}
            isLoading={audit.isLoading}
            searchKeys={["actor_name", "action", "summary"]}
            emptyTitle="No admin actions recorded yet"
          />
        </div>
      </PageShell>
    </AdminOnly>
  );
}
