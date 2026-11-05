"use client";

import React, { useState } from "react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import FormModal from "@/components/common/FormModal";
import { AdminOnly, ErrorNote, ListTable, PageShell } from "@/components/common/PagePieces";
import { useApi } from "@/hooks/useApi";
import { api } from "@/services/api";
import { statusVariant } from "@/lib/utils";

const APPROVE_FIELDS = [
  { name: "profit_percent", label: "Agreed profit on sales (%)", type: "number", required: true },
  { name: "shop_signatory", label: "Signed for the shop by", required: true },
  { name: "company_signatory", label: "Signed for the company by", required: true },
  { name: "agreement_terms", label: "Agreement terms", type: "textarea" },
];

export default function AdminSuperShopsPage() {
  const { data, isLoading, error, reload } = useApi("/api/super-shop/admin/");
  const [form, setForm] = useState(null);
  const close = () => setForm(null);
  const act = (values) =>
    api.post(`/api/super-shop/admin/${form.shop.id}/${form.action}/`, values).then(reload);

  const columns = [
    { key: "shop_code", header: "Code" },
    { key: "shop_name", header: "Shop" },
    { key: "merchant_owner_username", header: "Merchant Owner" },
    { key: "district", header: "District" },
    { key: "profit_percent", header: "Profit %" },
    {
      key: "documents",
      header: "Documents",
      render: (documents) =>
        documents.length === 0 ? (
          <span className="text-xs text-amber-600">None</span>
        ) : (
          <div className="flex flex-col items-start gap-0.5">
            {documents.map((document) => (
              <button
                key={document.id}
                className="text-xs text-blue-600 hover:underline"
                onClick={() => api.download(`/api/super-shop/documents/${document.id}/download/`, document.filename)}
              >
                {document.doc_type_display}
              </button>
            ))}
          </div>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => <Badge variant={statusVariant(value)} size="sm">{row.status_display}</Badge>,
    },
    {
      key: "actions",
      header: "",
      render: (_, row) => (
        <div className="flex gap-1.5">
          {row.status !== "APPROVED" && (
            <Button size="sm" onClick={() => setForm({ shop: row, action: "approve" })}>
              Approve
            </Button>
          )}
          {row.status === "PENDING" && (
            <Button size="sm" variant="outline" onClick={() => setForm({ shop: row, action: "reject" })}>
              Reject
            </Button>
          )}
          {row.status === "APPROVED" && (
            <Button size="sm" variant="outline" onClick={() => setForm({ shop: row, action: "suspend" })}>
              Suspend
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminOnly>
      <PageShell
        title="Super Shops (সুপার শপ অনুমোদন)"
        description="A shop opens only after its documents are uploaded and both sides sign the agreement."
      >
        <ErrorNote message={error} />
        <ListTable
          columns={columns}
          rows={data?.results}
          isLoading={isLoading}
          searchKeys={["shop_name", "shop_code", "district", "merchant_owner_username"]}
          emptyTitle="No shop applications yet"
        />
        <FormModal
          key={form?.shop.id}
          isOpen={form?.action === "approve"}
          onClose={close}
          title={`Approve ${form?.shop.shop_name || ""}`}
          submitLabel="Approve"
          fields={APPROVE_FIELDS}
          initial={form?.shop}
          onSubmit={act}
        />
        <FormModal
          key={`note-${form?.shop.id}`}
          isOpen={form?.action === "reject" || form?.action === "suspend"}
          onClose={close}
          title={`${form?.action === "reject" ? "Reject" : "Suspend"} ${form?.shop.shop_name || ""}`}
          submitLabel="Confirm"
          fields={[{ name: "note", label: "Reason", type: "textarea", required: true }]}
          onSubmit={act}
        />
      </PageShell>
    </AdminOnly>
  );
}
