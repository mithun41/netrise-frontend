"use client";

import React, { useState } from "react";
import { FilePlus2, HandCoins, ShieldCheck } from "lucide-react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import FormModal from "@/components/common/FormModal";
import { ErrorNote, ListTable, PageShell, SectionTitle, StatGrid } from "@/components/common/PagePieces";
import { useAction, useApi } from "@/hooks/useApi";
import { api } from "@/services/api";
import { formatTaka, statusVariant } from "@/lib/utils";

const POLICY_COLUMNS = [
  { key: "code", header: "Code" },
  { key: "holder_name", header: "Holder" },
  { key: "policy_number", header: "Policy No." },
  { key: "term_years", header: "Term (Years)" },
  { key: "mobile", header: "Mobile" },
  { key: "nominee_name", header: "Nominee" },
];

const REQUEST_COLUMNS = [
  { key: "request_id", header: "Request" },
  { key: "policy_number", header: "Policy No." },
  { key: "premium_amount", header: "Premium", render: (value) => formatTaka(value) },
  {
    key: "status",
    header: "Status",
    render: (value, row) => <Badge variant={statusVariant(value)} size="sm">{row.status_display}</Badge>,
  },
];

function TreeNode({ node }) {
  return (
    <li>
      <div className="text-sm text-gray-800 dark:text-zinc-200">
        <strong>{node.full_name}</strong> &bull; {node.designation} &bull; {node.id_number} &bull; {node.mobile}
      </div>
      {node.children.length > 0 && (
        <ul className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3 dark:border-zinc-700">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

function PhotoUpload({ agent, onUploaded }) {
  const { isBusy, error, run } = useAction(onUploaded);
  const upload = (file) => {
    const body = new FormData();
    body.append("photo", file);
    run(() => api.upload("/api/secure-life/mine/photo/", body));
  };

  return (
    <div className="flex items-center gap-3">
      {agent.photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- uploaded photo served by the API
        <img src={agent.photo} alt={agent.full_name} className="h-14 w-14 rounded-lg object-cover" />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400 dark:bg-zinc-800">
          Photo
        </div>
      )}
      <div>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          disabled={isBusy}
          onChange={(e) => e.target.files[0] && upload(e.target.files[0])}
          className="text-xs dark:text-zinc-300"
        />
        <ErrorNote message={error} />
      </div>
    </div>
  );
}

export default function SecureLifePage() {
  const mine = useApi("/api/secure-life/mine/");
  const policies = useApi("/api/secure-life/policies/");
  const requests = useApi("/api/secure-life/commissions/");
  const [openForm, setOpenForm] = useState(null);
  const close = () => setOpenForm(null);

  const agent = mine.data?.agent;
  const isApproved = agent?.status === "APPROVED";
  const designations = (mine.data?.designations || []).map((value) => ({ value, label: value }));
  const policyOptions = (policies.data?.results || []).map((policy) => ({
    value: policy.id,
    label: `${policy.policy_number} (${policy.holder_name})`,
  }));

  return (
    <PageShell
      title="Secure Life (সুরক্ষিত জীবন)"
      description="Agent profile, policies and commission requests."
      actions={
        <>
          {mine.data && !agent && (
            <Button size="sm" onClick={() => setOpenForm("profile")}>
              <ShieldCheck className="h-3.5 w-3.5" /> Create Agent Profile
            </Button>
          )}
          {isApproved && (
            <>
              <Button size="sm" onClick={() => setOpenForm("policy")}>
                <FilePlus2 className="h-3.5 w-3.5" /> Add Policy
              </Button>
              <Button size="sm" variant="outline" onClick={() => setOpenForm("commission")}>
                <HandCoins className="h-3.5 w-3.5" /> Request Commission
              </Button>
            </>
          )}
        </>
      }
    >
      <ErrorNote message={mine.error} />

      {agent && (
        <>
          <StatGrid
            items={[
              { label: "Status", value: agent.status_display, hint: agent.company_name },
              { label: "Designation", value: agent.designation, hint: `ID: ${agent.id_number}` },
              { label: "Upline", value: agent.upline_name || "—", hint: agent.upline_id_number || "" },
              { label: "Total Earned", value: formatTaka(mine.data.total_earned) },
            ]}
          />
          <PhotoUpload agent={agent} onUploaded={mine.reload} />
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
            <SectionTitle>My Agent Tree</SectionTitle>
            <ul>{mine.data.tree && <TreeNode node={mine.data.tree} />}</ul>
          </div>
          <div className="space-y-2">
            <SectionTitle>Policies</SectionTitle>
            <ListTable
              columns={POLICY_COLUMNS}
              rows={policies.data?.results}
              isLoading={policies.isLoading}
              searchKeys={["code", "holder_name", "policy_number", "mobile"]}
              emptyTitle="No policies yet"
            />
          </div>
          <div className="space-y-2">
            <SectionTitle>Commission Requests</SectionTitle>
            <ListTable
              columns={REQUEST_COLUMNS}
              rows={requests.data?.results}
              isLoading={requests.isLoading}
              emptyTitle="No requests yet"
            />
          </div>
        </>
      )}

      <FormModal
        isOpen={openForm === "profile"}
        onClose={close}
        title="Create Agent Profile"
        submitLabel="Submit"
        fields={[
          { name: "company_name", label: "Company name", required: true },
          { name: "full_name", label: "Your name", required: true },
          { name: "designation", label: "Designation", type: "select", options: designations, required: true },
          { name: "id_number", label: "Agent ID number", required: true },
          { name: "mobile", label: "Mobile number", required: true },
          { name: "upline_id", label: "Upline / sponsor agent ID", help: "Leave empty if you have no upline." },
        ]}
        onSubmit={(values) => api.post("/api/secure-life/mine/", values).then(mine.reload)}
      />
      <FormModal
        isOpen={openForm === "policy"}
        onClose={close}
        title="Add Policy"
        submitLabel="Save"
        fields={[
          {
            name: "code_type",
            label: "Code type",
            type: "select",
            required: true,
            defaultValue: "NR-FA",
            options: [
              { value: "NR-FA", label: "NR-FA" },
              { value: "R-FA", label: "R-FA" },
            ],
          },
          { name: "holder_name", label: "Holder name", required: true },
          { name: "policy_number", label: "Policy number", required: true },
          { name: "term_years", label: "Term (years)", type: "number", min: "1", required: true },
          { name: "mobile", label: "Mobile number", required: true },
          { name: "nominee_name", label: "Nominee name", required: true },
        ]}
        onSubmit={(values) => api.post("/api/secure-life/policies/", values).then(policies.reload)}
      />
      <FormModal
        isOpen={openForm === "commission"}
        onClose={close}
        title="Request Commission"
        description="An admin approves this; you and your uplines are then paid by designation."
        submitLabel="Send Request"
        fields={[
          { name: "policy", label: "Policy", type: "select", options: policyOptions, required: true },
          { name: "premium_amount", label: "Premium amount (৳)", type: "number", required: true },
        ]}
        onSubmit={(values) => api.post("/api/secure-life/commissions/", values).then(requests.reload)}
      />
    </PageShell>
  );
}
