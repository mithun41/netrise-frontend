"use client";

import React, { useEffect } from "react";
import {
  Printer,
  X,
  CheckCircle2,
  ShieldCheck,
  Receipt,
  User,
  Smartphone,
  Building,
  Banknote,
} from "lucide-react";
import Button from "@/components/common/Button";

export default function SettlementReceiptModal({ isOpen, onClose, receipt }) {
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

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formattedDate = receipt.issued_at
    ? new Date(receipt.issued_at).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "—";

  return (
    <>
      {/* Print-specific style override */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide everything outside the receipt */
          body * {
            visibility: hidden !important;
          }
          #official-printable-receipt,
          #official-printable-receipt * {
            visibility: visible !important;
          }
          #official-printable-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 32px !important;
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-hidden">
        {/* Backdrop click handler */}
        <div
          className="fixed inset-0 no-print"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Window: Constrained to 92vh with internal flex column */}
        <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl z-10 overflow-hidden">
          {/* 1. STICKY TOP CONTROLS (Always Visible, Never Cut Off) */}
          <div className="no-print flex shrink-0 items-center justify-between px-5 py-3.5 bg-gray-50 dark:bg-zinc-800/90 border-b border-gray-200 dark:border-zinc-800 z-20">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Official Settlement Voucher
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="h-3 w-3" />
                Paid
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold text-xs h-8 px-3"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print</span>
              </Button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/80 dark:hover:bg-zinc-700 transition-colors"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 2. SCROLLABLE VOUCHER BODY (Internal Smooth Scroll) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-white text-gray-900">
            <div id="official-printable-receipt" className="space-y-5">
              {/* Header: Company Name & Contract Brand */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b-2 border-emerald-600">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-9 w-9 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-base shadow-xs tracking-tight">
                      NR
                    </span>
                    <div className="leading-tight">
                      <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
                        NETRISE BOB
                      </h2>
                      <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                        Business Operation Branch (Contract: SZIT-20191067)
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    SoftZen IT Multi-Tier E-Commerce & Affiliate Network
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-black tracking-wider uppercase border border-emerald-300">
                    PAYMENT VOUCHER
                  </span>
                  <p className="font-mono text-sm font-bold text-gray-900 mt-1.5">
                    {receipt.receipt_number}
                  </p>
                  <p className="text-xs text-gray-500">
                    Date: {formattedDate}
                  </p>
                </div>
              </div>

              {/* Voucher Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-bold block">
                    REQUEST ID
                  </span>
                  <span className="font-mono font-semibold text-gray-800">
                    {receipt.request_id || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-bold block">
                    TXN LEDGER ID
                  </span>
                  <span className="font-mono font-semibold text-gray-800">
                    {receipt.transaction_id || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-bold block">
                    PAYOUT CHANNEL
                  </span>
                  <span className="font-bold text-gray-900">
                    {receipt.payment_method}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-bold block">
                    STATUS
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    PAID & SETTLED
                  </span>
                </div>
              </div>

              {/* Beneficiary Details Section */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-gray-600" />
                  <span>Beneficiary Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  <div>
                    <span className="text-gray-500">Member Name:</span>{" "}
                    <strong className="text-gray-900">{receipt.full_name}</strong>{" "}
                    <span className="text-gray-500">(@{receipt.username})</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Destination Account:</span>{" "}
                    <strong className="text-gray-900 font-mono">
                      {receipt.account_details || "N/A"}
                    </strong>
                  </div>
                  {receipt.user_phone && (
                    <div>
                      <span className="text-gray-500">Phone:</span>{" "}
                      <span className="text-gray-800 font-mono">{receipt.user_phone}</span>
                    </div>
                  )}
                  {receipt.user_email && (
                    <div>
                      <span className="text-gray-500">Email:</span>{" "}
                      <span className="text-gray-800">{receipt.user_email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Settlement Breakdown (Properly Spaced, No Overlap) */}
              <div className="rounded-xl border-2 border-emerald-600/30 bg-emerald-50/40 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Net Amount */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        SETTLED NET AMOUNT
                      </span>
                      <span className="inline-block border border-emerald-600 bg-white/90 text-emerald-700 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shadow-2xs">
                        ✓ SETTLED & VERIFIED
                      </span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight mt-1">
                      ৳{Number(receipt.amount_paid).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <p className="text-xs text-emerald-800 mt-1 font-medium">
                      Payment Gateway Fee: ৳0.00 (100% Full Payout)
                    </p>
                  </div>

                  {/* Right: Balances & TrxID */}
                  <div className="text-left sm:text-right text-xs space-y-1.5 bg-white/80 p-3 rounded-lg border border-emerald-200/70 sm:min-w-[220px]">
                    <div className="flex sm:justify-end items-center gap-1.5">
                      <span className="text-gray-500 text-[11px]">TrxID / Ref:</span>{" "}
                      <span className="font-mono font-bold text-gray-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {receipt.payout_reference}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      Wallet Before: <span className="font-mono">৳{Number(receipt.balance_before).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-gray-700 font-semibold">
                      Wallet After: <span className="font-mono text-emerald-700">৳{Number(receipt.balance_after).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authorization & Signatures */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-8 text-xs text-center">
                  <div className="pt-6 border-t border-dashed border-gray-400">
                    <p className="font-bold text-gray-800">
                      @{receipt.username}
                    </p>
                    <p className="text-gray-500 text-[11px]">Beneficiary Acknowledgment</p>
                  </div>

                  <div className="pt-6 border-t border-dashed border-gray-400">
                    <p className="font-bold text-gray-800">
                      NetRise BOB Accounts Division
                    </p>
                    <p className="text-gray-500 text-[11px]">Authorized Financial Officer</p>
                  </div>
                </div>

                {/* Security & System Generated Footer */}
                <div className="mt-5 text-center text-[10px] text-gray-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    Official NetRise BOB Computer Generated Settlement Voucher. Valid without manual seal.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. STICKY BOTTOM CONTROLS (Always Visible) */}
          <div className="no-print flex shrink-0 items-center justify-between px-5 py-3 bg-gray-50 dark:bg-zinc-800/90 border-t border-gray-200 dark:border-zinc-800 z-20">
            <span className="text-xs text-gray-500 dark:text-zinc-400 hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-mono text-[10px]">Esc</kbd> or click Close
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs h-8 px-4"
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrint}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs h-8 px-4"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Voucher</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
