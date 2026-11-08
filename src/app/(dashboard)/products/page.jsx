"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import Card, { CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import OrderModal from "@/components/orders/OrderModal";
import OrderInvoiceModal from "@/components/orders/OrderInvoiceModal";
import {
  ShoppingBag,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Package,
  Wallet,
  ArrowRight,
  TrendingUp,
  Tag,
  Boxes,
  Loader2,
  RefreshCw,
  Percent,
  Layers,
} from "lucide-react";

export default function ProductsPage() {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [packagesOnly, setPackagesOnly] = useState(false);

  // Modals
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const loadData = useCallback(() => {
    Promise.all([
      api.get("/api/products/categories/"),
      api.get("/api/products/"),
      isAuthenticated
        ? api.get("/api/wallet/summary/").catch((e) => console.warn("Could not load wallet in shop", e))
        : null,
    ])
      .then(([catRes, prodRes, walRes]) => {
        setCategories(catRes || []);
        setProducts(prodRes?.results || []);
        if (walRes) setWallet(walRes);
      })
      .catch((err) => console.error("Failed to load products:", err))
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

  const handleOpenOrder = (product) => {
    setSelectedProductForOrder(product);
    setIsOrderModalOpen(true);
  };

  const handleOrderSuccess = (order) => {
    setCompletedOrder(order);
    // Reload wallet balance
    if (isAuthenticated) {
      api.get("/api/wallet/summary/").then((res) => setWallet(res)).catch(() => {});
    }
  };

  // Filtered products
  const filteredProducts = products.filter((item) => {
    if (packagesOnly && !item.is_package) return false;
    if (selectedCategory !== "all" && item.category !== Number(selectedCategory)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name?.toLowerCase().includes(q);
      const matchSku = item.sku?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchDesc) return false;
    }
    return true;
  });

  const availableBalance = Number(wallet?.ewallet_balance || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Header & Quick Wallet Balance Pill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#F7A600]/10 rounded-xl text-[#F7A600]">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Packages & Products
              </h1>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Join with packages or purchase FMCG products. 100% affiliate commission is distributed instantly on net profit.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Wallet Balance Pill */}
          <Link
            href="/wallet"
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-colors shadow-2xs"
            title="View Wallet Ledger"
          >
            <Wallet className="h-4 w-4 text-emerald-600" />
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 leading-none">
                Wallet Balance
              </div>
              <div className="text-sm font-black text-gray-900 dark:text-white font-mono leading-tight">
                ৳{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </Link>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
            className="h-10 px-3 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* My Orders Link */}
          <Link href="/orders">
            <Button size="sm" className="h-10 px-3 text-xs bg-gray-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              <span>My Orders</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Order Success Notification Banner if just placed */}
      {completedOrder && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                Order #{completedOrder.order_number} Placed Successfully!
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                {completedOrder.payment_method === "WALLET"
                  ? "Paid via E-Wallet balance. 100% MLM Commissions have been credited to sponsors & uplines."
                  : "Order confirmed with Cash on Delivery. Uplines will receive commissions upon final delivery."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              size="sm"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              Print Invoice
            </Button>
            <button
              onClick={() => setCompletedOrder(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 text-xs px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 3. Value Proposition Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-white">100% Profit Distribution</div>
            <div className="text-[11px] text-gray-500 dark:text-zinc-400">
              55% direct commission + 20% team generation overrides on net profit.
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 shrink-0">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-white">Dealer Price (DP) Discount</div>
            <div className="text-[11px] text-gray-500 dark:text-zinc-400">
              Members save up to 25% compared to regular retail MRP.
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-white">Dual Payment Support</div>
            <div className="text-[11px] text-gray-500 dark:text-zinc-400">
              Instant checkout with E-Wallet balance or Cash on Delivery.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search packages & products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-[#F7A600] text-gray-900 dark:text-white"
          />
        </div>

        {/* Category Pills & Package Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Packages Only Toggle */}
          <button
            type="button"
            onClick={() => setPackagesOnly(!packagesOnly)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
              packagesOnly
                ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                : "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-100"
            }`}
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>Packages Only</span>
          </button>

          {/* All Categories */}
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              selectedCategory === "all"
                ? "bg-gray-900 dark:bg-white text-white dark:text-black border-transparent shadow-xs"
                : "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-100"
            }`}
          >
            All Categories ({products.length})
          </button>

          {/* Individual Categories */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(String(cat.id))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                selectedCategory === String(cat.id)
                  ? "bg-gray-900 dark:bg-white text-white dark:text-black border-transparent shadow-xs"
                  : "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Products Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7A600] mb-2" />
          <p className="text-xs">Loading commercial catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8">
          <ShoppingBag className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            No products found
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or switching categories.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setPackagesOnly(false);
            }}
            className="mt-4 text-xs"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((prod) => {
            const sale = Number(prod.sale_price || prod.dp || 0);
            const profit = Number(prod.profit !== undefined ? prod.profit : (prod.pv || 0));

            return (
              <div
                key={prod.id}
                className="group relative flex flex-col rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-all hover:shadow-lg hover:border-gray-300 dark:hover:border-zinc-700 overflow-hidden"
              >
                {/* Package / Badge Header */}
                <div className="flex items-center justify-between gap-1.5 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    {prod.is_package ? (
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider border border-purple-200 dark:border-purple-800">
                        {prod.badge || "PACKAGE"}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 text-[10px] font-semibold">
                        {prod.category_name || "General"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnail Photo / Icon Illustration */}
                <div className="h-40 w-full rounded-xl bg-gradient-to-tr from-gray-50 to-gray-100 dark:from-zinc-800/60 dark:to-zinc-800/20 border border-gray-100 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.01] transition-transform">
                  {prod.image_url ? (
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 shadow-xs border border-gray-100 dark:border-zinc-800 text-gray-700 dark:text-zinc-300">
                      {prod.is_package ? (
                        <Boxes className="h-10 w-10 text-purple-600" />
                      ) : (
                        <ShoppingBag className="h-10 w-10 text-emerald-600" />
                      )}
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2.5 font-mono text-[10px] text-gray-700 dark:text-gray-200 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-2xs">
                    {prod.sku}
                  </div>
                </div>

                {/* Product Meta */}
                <div className="mt-3 flex-1 flex flex-col">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {prod.description || "Official NetRise quality product with guaranteed business volume."}
                  </p>

                  {/* Price Section */}
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-1.5">
                    {/* Sale Price */}
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">
                          Price
                        </span>
                        <span className="text-lg font-black text-gray-900 dark:text-white font-mono">
                          ৳{sale.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">
                          Stock
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {prod.stock_quantity} left
                        </span>
                      </div>
                    </div>

                    {/* Profit Margin / Commission Pool Badge */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Commission Profit:</span>
                      </div>
                      <span className="font-mono font-black text-xs text-emerald-700 dark:text-emerald-400">
                        ৳{profit.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-2">
                  <Button
                    onClick={() => handleOpenOrder(prod)}
                    className="w-full text-xs font-bold py-2 bg-[#F7A600] hover:bg-[#e69b00] text-black shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Order Now</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Order Placement Modal */}
      {selectedProductForOrder && (
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => {
            setIsOrderModalOpen(false);
            setSelectedProductForOrder(null);
          }}
          product={selectedProductForOrder}
          userWallet={wallet}
          onSuccess={handleOrderSuccess}
        />
      )}

      {/* 7. Printable Invoice Modal */}
      {completedOrder && (
        <OrderInvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          order={completedOrder}
        />
      )}
    </div>
  );
}

