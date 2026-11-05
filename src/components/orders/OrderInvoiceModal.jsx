"use client";

import React, { useEffect } from "react";
import {
  Printer,
  X,
  CheckCircle2,
  Package,
  Truck,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  Sparkles,
  Wallet,
  Clock,
} from "lucide-react";
import Button from "@/components/common/Button";

export default function OrderInvoiceModal({ isOpen, onClose, order }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "—";

  const isPaid = order.payment_status === "PAID";
  const isDelivered = order.status === "DELIVERED";
  const isWallet = order.payment_method === "WALLET";

  return (
    <>
      {/* Print-specific style override */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          body * {
            visibility: hidden !important;
          }
          #official-printable-invoice,
          #official-printable-invoice * {
            visibility: visible !important;
          }
          #official-printable-invoice {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 28px !important;
            box-shadow: none !important;
            border: 2px solid #059669 !important;
            background: white !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal Backdrop Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-hidden">
        {/* Backdrop click handler */}
        <div
          className="fixed inset-0 no-print"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Window: Constrained to 92vh with internal flex column */}
        <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl z-10 overflow-hidden">
          {/* 1. STICKY TOP CONTROLS */}
          <div className="no-print flex shrink-0 items-center justify-between px-5 py-3.5 bg-gray-50 dark:bg-zinc-800/90 border-b border-gray-200 dark:border-zinc-800 z-20">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
              <Package className="h-4 w-4 text-emerald-600" />
              <span>Official Commercial Order Invoice (অফিসিয়াল চালান ও রশিদ)</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition-colors"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 2. SCROLLABLE INVOICE CONTENT */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100/50 dark:bg-zinc-950/50">
            {/* Printable Document Box */}
            <div
              id="official-printable-invoice"
              className="bg-white text-gray-900 rounded-xl p-6 sm:p-8 border border-gray-300 shadow-sm relative overflow-hidden"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {/* Watermark / Background security motif */}
              <div className="absolute right-[-40px] top-[-40px] w-64 h-64 bg-emerald-50 rounded-full blur-2xl pointer-events-none opacity-60" />

              {/* Header: Company & Invoice Meta */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b-2 border-emerald-600">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-emerald-600 text-white rounded-lg font-black flex items-center justify-center text-sm tracking-wider">
                      NR
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-gray-900">
                        NETRISE BOB
                      </h2>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        BUSINESS OPERATION BRANCH (CONTRACT: SZIT-20191067)
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    SoftZen IT Multi-Tier E-Commerce & Affiliate Network
                  </p>
                </div>

                <div className="text-right sm:self-center">
                  <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold text-xs">
                    TAX INVOICE & ORDER BILL
                  </div>
                  <div className="font-mono text-sm font-black text-gray-800 mt-1">
                    #{order.order_number}
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium">
                    Date: {formattedDate}
                  </div>
                </div>
              </div>

              {/* Order Status & Payment Meta Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-gray-200 text-xs mt-3 bg-gray-50/80 rounded-lg px-3">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">
                    Order Status
                  </span>
                  <span className="font-bold text-gray-900">
                    {order.status_display || order.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">
                    Payment Method
                  </span>
                  <span className="font-bold text-gray-900">
                    {order.payment_method_display || order.payment_method}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">
                    Payment Status
                  </span>
                  <span
                    className={`font-black ${
                      isPaid ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {isPaid ? "✓ PAID & SETTLED" : "UNPAID (COD)"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">
                    Commission Engine
                  </span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    {order.is_commission_distributed ? (
                      <>
                        <Sparkles className="h-3 w-3" />
                        <span>100% Distributed</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Upon Delivery</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-4 rounded-xl border border-gray-200 bg-white">
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-gray-500" />
                    Customer Details
                  </h4>
                  <p className="text-sm font-bold text-gray-900">
                    {order.recipient_name || `@${order.username}`}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-gray-400" />
                    {order.recipient_phone || "Not provided"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    Member Account: @{order.username}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-500" />
                    Shipping & Delivery Address
                  </h4>
                  <p className="text-xs text-gray-800 leading-relaxed font-medium">
                    {order.shipping_address}
                  </p>
                  <p className="text-xs font-semibold text-gray-600 mt-1">
                    City: {order.city || "Dhaka"}
                  </p>
                  {order.notes && (
                    <p className="text-[11px] text-gray-500 italic mt-1 bg-yellow-50 p-1.5 rounded border border-yellow-100">
                      Note: {order.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Itemized Products Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200 my-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 font-mono">SKU</th>
                      <th className="py-2.5 px-3 text-right">Unit DP</th>
                      <th className="py-2.5 px-3 text-right">PV</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Total DP</th>
                      <th className="py-2.5 px-3 text-right">Total PV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-3 font-mono text-gray-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-gray-900">
                            {item.product_name}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500">
                            {item.product_sku}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            ৳{Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-bold">
                            ৳{Number(item.unit_pv).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                            ৳{Number(item.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                            ৳{Number(item.subtotal_pv).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="py-4 text-center text-gray-500">
                          No items in this order.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals & Grand Sum */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 my-4">
                <div className="space-y-1">
                  <div className="text-xs text-gray-600">
                    Total MRP Value:{" "}
                    <span className="font-mono line-through">
                      ৳{Number(order.total_mrp || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-800">
                    Total Business Volume (PV):{" "}
                    <span className="font-mono font-black text-emerald-700">
                      ৳{Number(order.total_pv || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {order.commission_reference && (
                    <div className="text-[11px] font-mono text-gray-500">
                      Commission Engine Ref: {order.commission_reference}
                    </div>
                  )}
                </div>

                <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                  <span className="text-[11px] text-gray-500 uppercase font-black tracking-wider block">
                    Total Payable / Paid (DP)
                  </span>
                  <div className="text-2xl font-black text-gray-900 font-mono">
                    ৳{Number(order.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    Zero Shipping Fee / Direct Warehouse Dispatch
                  </span>
                </div>
              </div>

              {/* Signatures & Official Stamp */}
              <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-dashed border-gray-300 text-center text-xs">
                <div>
                  <div className="h-10 border-b border-gray-400 mx-auto w-44" />
                  <p className="mt-1 font-semibold text-gray-800">@{order.username}</p>
                  <p className="text-[10px] text-gray-500">Member / Customer Signature</p>
                </div>
                <div>
                  <div className="h-10 border-b border-gray-400 mx-auto w-44" />
                  <p className="mt-1 font-semibold text-gray-800">Warehouse Fulfillment</p>
                  <p className="text-[10px] text-gray-500">Authorized Officer (NetRise BOB)</p>
                </div>
              </div>

              {/* Legal Footnote */}
              <div className="mt-6 pt-3 border-t border-gray-200 text-center text-[10px] text-gray-400">
                This invoice is electronically generated and digitally authenticated by NetRise BOB under SoftZen IT Enterprise Architecture. Contract: SZIT-20191067.
              </div>
            </div>
          </div>

          {/* 3. STICKY BOTTOM ACTIONS */}
          <div className="no-print flex shrink-0 items-center justify-between px-5 py-3.5 bg-gray-50 dark:bg-zinc-800/90 border-t border-gray-200 dark:border-zinc-800 z-20">
            <div className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Audit Verified Order Invoice</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={handlePrint}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

