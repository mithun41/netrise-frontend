"use client";

import React from "react";
import { ErrorNote, ListTable, PageShell, SectionTitle, StatGrid } from "@/components/common/PagePieces";
import { useApi } from "@/hooks/useApi";
import { formatDate, formatTaka } from "@/lib/utils";

const PERIOD_LABELS = { DAILY: "Today", WEEKLY: "This week", MONTHLY: "This month" };

const HISTORY_COLUMNS = [
  { key: "from_rank", header: "From" },
  { key: "to_rank", header: "To" },
  { key: "created_at", header: "Date", render: (value) => formatDate(value) },
];

function Progress({ label, value, target, format }) {
  const percent = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 100;
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-zinc-300">
        <span>{label}</span>
        <span>
          {format(value)} / {format(target)}
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-zinc-800">
        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function KpiPage() {
  const { data, error, isLoading } = useApi("/api/ranks/my-kpi/");
  const kpi = data?.kpi;
  const targets = data?.targets;
  const count = (value) => String(value);
  const asNumber = (value) => Number(value || 0);

  const goals = targets
    ? [
        { label: "Own sales", value: kpi.self_sales, target: targets.self_sales_target, format: formatTaka },
        { label: "Team sales", value: kpi.team_sales, target: targets.team_sales_target, format: formatTaka },
        { label: "New members", value: kpi.new_members, target: targets.new_members_target, format: count },
        { label: "Monthly sales", value: kpi.monthly_sales, target: targets.monthly_sales_target, format: formatTaka },
      ].filter((goal) => asNumber(goal.target) > 0)
    : [];

  return (
    <PageShell title="KPI & Rank (র‍্যাঙ্ক অগ্রগতি)" description={kpi ? `Measured for: ${PERIOD_LABELS[kpi.period]}` : ""}>
      <ErrorNote message={error} />
      <StatGrid
        items={[
          { label: "Current Rank", value: data?.current_rank || "—", hint: data?.next_rank ? `Next: ${data.next_rank}` : "Top rank" },
          { label: "Own Sales", value: formatTaka(kpi?.self_sales) },
          { label: "Team Sales", value: formatTaka(kpi?.team_sales) },
          { label: "New Members", value: kpi?.new_members ?? 0, hint: `Monthly sales: ${formatTaka(kpi?.monthly_sales)}` },
        ]}
      />

      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <SectionTitle>Progress to {data?.next_rank || "next rank"}</SectionTitle>
        {goals.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {data?.next_rank ? "Targets for the next rank have not been set yet." : "You have reached the top rank."}
          </p>
        )}
        {goals.map((goal) => (
          <Progress
            key={goal.label}
            label={goal.label}
            value={asNumber(goal.value)}
            target={asNumber(goal.target)}
            format={goal.format}
          />
        ))}
      </div>

      <div className="space-y-2">
        <SectionTitle>Rank History</SectionTitle>
        <ListTable
          columns={HISTORY_COLUMNS}
          rows={(data?.history || []).map((row, index) => ({ ...row, id: index }))}
          isLoading={isLoading}
          emptyTitle="No rank changes yet"
        />
      </div>
    </PageShell>
  );
}
