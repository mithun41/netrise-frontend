"use client";

import React, { useState } from "react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import FormModal from "@/components/common/FormModal";
import { AdminOnly, ErrorNote, ListTable, PageShell, SectionTitle } from "@/components/common/PagePieces";
import { useAction, useApi } from "@/hooks/useApi";
import { api } from "@/services/api";
import { formatTaka, statusVariant } from "@/lib/utils";

const statusColumn = {
  key: "status",
  header: "Status",
  render: (value, row) => <Badge variant={statusVariant(value)} size="sm">{row.status_display}</Badge>,
};

const POLICY_COLUMNS = [
  { key: "code", header: "Code" },
  { key: "holder_name", header: "Holder" },
  { key: "policy_number", header: "Policy No." },
  { key: "agent_name", header: "Agent" },
  { key: "term_years", header: "Term (Years)" },
  { key: "nominee_name", header: "Nominee" },
];

export default function AdminSecureLifePage() {
  const { data, isLoading, error, reload } = useApi("/api/secure-life/admin/");
  const { isBusy, error: actionError, run } = useAction(reload);
  const [editingRule, setEditingRule] = useState(null);

  const agentColumns = [
    { key: "full_name", header: "Agent" },
    { key: "designation", header: "Designation" },
    { key: "id_number", header: "ID" },
    { key: "company_name", header: "Company" },
    { key: "upline_name", header: "Upline", render: (value) => value || "—" },
    statusColumn,
    {
      key: "actions",
      header: "",
      render: (_, row) =>
        row.status === "PENDING" && (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              disabled={isBusy}
              onClick={() => run(() => api.post(`/api/secure-life/admin/agents/${row.id}/approve/`, {}))}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() => run(() => api.post(`/api/secure-life/admin/agents/${row.id}/reject/`, {}))}
            >
              Reject
            </Button>
          </div>
        ),
    },
  ];

  const requestColumns = [
    { key: "request_id", header: "Request" },
    { key: "agent_name", header: "Agent" },
    { key: "policy_number", header: "Policy No." },
    { key: "premium_amount", header: "Premium", render: (value) => formatTaka(value) },
    {
      key: "payouts",
      header: "Paid",
      render: (payouts) =>
        payouts.map((payout) => `${payout.agent_name}: ${formatTaka(payout.amount)}`).join(", ") || "—",
    },
    statusColumn,
    {
      key: "actions",
      header: "",
      render: (_, row) =>
        row.status === "PENDING" && (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              disabled={isBusy}
              onClick={() =>
                run(() => api.post("/api/secure-life/admin/commissions/approve/", { request_id: row.request_id }))
              }
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() =>
                run(() => api.post("/api/secure-life/admin/commissions/reject/", { request_id: row.request_id }))
              }
            >
              Reject
            </Button>
          </div>
        ),
    },
  ];

  const ruleColumns = [
    { key: "designation", header: "Designation" },
    { key: "percent", header: "Commission %" },
    {
      key: "actions",
      header: "",
      render: (_, row) => (
        <Button size="sm" variant="outline" onClick={() => setEditingRule(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <AdminOnly>
      <PageShell title="Secure Life" description="Agents, policies, commission rates and requests.">
        <ErrorNote message={error || actionError} />
        <div className="space-y-2">
          <SectionTitle>Commission Requests</SectionTitle>
          <ListTable columns={requestColumns} rows={data?.requests} isLoading={isLoading} emptyTitle="No requests yet" />
        </div>
        <div className="space-y-2">
          <SectionTitle>Agents</SectionTitle>
          <ListTable
            columns={agentColumns}
            rows={data?.agents}
            isLoading={isLoading}
            searchKeys={["full_name", "id_number", "company_name"]}
            emptyTitle="No agents yet"
          />
        </div>
        <div className="space-y-2">
          <SectionTitle>Commission Rates by Designation</SectionTitle>
          <ListTable columns={ruleColumns} rows={data?.rules} isLoading={isLoading} />
        </div>
        <div className="space-y-2">
          <SectionTitle>Policies</SectionTitle>
          <ListTable
            columns={POLICY_COLUMNS}
            rows={data?.policies}
            isLoading={isLoading}
            searchKeys={["code", "holder_name", "policy_number", "agent_name"]}
            emptyTitle="No policies yet"
          />
        </div>
        <FormModal
          key={editingRule?.id}
          isOpen={Boolean(editingRule)}
          onClose={() => setEditingRule(null)}
          title={`Rate for ${editingRule?.designation || ""}`}
          fields={[{ name: "percent", label: "Commission (%)", type: "number", required: true }]}
          initial={editingRule}
          onSubmit={(values) => api.patch(`/api/secure-life/admin/rules/${editingRule.id}/`, values).then(reload)}
        />
      </PageShell>
    </AdminOnly>
  );
}
