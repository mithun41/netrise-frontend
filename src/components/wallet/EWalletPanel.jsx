"use client";

import React, { useState } from "react";
import { ArrowLeftRight, PlusCircle, Send, Wallet } from "lucide-react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import FormModal from "@/components/common/FormModal";
import { ListTable, SectionTitle } from "@/components/common/PagePieces";
import { useApi } from "@/hooks/useApi";
import { api } from "@/services/api";
import { formatTaka, statusVariant } from "@/lib/utils";

const PAYMENT_METHODS = [
  { value: "BKASH", label: "bKash" },
  { value: "NAGAD", label: "Nagad" },
  { value: "ROCKET", label: "Rocket" },
  { value: "BANK", label: "Bank Transfer" },
  { value: "CASH", label: "Cash" },
];

const TOPUP_COLUMNS = [
  { key: "request_id", header: "Request" },
  { key: "amount", header: "Amount", render: (value) => formatTaka(value) },
  { key: "payment_method_display", header: "Method" },
  { key: "payment_reference", header: "Reference" },
  {
    key: "status",
    header: "Status",
    render: (value, row) => <Badge variant={statusVariant(value)} size="sm">{row.status_display}</Badge>,
  },
];

export default function EWalletPanel({ wallet, onChanged }) {
  const [openForm, setOpenForm] = useState(null);
  const topups = useApi("/api/wallet/topups/");

  const close = () => setOpenForm(null);
  const done = () => {
    onChanged();
    topups.reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-950/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-blue-700 dark:text-blue-400">
              E-Wallet (Shopping Balance)
            </div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{formatTaka(wallet?.ewallet_balance)}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setOpenForm("topup")}>
            <PlusCircle className="h-3.5 w-3.5" /> Top-up
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOpenForm("internal")}>
            <ArrowLeftRight className="h-3.5 w-3.5" /> E-Revenue → E-Wallet
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOpenForm("member")}>
            <Send className="h-3.5 w-3.5" /> Send to Member
          </Button>
        </div>
      </div>

      {topups.data?.results?.length > 0 && (
        <div className="space-y-2">
          <SectionTitle>My Top-up Requests</SectionTitle>
          <ListTable columns={TOPUP_COLUMNS} rows={topups.data.results} isLoading={topups.isLoading} />
        </div>
      )}

      <FormModal
        isOpen={openForm === "internal"}
        onClose={close}
        title="E-Revenue → E-Wallet"
        description={`Available to move: ${formatTaka(wallet?.available_balance)}`}
        submitLabel="Transfer"
        fields={[{ name: "amount", label: "Amount (৳)", type: "number", required: true }]}
        onSubmit={(values) => api.post("/api/wallet/transfer/to-ewallet/", values).then(done)}
      />
      <FormModal
        isOpen={openForm === "member"}
        onClose={close}
        title="Send to Member"
        description={`E-Wallet balance: ${formatTaka(wallet?.ewallet_balance)}`}
        submitLabel="Send"
        fields={[
          { name: "recipient", label: "Referral code or username", required: true },
          { name: "amount", label: "Amount (৳)", type: "number", required: true },
          { name: "note", label: "Note" },
        ]}
        onSubmit={(values) => api.post("/api/wallet/transfer/to-member/", values).then(done)}
      />
      <FormModal
        isOpen={openForm === "topup"}
        onClose={close}
        title="Top-up E-Wallet"
        description="Pay the company first, then enter the transaction ID. An admin adds the money after checking it."
        submitLabel="Send Request"
        fields={[
          { name: "amount", label: "Amount (৳)", type: "number", required: true },
          { name: "payment_method", label: "Paid via", type: "select", options: PAYMENT_METHODS, required: true },
          { name: "payment_reference", label: "Transaction ID / Slip No.", required: true },
          { name: "note", label: "Note" },
        ]}
        onSubmit={(values) => api.post("/api/wallet/topups/", values).then(done)}
      />
    </div>
  );
}
