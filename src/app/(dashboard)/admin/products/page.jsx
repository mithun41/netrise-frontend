"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import Button from "@/components/common/Button";
import ProductEditModal from "@/components/admin/ProductEditModal";
import CategoryCreateModal from "@/components/admin/CategoryCreateModal";
import {
  Boxes,
  Plus,
  Search,
  RefreshCw,
  Edit,
  FolderPlus,
  Sparkles,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Loader2,
  Package,
  Layers,
  TrendingUp,
} from "lucide-react";

export default function AdminProductsPage() {
  const { user, isAuthenticated, initializeAuth } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    packages: 0,
    standard: 0,
    low_stock: 0,
    inactive: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Access guard
  const isStaff = Boolean(user?.is_staff || user?.is_superuser || user?.user_type === "ADMIN");

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const loadAllData = () =>
    Promise.all([
      api.get("/api/products/admin/all/"),
      api.get("/api/products/categories/"),
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes?.results || []);
        if (prodRes?.stats) setStats(prodRes.stats);
        setCategories(catRes || []);
      })
      .catch((err) => {
        if (err.status !== 403) {
          console.error("Failed to load admin products:", err);
        }
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => setIsRefreshing(false), 300);
      });

  const refreshProducts = () => {
    setIsRefreshing(true);
    loadAllData();
  };

  useEffect(() => {
    if (isAuthenticated && isStaff) {
      loadAllData();
    }
  }, [isAuthenticated, isStaff]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  // Toggle active status
  const handleToggleActive = async (prod) => {
    try {
      await api.patch(`/api/products/admin/${prod.id}/`, {
        is_active: !prod.is_active,
      });
      loadAllData();
    } catch (err) {
      console.error("Failed to toggle status:", err);
      alert("Failed to update status.");
    }
  };

  if (isAuthenticated && !isStaff) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 inline-block mb-3 border border-rose-200">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Access Restricted
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Only verified company staff and administrators can manage products, packages, and pricing.
        </p>
        <Link href="/dashboard" className="inline-block mt-4">
          <Button size="sm" variant="outline" className="text-xs">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (filterType === "packages" && !p.is_package) return false;
    if (filterType === "standard" && p.is_package) return false;
    if (filterType === "inactive" && p.is_active) return false;
    if (filterType === "low_stock" && p.stock_quantity > 10) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      const matchCat = p.category_name?.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 rounded-xl text-purple-600">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Product & Package Management
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Add new products, configure purchase cost vs sale price, and monitor profit margins distributed through the commission engine.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshProducts}
            disabled={isRefreshing}
            className="h-9 px-3 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Add Category */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCategoryModalOpen(true)}
            className="h-9 px-3 text-xs flex items-center gap-1.5 border-dashed"
          >
            <FolderPlus className="h-3.5 w-3.5 text-blue-600" />
            <span>+ Add Category</span>
          </Button>

          {/* Add Product / Package */}
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-9 px-3.5 text-xs bg-[#F7A600] hover:bg-[#e69b00] text-black font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add New Product / Package</span>
          </Button>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Catalog Items
            </span>
            <Boxes className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
            {stats.total}
          </div>
          <span className="text-[10px] text-gray-400">Products & Packages</span>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Active Packages
            </span>
            <Award className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
            {stats.packages}
          </div>
          <span className="text-[10px] text-purple-600 font-semibold">Rank-bearing packages</span>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Consumer Goods
            </span>
            <Package className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {stats.standard}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">Standard items</span>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Low Stock Alert
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {stats.low_stock}
          </div>
          <span className="text-[10px] text-amber-600 font-semibold">&le; 10 units remaining</span>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-[#F7A600] text-gray-900 dark:text-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Items" },
            { id: "packages", label: "Packages Only" },
            { id: "standard", label: "Standard Products" },
            { id: "low_stock", label: "Low Stock" },
            { id: "inactive", label: "Inactive" },
          ].map((flt) => (
            <button
              key={flt.id}
              type="button"
              onClick={() => setFilterType(flt.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                filterType === flt.id
                  ? "bg-purple-900 text-white border-purple-900 shadow-xs dark:bg-purple-600 dark:border-purple-600"
                  : "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-100"
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Products Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#F7A600] mb-2" />
            <p className="text-xs">Loading commercial catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center p-8">
            <Boxes className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              No products found
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No items matching your search filter. Click &quot;+ Add New Product / Package&quot; to create one.
            </p>
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="mt-4 text-xs bg-[#F7A600] text-black font-bold"
            >
              + Create Product Now
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Item & Code</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right">Purchase Cost</th>
                  <th className="py-3 px-4 text-right">Sale Price</th>
                  <th className="py-3 px-4 text-right">Net Profit / Commission</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-gray-800 dark:text-zinc-200">
                {filteredProducts.map((prod) => {
                  const purchase = Number(prod.purchase_price || 0);
                  const sale = Number(prod.sale_price || prod.dp || 0);
                  const profit = Number(prod.profit !== undefined ? prod.profit : (prod.pv || Math.max(0, sale - purchase)));

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Name, Image & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
                            {prod.image_url ? (
                              <img
                                src={prod.image_url}
                                alt={prod.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="text-gray-400">
                                {prod.is_package ? (
                                  <Boxes className="h-5 w-5 text-purple-600" />
                                ) : (
                                  <Package className="h-5 w-5 text-gray-500" />
                                )}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 dark:text-white text-xs truncate max-w-[200px]">
                              {prod.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-gray-400 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                {prod.sku}
                              </span>
                              <span className="text-[10px] text-gray-500 truncate max-w-[100px]">
                                {prod.category_name || "General"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Package / Standard Tag */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {prod.is_package ? (
                          <div className="space-y-0.5">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider border border-purple-200 dark:border-purple-800">
                              {prod.badge || "PACKAGE"}
                            </span>
                            {prod.package_rank && (
                              <div className="text-[10px] text-purple-600 font-semibold">
                                ★ Upgrades to {prod.package_rank}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 text-[10px] font-semibold">
                            Standard FMCG
                          </span>
                        )}
                      </td>

                      {/* Purchase Cost */}
                      <td className="py-3 px-4 text-right font-mono text-gray-500 whitespace-nowrap">
                        ৳{purchase.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Sale Price */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          ৳{sale.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Profit */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="font-mono font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                          <Sparkles className="h-3 w-3 text-emerald-600" />
                          <span>৳{profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">100% Commission Pool</span>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prod.stock_quantity <= 10
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300"
                              : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {prod.stock_quantity} in stock
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(prod)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-transform hover:scale-105 ${
                            prod.is_active
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400 border border-gray-300 dark:border-zinc-700"
                          }`}
                        >
                          {prod.is_active ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-gray-400" />
                          )}
                          <span>{prod.is_active ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(prod)}
                          className="h-7 px-2.5 text-xs font-semibold flex items-center gap-1 ml-auto hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300 transition-colors"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
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

      {/* 5. Product Create / Edit Modal */}
      <ProductEditModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        categories={categories}
        onSuccess={() => loadAllData()}
      />

      {/* 6. Category Create Modal */}
      <CategoryCreateModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={() => loadAllData()}
      />
    </div>
  );
}

