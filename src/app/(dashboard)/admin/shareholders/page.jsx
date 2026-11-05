"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/common/Button";
import FormModal from "@/components/common/FormModal";
import { AdminOnly, ErrorNote, ListTable, PageShell, SectionTitle, StatGrid } from "@/components/common/PagePieces";
import { useApi } from "@/hooks/useApi";
import { api } from "@/services/api";
import { formatDate, formatTaka } from "@/lib/utils";

const HOLDER_FIELDS = [
  { name: "name", label: "Name", required: true },
  { name: "phone", label: "Mobile number" },
  { name: "email", label: "Email", type: "email" },
  { name: "nid_number", label: "NID number" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "joined_on", label: "Joined on", type: "date" },
  { name: "notes", label: "Notes", type: "textarea" },
];

const ENTRY_TYPES = [
  { value: "INVESTMENT", label: "Investment" },
  { value: "WITHDRAWAL", label: "Withdrawal" },
  { value: "DIVIDEND", label: "Dividend Paid" },
];

const ENTRY_COLUMNS = [
  { key: "entry_date", header: "Date", render: (value) => formatDate(value) },
  { key: "shareholder_name", header: "Shareholder" },
  { key: "entry_type_display", header: "Type" },
  { key: "amount", header: "Amount", render: (value) => formatTaka(value) },
  { key: "shares", header: "Shares" },
  { key: "reference", header: "Reference" },
];

export default function AdminShareholdersPage() {
  const holders = useApi("/api/shareholders/");
  const entries = useApi("/api/shareholders/entries/");
  const [form, setForm] = useState(null);
  const close = () => setForm(null);
  const holderOptions = (holders.data?.results || []).map((holder) => ({ value: holder.id, label: holder.name }));

  const columns = [
    { key: "name", header: "Shareholder" },
    { key: "phone", header: "Mobile" },
    { key: "shares", header: "Shares" },
    { key: "ownership_percent", header: "Ownership %" },
    { key: "invested", header: "Invested", render: (value) => formatTaka(value) },
    { key: "dividends", header: "Dividends", render: (value) => formatTaka(value) },
    {
      key: "actions",
      header: "",
      render: (_, row) => (
        <Button size="sm" variant="outline" onClick={() => setForm({ type: "holder", row })}>
          Edit
        </Button>
      ),
    },
  ];

  const saveHolder = (values) => {
    const body = { ...values, joined_on: values.joined_on || null };
    const request = form.row ? api.patch(`/api/shareholders/${form.row.id}/`, body) : api.post("/api/shareholders/", body);
    return request.then(holders.reload);
  };

  const saveEntry = (values) =>
    api.post("/api/shareholders/entries/", { ...values, shares: values.shares || 0 }).then(() => {
      holders.reload();
      entries.reload();
    });

  return (
    <AdminOnly>
      <PageShell
        title="Shareholders (শেয়ারহোল্ডার)"
        description="Shareholder records and their investment, withdrawal and dividend history."
        actions={
          <>
            <Button size="sm" onClick={() => setForm({ type: "holder" })}>
              <Plus className="h-3.5 w-3.5" /> Add Shareholder
            </Button>
            <Button size="sm" variant="outline" onClick={() => setForm({ type: "entry" })}>
              <Plus className="h-3.5 w-3.5" /> Add Entry
            </Button>
          </>
        }
      >
        <ErrorNote message={holders.error || entries.error} />
        <StatGrid
          items={[
            { label: "Total Shares", value: holders.data?.total_shares ?? 0 },
            { label: "Total Invested", value: formatTaka(holders.data?.total_invested) },
            { label: "Dividends Paid", value: formatTaka(holders.data?.total_dividends) },
          ]}
        />
        <ListTable
          columns={columns}
          rows={holders.data?.results}
          isLoading={holders.isLoading}
          searchKeys={["name", "phone"]}
          emptyTitle="No shareholders yet"
        />
        <div className="space-y-2">
          <SectionTitle>Entries</SectionTitle>
          <ListTable columns={ENTRY_COLUMNS} rows={entries.data?.results} isLoading={entries.isLoading} emptyTitle="No entries yet" />
        </div>
        <FormModal
          key={form?.row?.id ?? "new"}
          isOpen={form?.type === "holder"}
          onClose={close}
          title={form?.row ? `Edit ${form.row.name}` : "Add Shareholder"}
          fields={HOLDER_FIELDS}
          initial={form?.row}
          onSubmit={saveHolder}
        />
        <FormModal
          isOpen={form?.type === "entry"}
          onClose={close}
          title="Add Entry"
          fields={[
            { name: "shareholder", label: "Shareholder", type: "select", options: holderOptions, required: true },
            { name: "entry_type", label: "Type", type: "select", options: ENTRY_TYPES, required: true },
            { name: "amount", label: "Amount (৳)", type: "number", required: true },
            { name: "shares", label: "Shares", type: "number" },
            { name: "entry_date", label: "Date", type: "date", required: true },
            { name: "reference", label: "Reference" },
            { name: "note", label: "Note", type: "textarea" },
          ]}
          onSubmit={saveEntry}
        />
      </PageShell>
    </AdminOnly>
  );
}
