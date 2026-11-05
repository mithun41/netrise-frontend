"use client";

import React, { useState } from "react";
import {
  Boxes,
  PackagePlus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  DollarSign,
  Layers,
  Award,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { api } from "@/services/api";

const RANK_OPTIONS = [
  { value: "", label: "No Rank Upgrade (সাধারণ প্যাকেজ)" },
  { value: "SEO", label: "SEO - Senior Executive Officer" },
  { value: "SPO", label: "SPO - Senior Planning Officer" },
  { value: "SME", label: "SME - Senior Management Executive" },
  { value: "GEL", label: "GEL - Global Executive Leader" },
  { value: "CBD", label: "CBD - Chief Business Director" },
  { value: "ELP", label: "ELP - Elite Leader President" },
];

export default function ProductEditModal({ isOpen, product, ...props }) {
  if (!isOpen) return null;
  return <ProductForm key={product?.id ?? "new"} isOpen={isOpen} product={product} {...props} />;
}

function ProductForm({
  isOpen,
  onClose,
  product, // If provided, edit mode; if null, create mode
  categories = [],
  onSuccess,
}) {
  const isEdit = Boolean(product?.id);
  const defaultCategory = categories[0]?.id ? String(categories[0].id) : "";

  const [name, setName] = useState(product?.name || "");
  const [sku, setSku] = useState(product?.sku || "");
  const [category, setCategory] = useState(product?.category ? String(product.category) : defaultCategory);
  const [mrp, setMrp] = useState(product?.mrp ? String(product.mrp) : "");
  const [dp, setDp] = useState(product?.dp ? String(product.dp) : "");
  const [pv, setPv] = useState(product?.pv ? String(product.pv) : "");
  const [wholesale, setWholesale] = useState(product?.wholesale_price ? String(product.wholesale_price) : "");
  const [stockQuantity, setStockQuantity] = useState(
    product?.stock_quantity !== undefined ? String(product.stock_quantity) : "100"
  );
  const [isPackage, setIsPackage] = useState(Boolean(product?.is_package));
  const [packageRank, setPackageRank] = useState(product?.package_rank || "");
  const [badge, setBadge] = useState(product?.badge || "");
  const [description, setDescription] = useState(product?.description || "");
  const [isActive, setIsActive] = useState(product?.is_active !== undefined ? product.is_active : true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const numMrp = parseFloat(mrp) || 0;
  const numDp = parseFloat(dp) || 0;
  const numPv = parseFloat(pv) || 0;
  const discountPercent = numMrp > 0 ? Math.round(((numMrp - numDp) / numMrp) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter a product name.");
      return;
    }
    if (numMrp <= 0 || numDp <= 0 || numPv <= 0) {
      setErrorMessage("MRP, Member DP, and Point Value (PV) must all be greater than 0.");
      return;
    }
    if (numDp > numMrp) {
      setErrorMessage("Member DP (৳) cannot be higher than Retail MRP (৳).");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim(),
        category: category ? Number(category) : null,
        mrp: numMrp.toFixed(2),
        dp: numDp.toFixed(2),
        pv: numPv.toFixed(2),
        wholesale_price: wholesale ? Number(wholesale).toFixed(2) : null,
        stock_quantity: parseInt(stockQuantity, 10) || 0,
        is_package: isPackage,
        package_rank: isPackage && packageRank ? packageRank : null,
        badge: isPackage && badge.trim() ? badge.trim() : (badge.trim() || null),
        description: description.trim(),
        is_active: isActive,
      };

      let result;
      if (isEdit) {
        result = await api.patch(`/api/products/admin/${product.id}/`, payload);
        setSuccessMessage(`Product "${result.name}" updated successfully!`);
      } else {
        result = await api.post("/api/products/admin/create/", payload);
        setSuccessMessage(`Product "${result.name}" created with SKU ${result.sku}!`);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1200);
    } catch (err) {
      console.error("Save product error:", err);
      setErrorMessage(err.data?.detail || err.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Product / Package (সম্পাদনা করুন)" : "Add New Product or Package (নতুন পণ্য / প্যাকেজ)"}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. Item Type Toggle: Standard Product vs Membership Package */}
        <div className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/40">
          <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
            Catalog Classification (পণ্যের ধরণ)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsPackage(false)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                !isPackage
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 font-bold text-blue-900 dark:text-blue-200 ring-2 ring-blue-500"
                  : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-blue-600" />
                <span>Standard Product (ভোক্তা পণ্য)</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">General FMCG / Health items</p>
            </button>

            <button
              type="button"
              onClick={() => setIsPackage(true)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                isPackage
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 font-bold text-purple-900 dark:text-purple-200 ring-2 ring-purple-500"
                  : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                <span>Joining Package (জয়েনিং প্যাকেজ)</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Starter / VIP membership package</p>
            </button>
          </div>
        </div>

        {/* 2. Basic Information */}
        <div className="space-y-3">
          <div>
            <label className="block font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px] mb-1">
              Product / Package Title (নাম) *
            </label>
            <Input
              type="text"
              placeholder="e.g. Starter Joining Package / Organic Black Seed Oil 250ml"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px] mb-1">
                Category (ক্যাটাগরি)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F7A600]"
              >
                <option value="">-- No Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px] mb-1">
                SKU / Product Code (খালি রাখলে অটো তৈরি হবে)
              </label>
              <Input
                type="text"
                placeholder="e.g. NRB-PKG-001 (Auto-generated if empty)"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 3. Pricing & Commission Point Value (PV) */}
        <div className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              Commercial Pricing & PV (মূল্য ও কমিশন পয়েন্ট)
            </span>
            {discountPercent > 0 && (
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                {discountPercent}% Member Discount
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-bold text-gray-600 dark:text-zinc-400 text-[10px] mb-1">
                Retail MRP (৳)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 2500"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-bold text-blue-600 dark:text-blue-400 text-[10px] mb-1">
                Member DP (৳) *
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 2000"
                value={dp}
                onChange={(e) => setDp(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-bold text-emerald-600 dark:text-emerald-400 text-[10px] mb-1">
                Point Value PV (৳) *
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 1500"
                value={pv}
                onChange={(e) => setPv(e.target.value)}
                required
              />
            </div>
          </div>

          <Input
            id="wholesale_price"
            label="Wholesale Price for Super Shops (৳)"
            type="number"
            step="0.01"
            min="0"
            value={wholesale}
            helperText="Leave empty to use the Member DP."
            onChange={(e) => setWholesale(e.target.value)}
          />
          <div className="text-[10px] text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-gray-200 dark:border-zinc-800">
            ★ <strong className="text-gray-700 dark:text-zinc-200">PV ব্যাখ্যা:</strong> যখন কোনো মেম্বার এই পণ্য কিনবে, তখন এর <strong>৳{numPv.toLocaleString()} PV</strong>-এর ওপর ৫৫% স্পন্সর কমিশন এবং ২০% লেভেল ১-১০ টিমের মাঝে স্বয়ংক্রিয়ভাবে বণ্টিত হবে।
          </div>
        </div>

        {/* 4. Package Specific Options (Rank Reward & Badge) */}
        {isPackage && (
          <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-300 text-[11px]">
              <Award className="h-4 w-4 text-purple-600" />
              <span>Membership Rank Award & Badge</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 dark:text-zinc-300 text-[10px] mb-1">
                  Rank Upgrade Awarded (র‌্যাঙ্ক প্রমোশন)
                </label>
                <select
                  value={packageRank}
                  onChange={(e) => setPackageRank(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  {RANK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-zinc-300 text-[10px] mb-1">
                  Badge Label (ব্যাজ লেখা)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. STARTER PACK / VIP CHOICE"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. Inventory & Active Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px] mb-1">
              Stock Quantity (মজুত সংখ্যা)
            </label>
            <Input
              type="number"
              placeholder="e.g. 100"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px] mb-1">
              Product Visibility (স্ট্যাটাস)
            </label>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-full h-10 px-3 rounded-xl border flex items-center justify-between transition-colors ${
                isActive
                  ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold"
                  : "border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-500"
              }`}
            >
              <span>{isActive ? "Active (সক্রিয়)" : "Inactive (বন্ধ)"}</span>
              {isActive ? (
                <ToggleRight className="h-5 w-5 text-emerald-600" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* 6. Description */}
        <div>
          <label className="block font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px] mb-1">
            Description / Specifications (বিবরণ)
          </label>
          <textarea
            rows={3}
            placeholder="Details about product benefits, ingredients, package contents..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F7A600]"
          />
        </div>

        {/* 7. Action Footer */}
        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end gap-2">
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
            size="sm"
            disabled={submitting}
            className="bg-[#F7A600] hover:bg-[#e69b00] text-black font-bold flex items-center gap-1.5"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{isEdit ? "Update Product (আপডেট করুন)" : "Save Product (সংরক্ষণ করুন)"}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

