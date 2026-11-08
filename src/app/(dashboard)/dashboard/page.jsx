"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import { RANK_NAMES } from "@/lib/constants";
import {
  RefreshCw,
  Clock,
  Users,
  Shield,
  GitFork,
  Copy,
  Check,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Share2,
  Wallet as WalletIcon,
  ShoppingBag,
  Package,
  Store,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated, initializeAuth } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [superShopCount, setSuperShopCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const loadData = useCallback(() => {
    if (!isAuthenticated) return;
    Promise.all([
      api.get("/api/auth/referrals/summary/"),
      api.get("/api/wallet/summary/"),
      api.get("/api/super-shop/directory/").catch(() => ({ results: [] })),
    ])
      .then(([sumRes, walRes, shopRes]) => {
        setSummary(sumRes);
        setWallet(walRes);
        setSuperShopCount(shopRes?.results?.length || 0);
      })
      .catch((e) => console.warn("Could not load dashboard data", e))
      .finally(() => setTimeout(() => setIsRefreshing(false), 400));
  }, [isAuthenticated]);

  const refreshData = () => {
    setIsRefreshing(true);
    loadData();
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const copyReferralLink = () => {
    if (!summary?.referral_link) return;
    navigator.clipboard.writeText(summary.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Greeting & Top Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-400 text-gray-700 dark:border-zinc-600 dark:text-zinc-300">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Hello, {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username || "Member"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Overview of your 10-tier referral team, direct downlines, and rank progression.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/team"
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 shadow-2xs transition-all"
          >
            <GitFork className="h-3.5 w-3.5 text-blue-600" />
            <span>My Team Tree</span>
          </Link>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 shadow-2xs transition-all disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-gray-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: DIRECT REFERRALS */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-[#16171B] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-gray-500 dark:text-zinc-400 uppercase">
              DIRECT REFERRALS (L1)
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {summary?.direct_referrals ?? 0}
            </div>
          </div>
          <div className="mt-4 text-xs text-blue-600 dark:text-blue-400 font-medium">
            8% direct group commission
          </div>
        </div>

        {/* Card 2: TOTAL TEAM SIZE */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-[#16171B] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-gray-500 dark:text-zinc-400 uppercase">
              TOTAL TEAM (L1–L10)
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {summary?.total_team_members ?? 0}
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-zinc-400">
            Across all 10 network levels
          </div>
        </div>

        {/* Card 3: CURRENT RANK */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-[#16171B] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-gray-500 dark:text-zinc-400 uppercase">
              CURRENT RANK
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {user?.current_rank || "SPP"}
            </div>
          </div>
          <div className="mt-4 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {RANK_NAMES[user?.current_rank || "SPP"]}
          </div>
        </div>

        {/* Card 4: E-REVENUE BALANCE */}
        <Link
          href="/wallet"
          className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-[#16171B] flex flex-col justify-between hover:border-emerald-400/80 transition-all group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-gray-500 dark:text-zinc-400 uppercase">
                E-REVENUE WALLET
              </span>
              <WalletIcon className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              ৳{Number(wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-emerald-600 font-semibold">
            <span>View Ledger & Payouts</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* 3. Middle Section: Level Distribution & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 10-Tier Team Distribution (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-[#16171B] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                10-Tier Team Distribution (L1 to L10)
              </h3>
            </div>
            <Link
              href="/team"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              Full tree view <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Bar Distribution across 10 levels */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mt-6">
            {[...Array(10)].map((_, i) => {
              const levelKey = `L${i + 1}`;
              const count = summary?.level_counts?.[levelKey] ?? 0;
              return (
                <div key={levelKey} className="flex flex-col items-center gap-2">
                  <div className="h-28 w-full bg-gray-50 dark:bg-zinc-900/60 rounded-xl flex items-end justify-center p-1 border border-gray-100 dark:border-zinc-800">
                    <div
                      style={{ height: count > 0 ? `${Math.min(count * 30 + 20, 100)}%` : "8%" }}
                      className={`w-full rounded-lg transition-all ${
                        count > 0
                          ? "bg-[#F7A600] shadow-xs"
                          : "bg-gray-200 dark:bg-zinc-800"
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 dark:text-zinc-300">
                    {levelKey}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-between text-xs text-gray-500">
            <span>Direct Level 1: <strong>{summary?.direct_referrals ?? 0} members</strong></span>
            <span>Total Network: <strong>{summary?.total_team_members ?? 0} members</strong></span>
          </div>
        </div>

        {/* Right: Quick Actions & Referral Link (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-[#16171B] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-zinc-800">
              <Share2 className="h-4 w-4 text-[#F7A600]" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Referral Actions
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {/* Copy Link Action */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-200/80 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Your Referral Code
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-black text-gray-900 dark:text-white">
                    {summary?.referral_code || "Loading..."}
                  </span>
                  <button
                    onClick={copyReferralLink}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Shop Packages link */}
              <Link
                href="/products"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#FFF8EB] hover:bg-[#FFEEC7] dark:bg-amber-950/20 dark:hover:bg-amber-950/30 border border-[#FDE5B4] dark:border-amber-900/40 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4 text-[#F7A600]" />
                  <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                    Packages & Products Shop
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#F7A600] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* View Genealogy Tree link */}
              <Link
                href="/team"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#F0F7FF] hover:bg-[#E3EFFF] dark:bg-blue-950/20 dark:hover:bg-blue-950/30 border border-[#D5E7FF] dark:border-blue-900/40 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <GitFork className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                    View Genealogy Tree Diagram
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* My Orders link */}
              <Link
                href="/orders"
                className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">
                    My Orders & Invoices
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Authorized Super Shops link */}
              <Link
                href="/super-shop"
                className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                      Authorized Super Shops
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                      {superShopCount} Active Outlets Nationwide
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-400">
            Sponsor: @{summary?.sponsor?.username || "Direct Leader"}
          </div>
        </div>
      </div>
    </div>
  );
}
