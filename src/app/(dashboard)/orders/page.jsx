"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import Button from "@/components/common/Button";
import OrderInvoiceModal from "@/components/orders/OrderInvoiceModal";
import {
  Package,
  ShoppingBag,
  Sparkles,
  Search,
  RefreshCw,
  Printer,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  FileText,
  Wallet,
  ArrowRight,
  Loader2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function MyOrdersPage() {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Invoice Modal
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const loadOrders = useCallback(() => {
    if (!isAuthenticated) return;
    api
      .get("/api/orders/my-orders/")
      .then((res) => setOrders(res?.results || []))
      .catch((err) => console.error("Failed to load orders:", err))
      .finally(() => {
        setLoading(false);
        setTimeout(() => setIsRefreshing(false), 300);
      });
  }, [isAuthenticated]);

  const refreshOrders = () => {
    setIsRefreshing(true);
    loadOrders();
  };

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleOpenInvoice = (order) => {
    setSelectedOrderForInvoice(order);
    setIsInvoiceModalOpen(true);
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.order_number?.toLowerCase().includes(q);
      const matchName = o.recipient_name?.toLowerCase().includes(q);
      const matchCity = o.city?.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchCity) return false;
    }
    return true;
  });

  // Calculate order statistics
  const totalOrdersCount = orders.length;
  const totalSpentAmount = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalPvGenerated = orders.reduce((sum, o) => sum + Number(o.total_pv || 0), 0);
  const activeOrdersCount = orders.filter((o) => ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(o.status)).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                My Orders & Deliveries (আমার অর্ডার সমূহ)
              </h1>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Track order progress, verify Point Value (PV) commission distribution, and download printable invoices.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshOrders}
            disabled={isRefreshing}
            className="h-10 px-3 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Shop Packages */}
          <Link href="/products">
            <Button size="sm" className="h-10 px-4 text-xs bg-[#F7A600] hover:bg-[#e69b00] text-black font-bold flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Shop Packages & Products</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Order Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Orders
            </span>
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
            {totalOrdersCount}
          </div>
          <span className="text-[10px] text-gray-400">Lifetime purchases</span>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Spent (DP)
            </span>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
            ৳{totalSpentAmount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">Net Dealer Price</span>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Total PV Volume
            </span>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 dark:text-purple-400 font-mono mt-1">
            ৳{totalPvGenerated.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-purple-600 font-semibold">100% Commissionable</span>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              In-Fulfillment
            </span>
            <Truck className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {activeOrdersCount}
          </div>
          <span className="text-[10px] text-gray-400">Processing / In Transit</span>
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order #, recipient name, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-[#F7A600] text-gray-900 dark:text-white"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["all", "CONFIRMED", "DELIVERED", "PENDING", "CANCELLED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                statusFilter === st
                  ? "bg-gray-900 dark:bg-white text-white dark:text-black border-transparent shadow-xs"
                  : "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-100"
              }`}
            >
              {st === "all" ? "All Orders" : st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Orders Table / List */}
      <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#F7A600] mb-2" />
            <p className="text-xs">Loading order ledger...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center p-8">
            <Package className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              No orders found
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              You haven&apos;t placed any orders matching this criteria yet. Browse our packages and product catalog to get started.
            </p>
            <Link href="/products" className="inline-block mt-4">
              <Button size="sm" className="text-xs bg-[#F7A600] text-black font-bold">
                Browse Shop Now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Ordered Items</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Payable (DP)</th>
                  <th className="py-3 px-4 text-right">Point Value</th>
                  <th className="py-3 px-4 text-center">Fulfillment</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-gray-800 dark:text-zinc-200">
                {filteredOrders.map((order) => {
                  const isPaid = order.payment_status === "PAID";
                  const isDelivered = order.status === "DELIVERED";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Order Number */}
                      <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-gray-400" />
                          <span>{order.order_number}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 block font-sans font-normal">
                          To: {order.recipient_name || `@${order.username}`}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-gray-500 dark:text-zinc-400 whitespace-nowrap">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>

                      {/* Ordered Items Summary */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((it, idx) => (
                              <div
                                key={it.id || idx}
                                className="truncate text-[11px] font-medium text-gray-900 dark:text-zinc-200"
                              >
                                {it.quantity}x {it.product_name}
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">No item info</span>
                          )}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {order.payment_method_display || order.payment_method}
                        </div>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {isPaid ? "✓ Paid" : "Unpaid (COD)"}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        ৳{Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Total PV */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                          ৳{Number(order.total_pv).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        {order.is_commission_distributed ? (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-end gap-0.5">
                            <Sparkles className="h-2.5 w-2.5" />
                            <span>100% Shared</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">On Delivery</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : order.status === "CONFIRMED"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              : order.status === "CANCELLED"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {order.status === "DELIVERED" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          <span>{order.status_display || order.status}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenInvoice(order)}
                          className="h-8 px-2.5 text-xs font-semibold flex items-center gap-1.5 mx-auto hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-300 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Invoice (চালান)</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Printable Invoice Modal */}
      {selectedOrderForInvoice && (
        <OrderInvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setSelectedOrderForInvoice(null);
          }}
          order={selectedOrderForInvoice}
        />
      )}
    </div>
  );
}

