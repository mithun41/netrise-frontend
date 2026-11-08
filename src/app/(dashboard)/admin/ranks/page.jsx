"use client";

import React, { useState } from "react";
import {
  Award,
  Coins,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Users,
  ShieldCheck,
  Percent,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import FormModal from "@/components/common/FormModal";
import { AdminOnly, ListTable, PageShell } from "@/components/common/PagePieces";
import { useApi } from "@/hooks/useApi";
import { api } from "@/services/api";
import { formatDate, formatTaka } from "@/lib/utils";

const RULE_FIELDS = [
  { name: "self_sales_target", label: "Own sales target (৳)", type: "number" },
  { name: "team_sales_target", label: "Team sales target (৳)", type: "number" },
  { name: "new_members_target", label: "New members target", type: "number" },
  { name: "monthly_sales_target", label: "Monthly sales target (৳)", type: "number" },
  { name: "incentive_share_percent", label: "Share of incentive pool (%)", type: "number" },
  { name: "is_active", label: "Active Status", type: "checkbox" },
];

const CYCLE_COLUMNS = [
  { key: "period_label", header: "Period / Date" },
  { key: "pool_amount", header: "Pool Size", render: (value) => formatTaka(value) },
  {
    key: "distributed_amount",
    header: "Paid to Members",
    render: (value) => (
      <span className="font-bold text-emerald-600 dark:text-emerald-400">
        {formatTaka(value)}
      </span>
    ),
  },
  {
    key: "retained_amount",
    header: "Company Retained",
    render: (value) => (
      <span className="text-gray-500 font-mono">
        {formatTaka(value)}
      </span>
    ),
  },
  {
    key: "payouts_count",
    header: "Beneficiaries",
    render: (value) => (
      <Badge variant="outline" size="sm">
        {value} Member{value === 1 ? "" : "s"}
      </Badge>
    ),
  },
  { key: "created_at", header: "Executed At", render: (value) => formatDate(value) },
];

export default function AdminRanksPage() {
  const rules = useApi("/api/ranks/admin/rules/");
  const incentives = useApi("/api/ranks/admin/incentives/");
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);
  const [isPayingIncentive, setIsPayingIncentive] = useState(false);

  const rankResults = rules.data?.results || [];
  const activeRules = rankResults.filter((r) => r.is_active);
  const totalAllocatedShare = activeRules.reduce(
    (sum, r) => sum + Number(r.incentive_share_percent || 0),
    0
  );
  const poolAmount = Number(incentives.data?.pool_available || 0);
  const isShareConfigured = totalAllocatedShare > 0;
  const canPayIncentive = isShareConfigured && poolAmount > 0;

  const columns = [
    {
      key: "rank",
      header: "Rank Code",
      render: (_, row) => (
        <div>
          <span className="font-bold text-gray-900 dark:text-white font-mono">
            {row.rank}
          </span>
          <span className="block text-[11px] text-gray-500">
            {row.rank_display || row.rank}
          </span>
        </div>
      ),
    },
    { key: "self_sales_target", header: "Own Target", render: (value) => formatTaka(value) },
    { key: "team_sales_target", header: "Team Target", render: (value) => formatTaka(value) },
    { key: "new_members_target", header: "New Members Target" },
    { key: "monthly_sales_target", header: "Monthly Target", render: (value) => formatTaka(value) },
    {
      key: "incentive_share_percent",
      header: "Incentive Share",
      render: (value, row) => (
        <div className="flex items-center gap-1.5 font-bold font-mono">
          <span className={Number(value) > 0 ? "text-purple-600 dark:text-purple-400" : "text-gray-400"}>
            {Number(value).toFixed(2)}%
          </span>
          {Number(value) > 0 && !row.is_active && (
            <span className="text-[10px] text-amber-500 italic">(Inactive)</span>
          )}
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (value) => (
        <Badge variant={value ? "success" : "default"} size="sm">
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (_, row) => (
        <Button size="sm" variant="outline" onClick={() => setEditing(row)} className="h-7 text-xs px-2.5">
          Edit
        </Button>
      ),
    },
  ];

  // Evaluate all member ranks
  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setMessage("");
    setActionError("");
    try {
      const res = await api.post("/api/ranks/admin/evaluate/", {});
      setMessage(`Promotion Check Complete: ${res.promoted} member(s) promoted to higher rank.`);
    } catch (err) {
      setActionError(err.message || "Failed to evaluate ranks.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Apply standard NetRise 100% preset
  const handleApplyStandard = async () => {
    setIsApplyingPreset(true);
    setMessage("");
    setActionError("");
    try {
      const res = await api.post("/api/ranks/admin/rules/apply-standard/", {});
      setMessage(res.message || "Standard 100% incentive distribution applied successfully!");
      rules.reload();
      incentives.reload();
    } catch (err) {
      setActionError(err.message || "Failed to apply standard preset.");
    } finally {
      setIsApplyingPreset(false);
    }
  };

  // Pay Incentive Now
  const handlePayIncentive = async () => {
    if (!isShareConfigured) {
      setActionError("Cannot pay incentive: At least one active rank must have an incentive % allocated.");
      return;
    }
    if (poolAmount <= 0) {
      setActionError("Cannot pay incentive: The incentive pool is currently empty (৳0.00).");
      return;
    }

    setIsPayingIncentive(true);
    setMessage("");
    setActionError("");
    try {
      const res = await api.post("/api/ranks/admin/incentives/", {});
      setMessage(
        `Incentive Cycle Completed! ৳${Number(res.distributed_amount || 0).toLocaleString()} paid to ${
          res.payouts_count || 0
        } qualified member(s), ৳${Number(res.retained_amount || 0).toLocaleString()} retained by company.`
      );
      incentives.reload();
    } catch (err) {
      setActionError(err.message || "Failed to run incentive cycle.");
    } finally {
      setIsPayingIncentive(false);
    }
  };

  return (
    <AdminOnly>
      <PageShell
        title="Rank & Incentive Rules"
        description="Configure rank promotion targets, allocate the 5% company incentive pool across leadership tiers, and execute automated payout cycles."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="KPI period"
              value={rules.data?.period || "MONTHLY"}
              onChange={async (e) => {
                try {
                  await api.patch("/api/ranks/admin/config/", { period: e.target.value });
                  rules.reload();
                } catch (err) {
                  setActionError(err.message);
                }
              }}
              className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {(rules.data?.period_choices || []).map((choice) => (
                <option key={choice.value} value={choice.value}>
                  Evaluation Window: {choice.label}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              variant="outline"
              disabled={isEvaluating}
              onClick={handleEvaluate}
              className="h-9 text-xs flex items-center gap-1.5"
            >
              <Award className="h-3.5 w-3.5 text-amber-500" />
              <span>{isEvaluating ? "Checking..." : "Check All Ranks"}</span>
            </Button>
          </div>
        }
      >
        {/* Alerts and Messages */}
        {actionError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-start gap-2.5 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Incentive Operation Warning:</span>
              <p>{actionError}</p>
            </div>
          </div>
        )}

        {message && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Success:</span>
              <p>{message}</p>
            </div>
          </div>
        )}

        {/* 1. Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Incentive Pool Waiting
              </span>
              <Coins className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
              {formatTaka(poolAmount)}
            </div>
            <span className="text-[10px] text-gray-400">5% of total product PV</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Allocated Share %
              </span>
              <Percent className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                {totalAllocatedShare.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-400">/ 100%</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600">
              {totalAllocatedShare === 100 ? "✓ Full 100% Allocated" : "Partial distribution"}
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Active Leadership Ranks
              </span>
              <Award className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
              {activeRules.length} / {rankResults.length}
            </div>
            <span className="text-[10px] text-gray-400">Ranks eligible for shares</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Payout Cycles Run
              </span>
              <Layers className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
              {incentives.data?.results?.length || 0}
            </div>
            <span className="text-[10px] text-gray-400">Historical settlement runs</span>
          </div>
        </div>

        {/* 2. Rank Rules Table & Quick Preset Action */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Leadership Ranks & Incentive Split</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-black uppercase">
                  {totalAllocatedShare}% Allocated
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Each rank receives its percentage of the 5% pool, split equally among members holding that rank.
              </p>
            </div>

            <Button
              size="sm"
              disabled={isApplyingPreset}
              onClick={handleApplyStandard}
              className="h-8 text-xs bg-purple-700 hover:bg-purple-800 text-white font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isApplyingPreset ? "Applying..." : "Apply Standard 100% Preset"}</span>
            </Button>
          </div>

          <ListTable columns={columns} rows={rankResults} isLoading={rules.isLoading} />
        </div>

        {/* 3. Incentive Execution Card */}
        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Coins className="h-4 w-4 text-purple-600" />
                <span>Execute Incentive Payout</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Calculates each rank's allocated percentage from the waiting pool ({formatTaka(poolAmount)}) and credits qualified members' wallets instantly.
              </p>
            </div>

            <Button
              size="sm"
              disabled={isPayingIncentive || !canPayIncentive}
              onClick={handlePayIncentive}
              className={`h-9 px-4 text-xs font-bold flex items-center gap-1.5 shadow-2xs ${
                canPayIncentive
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-gray-200 text-gray-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
              }`}
            >
              <Coins className="h-4 w-4" />
              <span>{isPayingIncentive ? "Processing Payout..." : "Pay Incentive Now"}</span>
            </Button>
          </div>

          {!isShareConfigured ? (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Rank share configuration required before payout:</span>
                <p>
                  No active ranks currently have an incentive percentage set. Click <strong>&quot;Apply Standard 100% Preset&quot;</strong> above to auto-distribute 100% across standard ranks or edit the ranks in the table below.
                </p>
              </div>
            </div>
          ) : poolAmount <= 0 ? (
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2.5">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span>The incentive pool is currently empty (৳0.00). When a new order completes, 5% of net profit is automatically contributed to this pool.</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span>
                  The pool balance of <strong>{formatTaka(poolAmount)}</strong> will be distributed across the configured active ranks according to their defined percentages. If no members qualify for a particular rank, that rank's share is retained.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Historical Incentive Cycles */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">
            Incentive Cycles Settlement History
          </h3>
          <ListTable
            columns={CYCLE_COLUMNS}
            rows={incentives.data?.results}
            isLoading={incentives.isLoading}
            emptyTitle="No cycles run yet"
          />
        </div>

        {/* 5. Rank Rule Edit Modal */}
        <FormModal
          key={editing?.id}
          isOpen={Boolean(editing)}
          onClose={() => setEditing(null)}
          title={`Edit Rank Rule: ${editing?.rank_display || editing?.rank || ""}`}
          fields={RULE_FIELDS}
          initial={editing}
          onSubmit={async (values) => {
            await api.patch(`/api/ranks/admin/rules/${editing.id}/`, values);
            rules.reload();
            incentives.reload();
          }}
        />
      </PageShell>
    </AdminOnly>
  );
}
