"use client";

import React, { useState } from "react";
import {
  Truck,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  User,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { api } from "@/services/api";

const STATUS_CHOICES = [
  { value: "PENDING", label: "Pending Confirmation" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing & Packaging" },
  { value: "SHIPPED", label: "Shipped / In Transit" },
  { value: "DELIVERED", label: "Delivered & Settled" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function OrderStatusModal({ isOpen, order, ...props }) {
  if (!isOpen || !order) return null;
  return <OrderStatusForm key={order.order_number} isOpen={isOpen} order={order} {...props} />;
}

function OrderStatusForm({ isOpen, onClose, order, onSuccess }) {
  const [selectedStatus, setSelectedStatus] = useState(order.status || "PENDING");
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const willTriggerCommission =
    selectedStatus === "DELIVERED" && !order.is_commission_distributed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const res = await api.post("/api/orders/admin/status-update/", {
        order_number: order.order_number,
        status: selectedStatus,
        admin_note: adminNote.trim(),
      });

      setSuccessMessage(
        willTriggerCommission
          ? `Order #${order.order_number} marked DELIVERED! 100% MLM Commissions distributed to uplines.`
          : `Order #${order.order_number} status updated to ${selectedStatus}.`
      );

      if (onSuccess) onSuccess(res.order);

      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1200);
    } catch (err) {
      console.error("Status update error:", err);
      setErrorMessage(err.data?.error || err.message || "Failed to update order status.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Fulfillment: #${order.order_number}`}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

        {/* Order & Recipient Summary Card */}
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/40 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white text-sm">
                <Package className="h-4 w-4 text-blue-600" />
                <span>{order.order_number}</span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                Buyer: @{order.username} &bull; Payment: {order.payment_method_display || order.payment_method}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Total DP</span>
              <div className="font-mono font-black text-gray-900 dark:text-white text-sm">
                ৳{Number(order.total_amount).toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-0.5">
                <Sparkles className="h-2.5 w-2.5" />
                <span>Profit: ৳{Number(order.total_profit !== undefined ? order.total_profit : order.total_pv).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="pt-2 border-t border-gray-200 dark:border-zinc-700 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-gray-800 dark:text-zinc-200 font-semibold">
              <User className="h-3.5 w-3.5 text-gray-400" />
              <span>{order.recipient_name} ({order.recipient_phone})</span>
            </div>
            <div className="flex items-start gap-1.5 text-gray-600 dark:text-zinc-400">
              <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
              <span>{order.shipping_address}, {order.city}</span>
            </div>
          </div>
        </div>

        {/* Status Dropdown Selector */}
        <div className="space-y-1.5">
          <label className="block font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px]">
            New Fulfillment Status *
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F7A600] font-semibold"
          >
            {STATUS_CHOICES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Special Automated Commission Trigger Callout */}
        {willTriggerCommission && (
          <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 dark:text-emerald-300">
              <Zap className="h-4 w-4 text-emerald-600 fill-emerald-600" />
              <span>Automated 100% Commission Distribution Triggered</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800/90 dark:text-emerald-300/90">
              Marking this order as <strong>DELIVERED</strong> will immediately disburse 100% of the net profit (<strong>৳{Number(order.total_profit !== undefined ? order.total_profit : order.total_pv).toLocaleString()}</strong>): 55% direct commission to sponsor and 20% team generation overrides to levels 1–10 uplines.
            </p>
          </div>
        )}

        {/* Courier Consignment Tracking / Admin Note */}
        <div className="space-y-1">
          <label className="block font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px]">
            Courier Consignment / Tracking Note
          </label>
          <Input
            type="text"
            placeholder="e.g. Steadfast Consignment ID: SFC-98124 / Handed to Pathao Courier"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={submitting}
            className={`font-bold text-xs flex items-center gap-1.5 ${
              willTriggerCommission
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                : "bg-[#F7A600] hover:bg-[#e69b00] text-black"
            }`}
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>
              {willTriggerCommission
                ? "Confirm Delivery & Distribute Commissions"
                : "Update Status"}
            </span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

