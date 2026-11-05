"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  ArrowRight,
  FileCheck,
} from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { api } from "@/services/api";

export default function AdminClearanceModal({
  isOpen,
  onClose,
  requestItem,
  mode = "approve", // "approve" or "reject"
  onSuccess,
}) {
  const [payoutReference, setPayoutReference] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen || !requestItem) return null;

  const isApprove = mode === "approve";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (isApprove && !payoutReference.trim()) {
      setErrorMessage("Please enter an official payment reference / TrxID.");
      return;
    }

    if (!isApprove && !rejectionReason.trim()) {
      setErrorMessage("Please enter a reason for rejecting this cashout request.");
      return;
    }

    setSubmitting(true);
    try {
      if (isApprove) {
        const res = await api.post("/api/wallet/withdrawals/admin/approve/", {
          request_id: requestItem.request_id,
          payout_reference: payoutReference.trim(),
          admin_note: adminNote.trim(),
        });
        if (onSuccess) {
          onSuccess(res.withdrawal, res.receipt);
        }
      } else {
        const res = await api.post("/api/wallet/withdrawals/admin/reject/", {
          request_id: requestItem.request_id,
          rejection_reason: rejectionReason.trim(),
        });
        if (onSuccess) {
          onSuccess(res.withdrawal, null);
        }
      }
      onClose();
    } catch (err) {
      console.error("Admin clearance error:", err);
      setErrorMessage(err.data?.error || err.message || "Failed to process withdrawal clearance.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isApprove
          ? "Approve & Issue Settlement Voucher"
          : "Reject Cash Withdrawal Request"
      }
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Target Request Overview */}
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/40 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-gray-500">Request ID:</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">
              {requestItem.request_id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Beneficiary:</span>
            <span className="font-bold text-gray-800 dark:text-zinc-200">
              @{requestItem.username}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Requested Amount:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              ৳{Number(requestItem.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Channel / Details:</span>
            <span className="text-gray-700 dark:text-zinc-300 font-medium">
              {requestItem.payment_method_display}: {requestItem.account_details}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
            {errorMessage}
          </div>
        )}

        {isApprove ? (
          <>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Official Payout Reference / TrxID <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. bKash TrxID (BL718290), Bank Voucher #"
                value={payoutReference}
                onChange={(e) => setPayoutReference(e.target.value)}
                required
                className="text-xs font-mono"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                This transaction reference will be permanently recorded on the official settlement voucher.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Admin Note / Remarks (Optional)
              </label>
              <Input
                placeholder="e.g. Dispatched from main account, verified by accounts"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Approving will immediately debit <strong>৳{requestItem.amount}</strong> from the user&apos;s wallet and generate an official printable settlement voucher.
              </span>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Invalid account details, unable to verify beneficiary..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          {isApprove ? (
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4" />
                  <span>Approve & Generate Receipt</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Rejecting...</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <span>Confirm Rejection</span>
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}

