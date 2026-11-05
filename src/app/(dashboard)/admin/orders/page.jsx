"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import Button from "@/components/common/Button";
import OrderStatusModal from "@/components/admin/OrderStatusModal";
import OrderInvoiceModal from "@/components/orders/OrderInvoiceModal";
import {
  Truck,
  Package,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Sparkles,
  Wallet,
  ShieldAlert,
  Loader2,
  MapPin,
  Phone,
  User,
  Zap,
} from "lucide-react";

export default function AdminOrdersPage() {
  const { user, isAuthenticated, initializeAuth } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    total_revenue: 0,
    total_pv_distributed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Staff check
  const isStaff = Boolean(user?.is_staff || user?.is_superuser || user?.user_type === "ADMIN");

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const loadOrdersData = () =>
    api
      .get("/api/orders/admin/all/")
      .then((res) => {
        setOrders(res?.results || []);
        if (res?.stats) setStats(res.stats);
      })
      .catch((err) => {
        if (err.status !== 403 && err.status !== 401) {
          console.error("Failed to load admin orders:", err);
        }
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => setIsRefreshing(false), 300);
      });

  const refreshOrders = () => {
    setIsRefreshing(true);
    loadOrdersData();
  };

  useEffect(() => {
    if (isAuthenticated && isStaff) {
      loadOrdersData();
    }
  }, [isAuthenticated, isStaff]);

  // Open Status modal
  const handleOpenStatus = (order) => {
    setSelectedOrderForStatus(order);
    setIsStatusModalOpen(true);
  };

  // Open Invoice modal
  const handleOpenInvoice = (order) => {
    setSelectedOrderForInvoice(order);
    setIsInvoiceModalOpen(true);
  };

  if (isAuthenticated && !isStaff) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 inline-block mb-3 border border-rose-200">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Access Restricted (শুধুমাত্র অ্যাডমিন)
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Only verified administrators and dispatch officers can access warehouse order fulfillment.
        </p>
        <Link href="/dashboard" className="inline-block mt-4">
          <Button size="sm" variant="outline" className="text-xs">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (paymentFilter !== "all" && o.payment_method !== paymentFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.order_number?.toLowerCase().includes(q);
      const matchUser = o.username?.toLowerCase().includes(q);
      const matchName = o.recipient_name?.toLowerCase().includes(q);
      const matchPhone = o.recipient_phone?.toLowerCase().includes(q);
      const matchCity = o.city?.toLowerCase().includes(q);
      const matchNotes = o.notes?.toLowerCase().includes(q);
      if (!matchNum && !matchUser && !matchName && !matchPhone && !matchCity && !matchNotes) {
        return false;
      }
    }

    return true;
  });

  const awaitingCount = stats.pending + stats.confirmed + stats.processing;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 rounded-xl text-purple-600">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Orders Fulfillment & Delivery
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Process member purchases, assign courier tracking numbers, and release 100% MLM commissions upon final delivery.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshOrders}
            disabled={isRefreshing}
            className="h-9 px-3 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Quick Shop View link */}
          <Link href="/products">
            <Button
              size="sm"
              className="h-9 px-3.5 text-xs bg-gray-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold flex items-center gap-1.5"
            >
              <Package className="h-4 w-4" />
              <span>Catalog Shop</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Orders
            </span>
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
            {stats.total}
          </div>
          <span className="text-[10px] text-gray-400">Lifetime purchases</span>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Awaiting Dispatch
            </span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {awaitingCount}
          </div>
          <span className="text-[10px] text-amber-600 font-semibold">
            {stats.pending} pending, {stats.processing} processing
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              In Transit (Shipped)
            </span>
            <Truck className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600 font-mono mt-1">
            {stats.shipped}
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold">Courier dispatched</span>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Delivered & Settled
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {stats.delivered}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">
            ৳{stats.total_pv_distributed.toLocaleString()} PV distributed
          </span>
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order #, username, recipient, phone, or tracking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-[#F7A600] text-gray-900 dark:text-white"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All" },
            { id: "PENDING", label: "Pending" },
            { id: "PROCESSING", label: "Processing" },
            { id: "SHIPPED", label: "In Transit" },
            { id: "DELIVERED", label: "Delivered" },
            { id: "CANCELLED", label: "Cancelled" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                statusFilter === st.id
                  ? "bg-purple-900 text-white border-purple-900 shadow-xs dark:bg-purple-600 dark:border-purple-600"
                  : "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-100"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Orders Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#F7A600] mb-2" />
            <p className="text-xs">Loading orders fulfillment registry...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center p-8">
            <Truck className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              No orders found
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No fulfillment records matching your current filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Recipient & Destination</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Payable (DP)</th>
                  <th className="py-3 px-4 text-right">Commission PV</th>
                  <th className="py-3 px-4 text-center">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
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
                      {/* Order Number & Buyer */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-gray-900 dark:text-white text-xs">
                          {order.order_number}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Buyer: <span className="font-semibold text-blue-600 dark:text-blue-400">@{order.username}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 block font-mono">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </span>
                      </td>

                      {/* Recipient & Destination */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 dark:text-white text-xs">
                          {order.recipient_name}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{order.recipient_phone}</span>
                        </div>
                        <div className="text-[11px] text-gray-600 dark:text-zinc-400 flex items-start gap-1 mt-0.5 max-w-xs">
                          <MapPin className="h-3 w-3 text-gray-400 shrink-0 mt-0.5" />
                          <span className="truncate">{order.shipping_address}, {order.city}</span>
                        </div>
                        {order.notes && (
                          <div className="text-[10px] text-purple-700 dark:text-purple-300 font-mono bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded mt-1 truncate max-w-xs">
                            {order.notes}
                          </div>
                        )}
                      </td>

                      {/* Items Summary */}
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
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
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
                          <span className="text-[10px] text-amber-600 font-semibold">
                            Pending Delivery
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : order.status === "SHIPPED"
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                              : order.status === "PROCESSING"
                              ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
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

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Update Status Button */}
                          <Button
                            size="sm"
                            onClick={() => handleOpenStatus(order)}
                            className="h-7 px-2.5 text-xs font-semibold bg-[#F7A600] hover:bg-[#e69b00] text-black flex items-center gap-1 shadow-2xs"
                            title="Update Courier / Delivery Status"
                          >
                            <Truck className="h-3 w-3" />
                            <span>Update</span>
                          </Button>

                          {/* Print Invoice Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenInvoice(order)}
                            className="h-7 px-2 text-xs font-semibold flex items-center gap-1 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-300 transition-colors"
                            title="View / Print Tax Invoice"
                          >
                            <FileText className="h-3 w-3" />
                            <span>Invoice</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Order Status Update Modal */}
      <OrderStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedOrderForStatus(null);
        }}
        order={selectedOrderForStatus}
        onSuccess={() => loadOrdersData()}
      />

      {/* 6. Order Printable Invoice Modal */}
      <OrderInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedOrderForInvoice(null);
        }}
        order={selectedOrderForInvoice}
      />
    </div>
  );
}

