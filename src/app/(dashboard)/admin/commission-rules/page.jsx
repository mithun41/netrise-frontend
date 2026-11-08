"use client";

import React, { useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { AdminOnly, ErrorNote, PageShell } from "@/components/common/PagePieces";
import { useAction, useApi } from "@/hooks/useApi";
import { api } from "@/services/api";

const FIELDS = [
  { name: "direct_sales_percent", label: "Direct Sales (DSC)" },
  ...Array.from({ length: 10 }, (_, index) => ({ name: `l${index + 1}_percent`, label: `Level ${index + 1}` })),
  { name: "company_profit_percent", label: "Company Profit" },
  { name: "incentive_percent", label: "Incentive" },
  { name: "supershop_percent", label: "Super Shop" },
];

function RulesForm({ rule, onSaved }) {
  const [values, setValues] = useState(() => Object.fromEntries(FIELDS.map((field) => [field.name, rule[field.name]])));
  const [saved, setSaved] = useState(false);
  const { isBusy, error, run } = useAction(onSaved);

  const total = FIELDS.reduce((sum, field) => sum + (Number(values[field.name]) || 0), 0);
  const isBalanced = Math.abs(total - 100) < 0.001;

  const save = (e) => {
    e.preventDefault();
    setSaved(false);
    run(() => api.patch("/api/commissions/admin/rules/", values).then(() => setSaved(true)));
  };

  return (
    <form onSubmit={save} className="space-y-4">
      <ErrorNote message={error} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {FIELDS.map((field) => (
          <Input
            key={field.name}
            id={field.name}
            label={`${field.label} (%)`}
            type="number"
            step="0.01"
            min="0"
            value={values[field.name]}
            onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
          />
        ))}
      </div>
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <span className={`text-sm font-bold ${isBalanced ? "text-emerald-600" : "text-red-600"}`}>
          Total: {total.toFixed(2)}% {isBalanced ? "" : "(must be exactly 100%)"}
        </span>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-emerald-600">Saved.</span>}
          <Button type="submit" isLoading={isBusy} disabled={!isBalanced}>
            Save Rates
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function AdminCommissionRulesPage() {
  const { data, error, reload } = useApi("/api/commissions/rules/");

  return (
    <AdminOnly>
      <PageShell
        title="Commission Rates"
        description="New rates apply to future sales only. Rates must always total 100%."
      >
        <ErrorNote message={error} />
        {data && <RulesForm key={data.updated_at} rule={data} onSaved={reload} />}
      </PageShell>
    </AdminOnly>
  );
}
