"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Input from "@/components/common/Input";
import AdminClearanceModal from "@/components/wallet/AdminClearanceModal";
import SettlementReceiptModal from "@/components/wallet/SettlementReceiptModal";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  ExternalLink,
  Receipt,
  Banknote,
  AlertTriangle,
  Building,
  Smartphone,
  Loader2,
  ShieldAlert,
} from "lucide-react";

export default function AdminSettlementsPage() {
  const router = useRouter();
  const { user, isAuthenticated, initializeAuth } = useAuthStore();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");

  // Modals
  const [clearanceModalState, setClearanceModalState] = useState({
    isOpen: false,
    request: null,
    mode: "approve",
  });
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const isStaff = Boolean(user?.is_staff || user?.is_superuser || user?.user_type === "ADMIN");

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const loadPendingWithdrawals = useCallback(() => {
    if (!isAuthenticated || !isStaff) return;
    api
      .get("/api/wallet/withdrawals/admin/pending/")
      .then((res) => setPendingRequests(res?.results || []))
      .catch((err) => console.error("Failed to fetch pending withdrawals", err))
      .finally(() => {
        setLoading(false);
        setTimeout(() => setIsRefreshing(false), 300);
      });
  }, [isAuthenticated, isStaff]);

  const refreshPending = () => {
    setIsRefreshing(true);
    loadPendingWithdrawals();
  };

  useEffect(() => {
    loadPendingWithdrawals();
  }, [loadPendingWithdrawals]);

  // Handle successful approval or rejection
  const handleClearanceSuccess = (updatedWithdrawal, receipt) => {
    // Refresh pending queue
    loadPendingWithdrawals();
    // If approved and receipt returned, open the voucher modal so admin can preview/print it
    if (receipt) {
      setActiveReceipt(receipt);
      setIsReceiptModalOpen(true);
    }
  };

  // If user is not staff, deny access
  if (isAuthenticated && !isStaff) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Access Restricted
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          This administration section is restricted to authorized financial officers and system administrators.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button variant="primary" size="sm">
            Back to Member Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // Filter pending requests
  const filteredRequests = pendingRequests.filter((item) => {
    const matchesMethod = filterMethod === "all" || item.payment_method === filterMethod;
    const matchesSearch =
      !searchQuery ||
      item.request_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.account_details?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  const totalPendingAmount = pendingRequests.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Cashout Clearance & Manual Settlement
            </h1>
            <Badge variant="purple" size="md">
              Staff Console
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Review member cashout requests, record external bKash/Bank TrxID, debit member wallets, and issue official settlement vouchers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshPending}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 shadow-2xs transition-all disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-gray-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Pending Queue Count */}
        <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-white to-purple-50/40 p-5 shadow-xs dark:border-purple-950 dark:bg-[#16171B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-purple-700 dark:text-purple-400 uppercase">
              PENDING CLEARANCE REQUESTS
            </span>
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            {pendingRequests.length}
          </div>
          <p className="mt-3 text-xs text-purple-700 dark:text-purple-400 font-medium">
            Requires manual verification and TrxID entry
          </p>
        </div>

        {/* Card 2: Total Pending Amount */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-[#16171B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-gray-500 dark:text-zinc-400 uppercase">
              TOTAL PENDING AMOUNT
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            ৳{totalPendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-zinc-400">
            Awaiting payout dispatch to beneficiaries
          </p>
        </div>

        {/* Card 3: Django Admin Console Link */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-[#16171B] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-gray-500 dark:text-zinc-400 uppercase">
                BACKEND CONSOLE
              </span>
              <ShieldCheck className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 font-bold text-gray-900 dark:text-white text-base">
              Django Admin Portal
            </div>
          </div>
          <div className="mt-3">
            <a
              href="http://127.0.0.1:8000/admin/wallets/withdrawalrequest/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              <span>Open Django Admin Console</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 3. Pending Requests Table Card */}
      <Card className="border-purple-200 dark:border-purple-950">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Member Cashout Requests Requiring Settlement</CardTitle>
              <CardDescription>
                Select &quot;Approve &amp; Settle&quot; to enter external TrxID and debit user wallet, or &quot;Reject&quot; with reason.
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search user, request ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="h-9 px-3 text-xs rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200 focus:outline-none"
              >
                <option value="all">All Channels</option>
                <option value="BKASH">bKash</option>
                <option value="NAGAD">Nagad</option>
                <option value="ROCKET">Rocket</option>
                <option value="BANK">Bank Transfer</option>
                <option value="CASH">Office Cash</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
              <span>Loading pending cashout requests...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-14 text-center text-gray-500 dark:text-zinc-400">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Clearance Queue is Empty
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                There are no pending withdrawal requests awaiting manual clearance right now.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-purple-50/50 text-xs uppercase tracking-wider text-purple-900 dark:bg-purple-950/30 dark:text-purple-300">
                  <tr>
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Beneficiary</th>
                    <th className="py-3 px-4">Channel & Destination</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4 text-center">Settlement Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {filteredRequests.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-gray-900 dark:text-white">
                        {item.request_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 dark:text-white block">
                          @{item.username}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                          {item.payment_method === "BANK" ? (
                            <Building className="h-3.5 w-3.5 text-blue-600" />
                          ) : item.payment_method === "CASH" ? (
                            <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Smartphone className="h-3.5 w-3.5 text-pink-600" />
                          )}
                          <span>{item.payment_method_display}</span>
                        </div>
                        <div className="text-xs font-mono text-gray-600 dark:text-zinc-400 mt-0.5">
                          {item.account_details}
                        </div>
                        {item.note && (
                          <div className="text-[11px] text-gray-400 italic mt-0.5">
                            &quot;{item.note}&quot;
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-right text-sm text-emerald-600 dark:text-emerald-400">
                        ৳{Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              setClearanceModalState({
                                isOpen: true,
                                request: item,
                                mode: "approve",
                              })
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3 gap-1 font-semibold"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve & Settle</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setClearanceModalState({
                                isOpen: true,
                                request: item,
                                mode: "reject",
                              })
                            }
                            className="text-red-600 hover:bg-red-50 border-red-200 text-xs h-7 px-2.5 gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Modal: Admin Clearance (Approve / Reject) */}
      <AdminClearanceModal
        isOpen={clearanceModalState.isOpen}
        onClose={() =>
          setClearanceModalState({ isOpen: false, request: null, mode: "approve" })
        }
        requestItem={clearanceModalState.request}
        mode={clearanceModalState.mode}
        onSuccess={handleClearanceSuccess}
      />

      {/* 5. Modal: Printable Settlement Voucher Preview */}
      <SettlementReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={activeReceipt}
      />
    </div>
  );
}

