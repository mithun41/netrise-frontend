"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Trash2,
  UserX,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { api } from "@/services/api";

export default function UserDeleteModal({
  isOpen,
  onClose,
  targetUser,
  onSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen || !targetUser) return null;

  // 1. Permanent Delete Action
  const handlePermanentDelete = async () => {
    setSubmitting(true);
    setErrorMessage("");
    try {
      const res = await api.delete(`/api/auth/admin/users/${targetUser.id}/`);
      setSuccessMessage(res?.message || `User @${targetUser.username} has been permanently deleted.`);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1000);
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMessage(err.data?.error || err.message || "Failed to delete user.");
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Suspend / Deactivate Action
  const handleDeactivate = async () => {
    setSubmitting(true);
    setErrorMessage("");
    try {
      const res = await api.delete(`/api/auth/admin/users/${targetUser.id}/?action=deactivate`);
      setSuccessMessage(res?.message || `User @${targetUser.username} has been suspended.`);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1000);
    } catch (err) {
      console.error("Deactivate error:", err);
      setErrorMessage(err.data?.error || err.message || "Failed to suspend user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete User Account (@${targetUser.username})`}
      className="max-w-md"
    >
      <div className="space-y-4 text-xs">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* User Card */}
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gray-900 text-white dark:bg-zinc-700 font-bold flex items-center justify-center text-xs uppercase shrink-0">
              {targetUser.username.substring(0, 2)}
            </div>
            <div className="truncate">
              <div className="font-bold text-gray-900 dark:text-white text-sm">
                @{targetUser.username}
              </div>
              <div className="text-[11px] text-gray-500 truncate">
                {targetUser.first_name} {targetUser.last_name} &bull; {targetUser.email}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-gray-200 dark:border-zinc-700 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-gray-400">Role:</span>{" "}
              <strong className="text-gray-800 dark:text-zinc-200">{targetUser.user_type}</strong>
            </div>
            <div>
              <span className="text-gray-400">Rank:</span>{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">{targetUser.current_rank}</strong>
            </div>
            <div>
              <span className="text-gray-400">Wallet:</span>{" "}
              <strong className="text-gray-900 dark:text-white">৳{Number(targetUser.wallet_balance || 0).toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-gray-400">Downlines:</span>{" "}
              <strong className="text-blue-600">{targetUser.direct_referrals_count || 0} members</strong>
            </div>
          </div>
        </div>

        {/* Confirmation Question */}
        <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
              আপনি কি নিশ্চিত যে আপনি <strong>@{targetUser.username}</strong>-কে ডাটাবেজ থেকে <strong>স্থায়ীভাবে মুছে (Delete)</strong> ফেলতে চান?
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* 1. Primary: Permanent Delete */}
          <Button
            type="button"
            onClick={handlePermanentDelete}
            disabled={submitting}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center gap-2 py-2.5 text-xs shadow-xs"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Trash2 className="h-4 w-4" />
            <span>Yes, Permanently Delete User (স্থায়ীভাবে ডিলিট করুন)</span>
          </Button>

          {/* 2. Secondary: Suspend/Deactivate instead */}
          <Button
            type="button"
            variant="outline"
            onClick={handleDeactivate}
            disabled={submitting}
            className="w-full text-xs text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center justify-center gap-1.5"
          >
            <UserX className="h-3.5 w-3.5 text-amber-600" />
            <span>Or Just Suspend Account (শুধু বন্ধ/নিষ্ক্রিয় করুন)</span>
          </Button>

          {/* Cancel */}
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="w-full text-xs"
          >
            Cancel (বাতিল)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
