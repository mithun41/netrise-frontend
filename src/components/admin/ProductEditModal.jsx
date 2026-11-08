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
  UploadCloud,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { api } from "@/services/api";

const RANK_OPTIONS = [
  { value: "", label: "No Rank Upgrade (Standard Package)" },
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
  const [purchasePrice, setPurchasePrice] = useState(
    product?.purchase_price !== undefined && product?.purchase_price !== null
      ? String(product.purchase_price)
      : (product?.dp && product?.pv ? String(Math.max(0, Number(product.dp) - Number(product.pv))) : "")
  );
  const [salePrice, setSalePrice] = useState(
    product?.sale_price !== undefined && product?.sale_price !== null
      ? String(product.sale_price)
      : (product?.dp ? String(product.dp) : "")
  );
  const [wholesale, setWholesale] = useState(product?.wholesale_price ? String(product.wholesale_price) : "");
  const [stockQuantity, setStockQuantity] = useState(
    product?.stock_quantity !== undefined ? String(product.stock_quantity) : "100"
  );
  const [isPackage, setIsPackage] = useState(Boolean(product?.is_package));
  const [packageRank, setPackageRank] = useState(product?.package_rank || "");
  const [badge, setBadge] = useState(product?.badge || "");
  const [description, setDescription] = useState(product?.description || "");
  const [isActive, setIsActive] = useState(product?.is_active !== undefined ? product.is_active : true);

  // Photo & Image States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image_url || null);
  const [imageUrlInput, setImageUrlInput] = useState(product?.image_url || "");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file (PNG, JPG, WEBP, etc.)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image file size must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrlInput("");
  };

  const numPurchase = parseFloat(purchasePrice) || 0;
  const numSale = parseFloat(salePrice) || 0;
  const numProfit = Math.max(0, numSale - numPurchase);
  const profitMarginPercent = numSale > 0 ? Math.round((numProfit / numSale) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter a product name.");
      return;
    }
    if (numSale <= 0) {
      setErrorMessage("Sale price must be greater than 0.");
      return;
    }
    if (numPurchase < 0) {
      setErrorMessage("Purchase price cannot be negative.");
      return;
    }
    if (numSale < numPurchase) {
      setErrorMessage("Sale price cannot be lower than purchase cost price.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("sku", sku.trim());
      if (category) {
        formData.append("category", category);
      }
      formData.append("purchase_price", numPurchase.toFixed(2));
      formData.append("sale_price", numSale.toFixed(2));
      formData.append("mrp", numSale.toFixed(2));
      formData.append("dp", numSale.toFixed(2));
      formData.append("pv", numProfit.toFixed(2));
      if (wholesale) {
        formData.append("wholesale_price", Number(wholesale).toFixed(2));
      }
      formData.append("stock_quantity", parseInt(stockQuantity, 10) || 0);
      formData.append("is_package", isPackage ? "true" : "false");
      if (isPackage && packageRank) {
        formData.append("package_rank", packageRank);
      }
      if (badge.trim()) {
        formData.append("badge", badge.trim());
      }
      formData.append("description", description.trim());
      formData.append("is_active", isActive ? "true" : "false");

      // Handle Image File or URL
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageUrlInput.trim()) {
        formData.append("image_url", imageUrlInput.trim());
      } else if (!imagePreview && isEdit) {
        formData.append("image_url", "");
      }

      let result;
      if (isEdit) {
        result = await api.patch(`/api/products/admin/${product.id}/`, formData);
        setSuccessMessage(`Product "${result.name}" updated successfully!`);
      } else {
        result = await api.post("/api/products/admin/create/", formData);
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
      title={isEdit ? "Edit Product / Package" : "Add New Product or Package"}
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
            Catalog Classification
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
                <span>Standard Product</span>
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
                <span>Joining Package</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Starter / VIP membership package</p>
            </button>
          </div>
        </div>

        {/* 2. Basic Information */}
        <div className="space-y-3">
          <div>
            <label className="block font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px] mb-1">
              Product / Package Title *
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
                Category
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
                SKU / Product Code (Auto-generated if empty)
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

        {/* 3. Product Photo & Image Upload */}
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <UploadCloud className="h-3.5 w-3.5 text-blue-600" />
              Product Picture / Photo
            </span>
            {imagePreview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="h-3 w-3" /> Remove Photo
              </button>
            )}
          </div>

          {imagePreview ? (
            <div className="flex items-center gap-3.5 p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xs">
              <div className="h-16 w-16 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 shrink-0 bg-gray-100 flex items-center justify-center relative">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-gray-900 dark:text-white truncate">
                  {imageFile ? imageFile.name : (name || "Product Image")}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {imageFile
                    ? `${(imageFile.size / 1024).toFixed(1)} KB • Ready to save`
                    : "Current active photo"}
                </div>
                <label className="inline-block mt-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white dark:bg-zinc-900">
              <div className="p-2.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 mb-2">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                Click to upload product photo
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                PNG, JPG, WEBP or GIF up to 5MB
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}

          {/* Optional external image link */}
          <div>
            <label className="block text-[10px] text-gray-500 dark:text-zinc-400 mb-1">
              Or provide an image web link (optional)
            </label>
            <Input
              type="url"
              placeholder="https://example.com/images/product.jpg"
              value={imageUrlInput}
              onChange={(e) => {
                setImageUrlInput(e.target.value);
                if (e.target.value && !imageFile) {
                  setImagePreview(e.target.value);
                }
              }}
            />
          </div>
        </div>

        {/* 4. Pricing & Profit Margin (Purchase Price & Sale Price) */}
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              Product Pricing & Profit Margin
            </span>
            {profitMarginPercent > 0 && (
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-bold">
                {profitMarginPercent}% Profit Margin
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 text-[11px] mb-1">
                Purchase Price (৳) *
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 600.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                required
              />
              <span className="text-[10px] text-gray-400 block mt-0.5">
                Actual cost to produce or acquire product
              </span>
            </div>

            <div>
              <label className="block font-bold text-blue-600 dark:text-blue-400 text-[11px] mb-1">
                Sale Price (৳) *
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 1000.00"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                required
              />
              <span className="text-[10px] text-gray-400 block mt-0.5">
                Price paid by member or customer
              </span>
            </div>
          </div>

          {/* Live Profit Calculation Card */}
          <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                Net Profit (Commission Base)
              </span>
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                ৳{numProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 font-mono block">
                (৳{numSale} - ৳{numPurchase})
              </span>
              <span className="text-[10px] font-bold text-emerald-600">
                100% Commission Pool
              </span>
            </div>
          </div>

          <Input
            id="wholesale_price"
            label="Wholesale Price for Super Shops (৳)"
            type="number"
            step="0.01"
            min="0"
            value={wholesale}
            helperText="Leave empty to use the standard Sale Price."
            onChange={(e) => setWholesale(e.target.value)}
          />

          <div className="text-[10px] text-gray-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 leading-relaxed">
            ★ <strong className="text-gray-800 dark:text-zinc-200">Commission Rule:</strong> When sold, 100% of the net profit (<strong>৳{numProfit.toLocaleString()}</strong>) is distributed across the affiliate engine (55% Direct Sponsor, 20% Team Levels 1–10, 19% Company Profit, 5% Leadership Incentive Pool, 1% Super Shop).
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
                  Rank Upgrade Awarded
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
                  Badge Label
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
              Stock Quantity
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
              Product Visibility
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
              <span>{isActive ? "Active" : "Inactive"}</span>
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
            Description / Specifications
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
            <span>{isEdit ? "Update Product" : "Save Product"}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

