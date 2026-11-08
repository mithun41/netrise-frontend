"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Coins,
  DollarSign,
  GitFork,
  Layers,
  Package,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";

export default function HomePage() {
  const { isAuthenticated, user, initializeAuth } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    initializeAuth();
    // Load top featured products from API
    api
      .get("/api/products/")
      .then((res) => {
        setProducts(res.results || []);
      })
      .catch((err) => {
        console.warn("Could not fetch products for landing:", err);
      })
      .finally(() => {
        setLoadingProducts(false);
      });
  }, [initializeAuth]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 selection:bg-blue-600 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-blue-50/70 via-white to-white dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-950">
        {/* Glow backdrop elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-400/10 via-indigo-400/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/80 bg-blue-50/90 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-xs font-bold mb-6 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>NetRise Business Operation Branch • Contract: SZIT-20191067</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Empowering Modern Entrepreneurs with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              100% Net Profit Commissions
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base lg:text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Distribute everyday FMCG and wellness goods, earn 55% direct sponsor commission + 20% team generation bonuses across 10 levels, and access physical Super Shop franchises with instant E-Revenue cashouts.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-7 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 gap-2">
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="h-12 px-7 text-sm font-bold bg-[#F7A600] hover:bg-[#e69b00] text-black shadow-lg shadow-amber-500/10 gap-2">
                    <span>Create Member Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-12 px-6 text-sm font-bold border-gray-300 dark:border-zinc-700">
                    Sign In
                  </Button>
                </Link>
              </>
            )}

            <Link href="/products">
              <Button size="lg" variant="outline" className="h-12 px-6 text-sm font-semibold border-gray-200 dark:border-zinc-800 gap-2">
                <ShoppingBag className="h-4 w-4 text-emerald-600" />
                <span>Explore Products</span>
              </Button>
            </Link>
          </div>

          {/* Key Metric Highlights Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-2xs text-left">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">55%</div>
              <div className="text-xs font-bold text-gray-900 dark:text-white mt-1">Direct Sponsor Payout</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Highest upfront reward</div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-2xs text-left">
              <div className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">10 Tiers</div>
              <div className="text-xs font-bold text-gray-900 dark:text-white mt-1">Team Generation Bonus</div>
              <div className="text-[11px] text-gray-500 mt-0.5">20% total depth split</div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-2xs text-left">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">100%</div>
              <div className="text-xs font-bold text-gray-900 dark:text-white mt-1">Net Profit Allocation</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Zero hidden deductions</div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-2xs text-left">
              <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">Instant</div>
              <div className="text-xs font-bold text-gray-900 dark:text-white mt-1">E-Revenue Cashout</div>
              <div className="text-[11px] text-gray-500 mt-0.5">bKash, Nagad, Bank transfer</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 4 PILLARS OF NETRISE BOB */}
      <section className="py-16 md:py-24 border-y border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Ecosystem Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">
              A Complete Business Infrastructure
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-2">
              Designed as a unified commerce platform connecting consumers, affiliate partners, and franchise merchants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                FMCG & Wellness Goods
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Direct distribution of premium organic oils, moringa superfood, and health essentials with consistent turnover and high member reorders.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-4">
                <GitFork className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                10-Tier Affiliate Tree
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Share your personal referral link to build an unlimited-width organization and earn automated generation bonuses down to 10 full tiers.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-4">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Super Shop Franchises
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Empowering local entrepreneurs with digital QR billing, wholesale factory ordering, self-pickup hubs, and 1% referral overrides.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Secure Life & Welfare
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Micro-insurance protection for active partners and a dedicated agency ladder (FA, UM, BM, AM, DRM) with life coverage benefits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS & STARTER PACKAGES */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Turnover Catalog
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">
                Featured Packages & Products
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
                Every purchase generates instant net profit distributed across the affiliate network.
              </p>
            </div>

            <Link href="/products">
              <Button size="sm" variant="outline" className="text-xs gap-1.5 self-start sm:self-auto">
                <span>View Full Shop</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((prod) => {
              const sale = Number(prod.sale_price || prod.dp || 0);
              const profit = Number(prod.profit !== undefined ? prod.profit : (prod.pv || 0));

              return (
                <div
                  key={prod.id}
                  className="group flex flex-col rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:shadow-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-all overflow-hidden"
                >
                  {/* Photo Container */}
                  <div className="h-44 w-full rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.01] transition-transform">
                    {prod.image_url ? (
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 shadow-xs border border-gray-100 dark:border-zinc-800 text-gray-700 dark:text-zinc-300">
                        {prod.is_package ? (
                          <Boxes className="h-10 w-10 text-purple-600" />
                        ) : (
                          <ShoppingBag className="h-10 w-10 text-emerald-600" />
                        )}
                      </div>
                    )}

                    {/* Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      {prod.is_package ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                          {prod.badge || "PACKAGE"}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold">
                          {prod.category_name || "Retail"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="mt-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                        {prod.description || "Official high-quality NetRise turnover product."}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">
                            Sale Price
                          </span>
                          <span className="text-lg font-black text-gray-900 dark:text-white font-mono">
                            ৳{sale.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold block">
                            Net Profit
                          </span>
                          <span className="text-xs font-black text-emerald-600 font-mono">
                            ৳{profit.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Link href="/products" className="block mt-3">
                        <Button size="sm" className="w-full text-xs font-bold bg-[#F7A600] hover:bg-[#e69b00] text-black">
                          Buy Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. COMPENSATION PLAN: 100% PROFIT SPLIT (SECTION ID: #affiliate) */}
      <section id="affiliate" className="py-16 md:py-24 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Transparent Mathematics
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">
              100% Net Profit Compensation Plan
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-2">
              Every taka of net profit (Sale Price - Purchase Cost) is distributed strictly according to our 5-pillar mathematical engine.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Visual Split Card */}
            <div className="p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Coins className="h-5 w-5 text-purple-600" />
                <span>Profit Breakdown per Transaction</span>
              </h3>

              <div className="space-y-3 pt-2">
                {/* 55% Direct Sponsor */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-900 dark:text-white">Direct Sponsor Commission (DSC)</span>
                    <span className="text-blue-600 font-mono">55.0%</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: "55%" }} />
                  </div>
                </div>

                {/* 20% Team Generation */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-900 dark:text-white">Team Generation Bonus (Level 1–10)</span>
                    <span className="text-purple-600 font-mono">20.0%</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: "20%" }} />
                  </div>
                </div>

                {/* 19% Company Profit */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-900 dark:text-white">Company Net Retained Profit</span>
                    <span className="text-gray-700 dark:text-zinc-300 font-mono">19.0%</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-600 rounded-full" style={{ width: "19%" }} />
                  </div>
                </div>

                {/* 5% Incentive Pool */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-900 dark:text-white">Leadership Rank Incentive Pool</span>
                    <span className="text-amber-500 font-mono">5.0%</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "5%" }} />
                  </div>
                </div>

                {/* 1% Super Shop */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-900 dark:text-white">Super Shop Franchise Referral</span>
                    <span className="text-emerald-600 font-mono">1.0%</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "1%" }} />
                  </div>
                </div>
              </div>

              <div className="pt-3 text-[11px] text-gray-500 leading-relaxed border-t border-gray-100 dark:border-zinc-800">
                ★ <strong>Total: 100.0% Allocation.</strong> When an order completes, the engine instantly credits the Direct Sponsor, up to 10 upline generations, contributes to the monthly leadership pool, and updates member wallets in real time.
              </div>
            </div>

            {/* Right: 10 Generation Table */}
            <div className="p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <GitFork className="h-5 w-5 text-blue-600" />
                <span>10-Level Team Generation Matrix</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex justify-between font-bold">
                  <span>Level 1 (Direct)</span>
                  <span className="text-blue-700 dark:text-blue-300 font-mono">8.0%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 flex justify-between font-bold">
                  <span>Level 2</span>
                  <span className="text-purple-700 dark:text-purple-300 font-mono">5.0%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 flex justify-between">
                  <span>Level 3</span>
                  <span className="font-mono font-bold">3.0%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 flex justify-between">
                  <span>Level 4</span>
                  <span className="font-mono font-bold">2.0%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 flex justify-between">
                  <span>Level 5</span>
                  <span className="font-mono font-bold">1.0%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 flex justify-between">
                  <span>Level 6</span>
                  <span className="font-mono font-bold">0.2%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 flex justify-between">
                  <span>Level 7</span>
                  <span className="font-mono font-bold">0.2%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 flex justify-between">
                  <span>Level 8</span>
                  <span className="font-mono font-bold">0.2%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 flex justify-between">
                  <span>Level 9</span>
                  <span className="font-mono font-bold">0.2%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 flex justify-between">
                  <span>Level 10</span>
                  <span className="font-mono font-bold">0.2%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                ✔ <strong>Live Simulator:</strong> You can calculate the exact payout for any amount on our{" "}
                <Link href="/commissions" className="underline font-bold">
                  Live Commission Simulator
                </Link>
                .
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3 STEPS) */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              Simple 3-Step Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">
              Start Your Enterprise in Minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs relative">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Register with a Referral Code
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Open a free account using your upline sponsor’s referral link. Instant placement into the national unilevel tree.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs relative">
              <div className="h-10 w-10 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Activate with Products / Package
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Purchase a minimum of ৳100 in turnover products or choose a starter kit to unlock active Partner (SPP) status and referral privileges.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs relative">
              <div className="h-10 w-10 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Share Link & Withdraw Cash
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Share your digital link across social channels. Receive automated E-Revenue upon sales and withdraw anytime to your mobile wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SUPER SHOP FRANCHISE PROMO */}
      <section className="py-16 md:py-20 border-t border-gray-200 dark:border-zinc-800 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-md bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-3">
                Franchise Partnership
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Open an Authorized Super Shop in Your District
              </h2>
              <p className="text-sm text-blue-100 mt-3 leading-relaxed">
                Receive factory-wholesale inventory prices, earn merchant owner turnover commissions, accept instant QR payments, and serve as the official hub for local member pickups.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <Link href="/super-shop">
                <Button size="lg" className="h-12 px-6 text-sm font-bold bg-[#F7A600] hover:bg-[#e69b00] text-black">
                  Apply for Super Shop
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="h-12 px-6 text-sm font-bold border-white/30 text-white hover:bg-white/10">
                  Register as Member
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
