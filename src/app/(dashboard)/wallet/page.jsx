"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Badge from "@/components/common/Badge";
import WithdrawalModal from "@/components/wallet/WithdrawalModal";
import EWalletPanel from "@/components/wallet/EWalletPanel";
import SettlementReceiptModal from "@/components/wallet/SettlementReceiptModal";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  RefreshCw,
  GitFork,
  CheckCircle2,
  TrendingUp,
  Loader2,
  Banknote,
  Receipt,
  Clock,
  Building,
  Smartphone,
  SlidersHorizontal,
} from "lucide-react";

export default function WalletPage() {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [myWithdrawals, setMyWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tab State: 'withdrawals' | 'transactions'
  const [activeTab, setActiveTab] = useState("withdrawals");

  // Filters for Transactions
  const [filterType, setFilterType] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const loadAllWalletData = useCallback(() => {
    if (!isAuthenticated) return;
    Promise.all([
      api.get("/api/wallet/summary/"),
      api.get("/api/wallet/transactions/"),
      api.get("/api/wallet/withdrawals/my-requests/"),
    ])
      .then(([sumRes, txnRes, withRes]) => {
        setWallet(sumRes);
        setTransactions(txnRes?.results || []);
        setMyWithdrawals(withRes?.results || []);
      })
      .catch((err) => console.error("Failed to load wallet data", err))
      .finally(() => {
        setLoading(false);
        setTimeout(() => setIsRefreshing(false), 400);
      });
  }, [isAuthenticated]);

  const refreshWallet = () => {
    setIsRefreshing(true);
    loadAllWalletData();
  };

  useEffect(() => {
    loadAllWalletData();
  }, [loadAllWalletData]);

  // Handle successful withdrawal submission
  const handleWithdrawalCreated = (newRequest) => {
    setMyWithdrawals((prev) => [newRequest, ...prev]);
    loadAllWalletData();
  };

  // Open Official Voucher Modal
  const handleViewReceipt = (receipt) => {
    setActiveReceipt(receipt);
    setIsReceiptModalOpen(true);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((txn) => {
    const matchesType = filterType === "all" || txn.transaction_type === filterType;
    const matchesSource = filterSource === "all" || txn.source_type === filterSource;
    const matchesSearch =
      !searchQuery ||
      txn.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.from_user_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.source_type_display?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSource && matchesSearch;
  });

  // Calculate member's pending withdrawals count & amount
  const pendingRequests = myWithdrawals.filter((w) => w.status === "PENDING");
  const pendingAmount = pendingRequests.reduce((sum, w) => sum + Number(w.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              E-Revenue & Cash Wallet (আয় ও উত্তোলন)
            </h1>
            <Badge variant="success" size="md">
              Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Real-time balance, instant cash withdrawal requests, and official printable settlement receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main Action: Request Withdrawal */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold px-4"
          >
            <Banknote className="h-4 w-4" />
            <span>Request Withdrawal (টাকা উত্তোলন)</span>
          </Button>

          <Link href="/team">
            <Button variant="outline" size="sm" className="gap-1.5">
              <GitFork className="h-3.5 w-3.5 text-blue-600" />
              <span>10-Tier Tree</span>
            </Button>
          </Link>

          <button
            onClick={refreshWallet}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 shadow-2xs transition-all disabled:opacity-60"
            title="Refresh balance and ledger"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-gray-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <EWalletPanel wallet={wallet} onChanged={loadAllWalletData} />

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available Balance */}
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 p-5 shadow-xs dark:border-emerald-950 dark:bg-[#16171B] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">
                E-REVENUE AVAILABLE
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              ৳{Number(wallet?.available_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {Number(wallet?.pending_withdrawal || 0) > 0 && (
              <p className="mt-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                ৳{Number(wallet.pending_withdrawal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} on hold for pending withdrawals
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Ready for Payout
            </span>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 underline underline-offset-2"
            >
              Withdraw Now →
            </button>
          </div>
        </div>

        {/* Card 2: Total Earned */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-[#16171B] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-gray-500 dark:text-zinc-400 uppercase">
                TOTAL EARNED (LIFETIME)
              </span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              ৳{Number(wallet?.total_earned || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-zinc-400">
            DSC 55% + L1–L10 Group Commissions
          </div>
        </div>

        {/* Card 3: Total Withdrawn */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-[#16171B] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-gray-500 dark:text-zinc-400 uppercase">
                TOTAL WITHDRAWN
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              ৳{Number(wallet?.total_withdrawn || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 text-xs text-amber-700 dark:text-amber-400 font-medium">
            Settled via bKash / Nagad / Bank
          </div>
        </div>

        {/* Card 4: Pending Payout Requests */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-[#16171B] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-gray-500 dark:text-zinc-400 uppercase">
                PENDING REQUESTS
              </span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              ৳{pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
            <span className="font-semibold text-purple-700 dark:text-purple-400">
              {pendingRequests.length} request(s)
            </span>
            <span>in company processing</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs (User Panel Only) */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("withdrawals")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "withdrawals"
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-t-lg"
              : "border-transparent text-gray-600 dark:text-zinc-400 hover:text-gray-900 hover:border-gray-300"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Cash Withdrawals & Slips (উত্তোলন ও রসিদ)</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-700 text-[11px] dark:bg-zinc-800 dark:text-zinc-300">
            {myWithdrawals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "transactions"
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-t-lg"
              : "border-transparent text-gray-600 dark:text-zinc-400 hover:text-gray-900 hover:border-gray-300"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Ledger & Commission History (লেনদেন খতিয়ান)</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-700 text-[11px] dark:bg-zinc-800 dark:text-zinc-300">
            {transactions.length}
          </span>
        </button>
      </div>

      {/* 4. Tab Content: Withdrawals & Slips */}
      {activeTab === "withdrawals" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Cash Withdrawal Requests & Official Vouchers</CardTitle>
                <CardDescription>
                  Track all your payout requests, settlement statuses, and view or print official company vouchers.
                </CardDescription>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsWithdrawModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <Banknote className="h-4 w-4" />
                <span>New Withdrawal Request</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="py-12 flex justify-center items-center gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                <span>Loading withdrawal history...</span>
              </div>
            ) : myWithdrawals.length === 0 ? (
              <div className="py-14 text-center text-gray-500 dark:text-zinc-400">
                <Banknote className="mx-auto h-12 w-12 text-gray-300 dark:text-zinc-700 mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  No Cash Withdrawals Yet
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                  Once you earn commissions, request your payout via bKash, Nagad, Rocket, or Bank Transfer.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Make Your First Cashout
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                    <tr>
                      <th className="py-3 px-4">Request ID</th>
                      <th className="py-3 px-4">Channel & Account</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Submission Date</th>
                      <th className="py-3 px-4 text-right">Official Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {myWithdrawals.map((req) => {
                      const isApproved = req.status === "APPROVED";
                      const isPending = req.status === "PENDING";
                      const isRejected = req.status === "REJECTED";

                      return (
                        <tr
                          key={req.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                            {req.request_id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                              {req.payment_method === "BANK" ? (
                                <Building className="h-3.5 w-3.5 text-blue-600" />
                              ) : req.payment_method === "CASH" ? (
                                <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Smartphone className="h-3.5 w-3.5 text-pink-600" />
                              )}
                              <span>{req.payment_method_display}</span>
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">
                              {req.account_details}
                            </div>
                            {req.note && (
                              <div className="text-[11px] text-gray-400 italic">
                                Note: {req.note}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black text-right text-sm text-gray-900 dark:text-white">
                            ৳{Number(req.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4">
                            {isApproved && (
                              <Badge variant="success" size="sm" dot>
                                Approved & Paid
                              </Badge>
                            )}
                            {isPending && (
                              <Badge variant="warning" size="sm" dot>
                                Pending Review
                              </Badge>
                            )}
                            {isRejected && (
                              <div>
                                <Badge variant="error" size="sm" dot>
                                  Rejected
                                </Badge>
                                {req.admin_note && (
                                  <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5 max-w-xs">
                                    Reason: {req.admin_note}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(req.created_at).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isApproved && req.receipt ? (
                              <button
                                onClick={() => handleViewReceipt(req.receipt)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all shadow-2xs dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300"
                              >
                                <Receipt className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                                <span>View Voucher (রসিদ)</span>
                              </button>
                            ) : isPending ? (
                              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>In Processing</span>
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 5. Tab Content: Ledger & Commission History */}
      {activeTab === "transactions" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Transaction Ledger & Audit Trail</CardTitle>
                <CardDescription>
                  Detailed itemized record of all credits, level commissions, and payouts
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search TXN, member..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>

                {/* Type filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="h-9 px-3 text-xs rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200 focus:outline-none"
                >
                  <option value="all">All Types (+ / -)</option>
                  <option value="CREDIT">Credits (+)</option>
                  <option value="DEBIT">Debits (-)</option>
                </select>

                {/* Source filter */}
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="h-9 px-3 text-xs rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200 focus:outline-none"
                >
                  <option value="all">All Sources</option>
                  <option value="DSC">Direct Sales Commission (55%)</option>
                  <option value="LEVEL_COMMISSION">Group Level Commission (20%)</option>
                  <option value="INCENTIVE">Incentive (5%)</option>
                  <option value="SUPER_SHOP">Super Shop (1%)</option>
                  <option value="WITHDRAWAL">Cash Withdrawal</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="py-12 flex justify-center items-center gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span>Loading ledger transactions...</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-gray-500 dark:text-zinc-400">
                <Wallet className="mx-auto h-10 w-10 text-gray-300 dark:text-zinc-700 mb-2" />
                <p className="font-medium">No ledger transactions found</p>
                <p className="text-xs mt-1">
                  Commissions will automatically post here when downlines make purchases.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                    <tr>
                      <th className="py-3 px-4">TXN ID</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Source & Description</th>
                      <th className="py-3 px-4">Downline</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Balance After</th>
                      <th className="py-3 px-4">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {filteredTransactions.map((txn) => {
                      const isCredit = txn.transaction_type === "CREDIT";
                      return (
                        <tr key={txn.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                          <td className="py-3.5 px-4 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                            {txn.transaction_id}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isCredit
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                                  : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800/60"
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownLeft className="h-3 w-3" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3" />
                              )}
                              <span>{isCredit ? "Credit (+)" : "Debit (-)"}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span>{txn.source_type_display}</span>
                              {txn.level && (
                                <Badge variant="purple" size="sm">
                                  Level {txn.level}
                                </Badge>
                              )}
                            </div>
                            {txn.description && (
                              <p className="text-xs text-gray-500 mt-0.5 max-w-md truncate">
                                {txn.description}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-gray-700 dark:text-zinc-300">
                            {txn.from_user_username ? `@${txn.from_user_username}` : "—"}
                          </td>
                          <td className={`py-3.5 px-4 font-mono font-bold text-right text-sm ${
                            isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                          }`}>
                            {isCredit ? "+" : "-"}৳{Number(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-right text-xs text-gray-500 dark:text-zinc-400">
                            ৳{Number(txn.balance_after).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(txn.created_at).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 6. Modal: Member Cash Withdrawal Request */}
      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={wallet?.available_balance || 0}
        onSuccess={handleWithdrawalCreated}
      />

      {/* 7. Modal: Official Printable Settlement Voucher / Receipt */}
      <SettlementReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={activeReceipt}
      />
    </div>
  );
}
