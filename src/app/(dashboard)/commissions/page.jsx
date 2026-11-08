"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Badge from "@/components/common/Badge";
import {
  Percent,
  Calculator,
  GitFork,
  Wallet,
  ShieldCheck,
  Building2,
  Award,
  Store,
  RefreshCw,
  Search,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";

const DEFAULT_SIM_AMOUNT = "10000";

const simulate = (amount, onResult) =>
  api
    .post("/api/commissions/simulate/", { sale_amount: amount })
    .then(onResult)
    .catch((e) => console.warn("Failed to simulate", e));

export default function CommissionsPage() {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const [rules, setRules] = useState(null);
  const [history, setHistory] = useState([]);
  const [simAmount, setSimAmount] = useState(DEFAULT_SIM_AMOUNT);
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const loadData = useCallback(() => {
    Promise.all([
      api.get("/api/commissions/rules/"),
      isAuthenticated ? api.get("/api/commissions/history/") : Promise.resolve({ results: [] }),
    ])
      .then(([rulesRes, histRes]) => {
        setRules(rulesRes);
        setHistory(histRes?.results || []);
      })
      .catch((e) => console.warn("Could not load commission data", e))
      .finally(() => {
        setLoading(false);
        setTimeout(() => setIsRefreshing(false), 300);
      });
  }, [isAuthenticated]);

  const refreshData = () => {
    setIsRefreshing(true);
    loadData();
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    simulate(DEFAULT_SIM_AMOUNT, setSimulation);
  }, []);

  const handleAmountChange = (val) => {
    setSimAmount(val);
    if (val && !isNaN(val) && Number(val) > 0) {
      simulate(val, setSimulation);
    }
  };

  // Filter history
  const filteredHistory = history.filter((item) => {
    return (
      !searchQuery ||
      item.source_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.commission_type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              100% Commission Engine & Rules
            </h1>
            <Badge variant="purple" size="md">
              Automated
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Contract-defined 100% revenue distribution across Direct Sales (55%), 10-Tiers (20%), Company (19%), Incentives (5%) & Super Shop (1%).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/wallet">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-emerald-600" />
              <span>Wallet Ledger</span>
            </Button>
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

      {/* 2. Top 5 Distribution Pillars (100% Total) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Pillar 1: Direct Sales Commission */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-white to-blue-50/40 p-4 shadow-xs dark:border-blue-950 dark:bg-[#16171B]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Direct Sales (DSC)
            </span>
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
            {rules?.direct_sales_percent || "55.00"}%
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Direct sponsor reward</p>
        </div>

        {/* Pillar 2: 10-Tier Group Commission */}
        <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-white to-purple-50/40 p-4 shadow-xs dark:border-purple-950 dark:bg-[#16171B]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
              10-Tier Group
            </span>
            <GitFork className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
            20.00%
          </div>
          <p className="text-[11px] text-gray-500 mt-1">L1: 8%, L2: 5%, L3-L10: 7%</p>
        </div>

        {/* Pillar 3: Company Profit */}
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/60 p-4 shadow-xs dark:border-zinc-800 dark:bg-[#16171B]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider">
              Company Profit
            </span>
            <Building2 className="h-4 w-4 text-gray-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
            {rules?.company_profit_percent || "19.00"}%
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Platform operations</p>
        </div>

        {/* Pillar 4: Rank Incentives */}
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50/40 p-4 shadow-xs dark:border-amber-950 dark:bg-[#16171B]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Rank Incentives
            </span>
            <Award className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
            {rules?.incentive_percent || "5.00"}%
          </div>
          <p className="text-[11px] text-gray-500 mt-1">SPP to ELP rank bonus</p>
        </div>

        {/* Pillar 5: Super Shop Share */}
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 p-4 shadow-xs dark:border-emerald-950 dark:bg-[#16171B]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Super Shop
            </span>
            <Store className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
            {rules?.supershop_percent || "1.00"}%
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Merchant outlet bonus</p>
        </div>
      </div>

      {/* 3. Interactive Commission Simulator / Calculator */}
      <Card className="border-blue-200/80 dark:border-blue-900/50 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <CardTitle>Live Commission Simulator</CardTitle>
              </div>
              <CardDescription>
                Simulate any order net profit (Sale Price - Purchase Cost) to see the exact mathematical 100% payout in BDT (৳)
              </CardDescription>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-2">
              {["500", "1000", "2500", "5000"].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleAmountChange(amt)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    simAmount === amt
                      ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  ৳{Number(amt).toLocaleString()} Profit
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Amount Input */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider shrink-0">
              Net Profit Amount:
            </label>
            <div className="relative max-w-xs w-full">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-gray-400">৳</span>
              <Input
                type="number"
                value={simAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-8 font-mono text-base font-bold"
                placeholder="Enter amount in Taka"
              />
            </div>
          </div>

          {/* Results Grid */}
          {simulation && (
            <div className="space-y-4">
              {/* Primary 3 Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                    Direct Sales Commission (55%)
                  </span>
                  <div className="mt-1 text-2xl font-black text-blue-700 dark:text-blue-400">
                    ৳{Number(simulation.direct_sales_commission.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Paid to direct sponsor/seller</p>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
                  <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
                    10-Tier Group Pool (20%)
                  </span>
                  <div className="mt-1 text-2xl font-black text-purple-700 dark:text-purple-400">
                    ৳{Number(simulation.group_commission_total.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Distributed to uplines L1–L10</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Company + Pool Funds (25%)
                  </span>
                  <div className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    ৳{(Number(simulation.company_profit.amount) + Number(simulation.rank_incentive_pool.amount) + Number(simulation.supershop_allocation.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Profit 19% + Incentive 5% + Shop 1%</p>
                </div>
              </div>

              {/* 10-Level Exact Breakdown Bar */}
              <div>
                <span className="text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider block mb-2">
                  10-Level Payout Table for ৳{Number(simAmount).toLocaleString()}:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                  {simulation.levels.map((lvl) => (
                    <div
                      key={lvl.level}
                      className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center"
                    >
                      <div className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                        Level {lvl.level}
                      </div>
                      <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                        {lvl.percentage}%
                      </div>
                      <div className="mt-1.5 font-mono text-sm font-extrabold text-gray-900 dark:text-white">
                        ৳{Number(lvl.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. My Received Commissions Table */}
      {isAuthenticated && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>My Received Commissions History</CardTitle>
                <CardDescription>
                  List of automated payouts credited to your wallet from downline activity
                </CardDescription>
              </div>

              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search downline member..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="py-10 text-center text-gray-500 dark:text-zinc-400">
                <Percent className="mx-auto h-10 w-10 text-gray-300 dark:text-zinc-700 mb-2" />
                <p className="font-medium">No commission entries yet</p>
                <p className="text-xs mt-1">
                  When your downlines purchase packages or retail products, your commissions will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                    <tr>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4">Downline Member</th>
                      <th className="py-3 px-4 text-right">Commission Amount</th>
                      <th className="py-3 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          <Badge variant={item.commission_type === "DSC" ? "info" : "purple"} size="sm">
                            {item.commission_type === "DSC" ? "DSC 55%" : `Level ${item.level}`}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600 dark:text-zinc-400">
                          {item.level ? `L${item.level}` : "Direct"}
                        </td>
                        <td className="py-3 px-4 font-semibold text-xs text-blue-600 dark:text-blue-400">
                          {item.percentage}%
                        </td>
                        <td className="py-3 px-4 text-xs font-medium">
                          @{item.source_username}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +৳{Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

