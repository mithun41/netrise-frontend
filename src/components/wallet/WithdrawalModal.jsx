"use client";

import React, { useState } from "react";
import {
  Banknote,
  Smartphone,
  Building,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Wallet,
  ArrowRight,
} from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { api } from "@/services/api";

const PAYMENT_METHODS = [
  {
    id: "BKASH",
    name: "bKash (বিকাশ)",
    icon: Smartphone,
    desc: "Personal or Merchant Wallet",
    color: "text-pink-600 bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:border-pink-900/60",
    activeRing: "ring-pink-500",
    placeholder: "017XXXXXXXX (Personal bKash Number)",
  },
  {
    id: "NAGAD",
    name: "Nagad (নগদ)",
    icon: Smartphone,
    desc: "Personal or Agent Wallet",
    color: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-900/60",
    activeRing: "ring-orange-500",
    placeholder: "018XXXXXXXX (Nagad Account Number)",
  },
  {
    id: "ROCKET",
    name: "Rocket (রকেট)",
    icon: Smartphone,
    desc: "DBBL Rocket Wallet",
    color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900/60",
    activeRing: "ring-purple-500",
    placeholder: "019XXXXXXXXX (12-digit Rocket Number)",
  },
  {
    id: "BANK",
    name: "Bank Transfer",
    icon: Building,
    desc: "Direct Bangladesh Bank BEFTN/NPSB",
    color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/60",
    activeRing: "ring-blue-500",
    placeholder: "A/C Title, A/C No, Bank & Branch Name, Routing No.",
  },
  {
    id: "CASH",
    name: "Office Cash",
    icon: Banknote,
    desc: "Direct Payout at Dhaka BOB Office",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/60",
    activeRing: "ring-emerald-500",
    placeholder: "Authorized Collector Name & NID / Phone No.",
  },
];

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

export default function WithdrawalModal({ isOpen, onClose, availableBalance = 0, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BKASH");
  const [accountDetails, setAccountDetails] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const numBalance = Number(availableBalance) || 0;
  const numAmount = Number(amount) || 0;
  const remaining = Math.max(0, numBalance - numAmount);

  const selectedMethodObj = PAYMENT_METHODS.find((m) => m.id === paymentMethod);

  const handleQuickAmount = (val) => {
    if (val === "MAX") {
      setAmount(numBalance.toFixed(2));
    } else {
      setAmount(val.toString());
    }
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!amount || numAmount < 50) {
      setErrorMessage("Minimum cash withdrawal amount is ৳50.00.");
      return;
    }

    if (numAmount > numBalance) {
      setErrorMessage(`Requested amount (৳${numAmount.toLocaleString()}) exceeds your available balance (৳${numBalance.toLocaleString()}).`);
      return;
    }

    if (!accountDetails.trim()) {
      setErrorMessage("Please enter the destination account or phone details.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/wallet/withdrawals/request/", {
        amount: numAmount.toFixed(2),
        payment_method: paymentMethod,
        account_details: accountDetails.trim(),
        note: note.trim(),
      });

      setSuccessMessage("Cash withdrawal request submitted successfully! An administrator will review and settle it.");
      if (onSuccess) {
        onSuccess(res.request);
      }
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
        setAmount("");
        setAccountDetails("");
        setNote("");
      }, 1500);
    } catch (err) {
      console.error("Withdrawal error:", err);
      setErrorMessage(err.data?.error || err.message || "Failed to submit cash withdrawal request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Cash Withdrawal (টাকা উত্তোলন)"
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Available Balance Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <Wallet className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Available Wallet Balance
            </span>
          </div>
          <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono">
            ৳{numBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. Payment Method Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
            1. Select Payout Channel (পেমেন্ট মেথড)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethod === method.id;
              const Icon = method.icon;
              return (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? `border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500 shadow-2xs`
                      : `border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-gray-50 dark:hover:bg-zinc-800/50`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4 text-gray-700 dark:text-zinc-300" />
                    {isSelected && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="font-bold text-xs text-gray-900 dark:text-white leading-tight">
                      {method.name}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                      {method.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Amount Input & Quick Buttons */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
              2. Withdrawal Amount (৳ টাকা)
            </label>
            <span className="text-[11px] text-gray-500">Min ৳50.00</span>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-2.5 font-bold text-gray-500 font-mono text-base">
              ৳
            </span>
            <input
              type="number"
              step="0.01"
              min="50"
              max={numBalance}
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErrorMessage("");
              }}
              className="w-full pl-8 pr-3 py-2 text-base font-bold font-mono rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {QUICK_AMOUNTS.filter((val) => val <= numBalance).map((val) => (
              <button
                type="button"
                key={val}
                onClick={() => handleQuickAmount(val)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 transition-colors"
              >
                +৳{val}
              </button>
            ))}
            {numBalance >= 50 && (
              <button
                type="button"
                onClick={() => handleQuickAmount("MAX")}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-100/70 dark:bg-emerald-950/60 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 transition-colors"
              >
                Max Balance (সব)
              </button>
            )}
          </div>
        </div>

        {/* 3. Account Details */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
            3. Destination Details ({selectedMethodObj?.name})
          </label>
          <Input
            placeholder={selectedMethodObj?.placeholder || "Enter details..."}
            value={accountDetails}
            onChange={(e) => {
              setAccountDetails(e.target.value);
              setErrorMessage("");
            }}
            required
            className="text-xs"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Ensure phone number or bank account credentials are correct. Company will process payout to this destination.
          </p>
        </div>

        {/* 4. Note (Optional) */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
            4. Note / Remarks (Optional)
          </label>
          <Input
            placeholder="e.g. Personal bKash, emergency cashout..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Summary Breakdown */}
        {numAmount > 0 && (
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600 dark:text-zinc-400">
              <span>Withdrawal Amount:</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                ৳{numAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-zinc-400">
              <span>Settlement / Cashout Fee:</span>
              <span className="font-mono text-emerald-600 font-bold">৳0.00 (Free)</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-zinc-400">
              <span>Estimated Remaining Balance:</span>
              <span className="font-mono font-bold text-gray-800 dark:text-zinc-200">
                ৳{remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800">
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
            variant="primary"
            size="sm"
            disabled={submitting || numBalance < 50}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Banknote className="h-4 w-4" />
                <span>Submit Cashout Request</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

