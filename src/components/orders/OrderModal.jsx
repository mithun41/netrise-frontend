"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  CreditCard,
  Truck,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { api } from "@/services/api";

export default function OrderModal({ isOpen, product, ...props }) {
  if (!isOpen || !product) return null;
  return <OrderForm key={product.id} isOpen={isOpen} product={product} {...props} />;
}

function OrderForm({ isOpen, onClose, product, userWallet, onSuccess }) {
  const availableBalance = Number(userWallet?.ewallet_balance || 0);
  const unitDp = Number(product.dp || 0);

  const [quantity, setQuantity] = useState(1);
  // Default payment method: WALLET if balance is enough, else COD
  const [paymentMethod, setPaymentMethod] = useState(
    unitDp > 0 && availableBalance >= unitDp ? "WALLET" : "COD"
  );
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const unitPv = Number(product.pv || 0);
  const totalAmount = unitDp * quantity;
  const totalPv = unitPv * quantity;
  const hasEnoughBalance = availableBalance >= totalAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!shippingAddress.trim()) {
      setErrorMessage("Please enter a valid delivery address.");
      return;
    }

    if (paymentMethod === "WALLET" && !hasEnoughBalance) {
      setErrorMessage(`Insufficient wallet balance. Required: ৳${totalAmount.toLocaleString()}, Available: ৳${availableBalance.toLocaleString()}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/orders/create/", {
        items: [
          {
            product_id: product.id,
            quantity: quantity,
          },
        ],
        payment_method: paymentMethod,
        recipient_name: recipientName.trim(),
        recipient_phone: recipientPhone.trim(),
        shipping_address: shippingAddress.trim(),
        city: city.trim(),
        notes: notes.trim(),
      });

      setSuccessMessage(
        paymentMethod === "WALLET"
          ? `Order #${res.order?.order_number} confirmed! 100% MLM commissions distributed instantly.`
          : `Order #${res.order?.order_number} placed successfully!`
      );

      if (onSuccess) {
        onSuccess(res.order);
      }

      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1600);
    } catch (err) {
      console.error("Order error:", err);
      setErrorMessage(err.data?.error || err.message || "Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Your Order (অর্ডার কনফার্ম করুন)"
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Feedback alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Product Summary Card */}
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/40">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                {product.is_package && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider">
                    {product.badge || "Package"}
                  </span>
                )}
                <span className="font-mono text-[11px] text-gray-500">{product.sku}</span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mt-1">
                {product.name}
              </h4>
              <div className="flex items-center gap-3 mt-1.5 text-xs">
                <span className="text-gray-500">
                  MRP: <span className="line-through">৳{Number(product.mrp).toLocaleString()}</span>
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  Member DP: ৳{unitDp.toLocaleString()}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  PV: ৳{unitPv.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="px-3 font-mono font-bold text-xs">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
            Select Payment Method (পেমেন্ট পদ্ধতি)
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Wallet Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod("WALLET")}
              className={`p-3 rounded-xl border text-left transition-all ${
                paymentMethod === "WALLET"
                  ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500 shadow-2xs"
                  : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900 dark:text-white">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                  <span>E-Wallet Balance</span>
                </div>
                {paymentMethod === "WALLET" && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                )}
              </div>
              <div className="mt-1 text-[11px] font-mono text-gray-500 dark:text-zinc-400">
                Available: ৳{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              {!hasEnoughBalance && (
                <div className="text-[10px] text-red-600 mt-1 font-semibold">
                  Insufficient balance
                </div>
              )}
            </button>

            {/* COD Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod("COD")}
              className={`p-3 rounded-xl border text-left transition-all ${
                paymentMethod === "COD"
                  ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500 shadow-2xs"
                  : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900 dark:text-white">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span>Cash on Delivery</span>
                </div>
                {paymentMethod === "COD" && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                )}
              </div>
              <div className="mt-1 text-[11px] text-gray-500 dark:text-zinc-400">
                Pay cash upon receiving package
              </div>
            </button>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
            Delivery & Shipping Address (ডেলিভারি ঠিকানা)
          </label>

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Recipient Name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="text-xs"
            />
            <Input
              placeholder="Contact Phone #"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <Input
            placeholder="Full Shipping Address (Road, House, Area)..."
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            required
            className="text-xs"
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="City (e.g. Dhaka, Chittagong)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="text-xs"
            />
            <Input
              placeholder="Delivery Instructions (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        {/* Pricing Summary Breakdown */}
        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 space-y-1.5 text-xs">
          <div className="flex justify-between text-gray-600 dark:text-zinc-400">
            <span>Items Subtotal:</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">
              ৳{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-zinc-400">
            <span>Commissionable BV/PV Value:</span>
            <span className="font-mono text-emerald-600 font-bold">
              ৳{totalPv.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-zinc-400">
            <span>Delivery Fee:</span>
            <span className="font-mono text-emerald-600 font-bold">৳0.00 (Free)</span>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-zinc-700 flex justify-between items-center text-sm font-extrabold text-gray-900 dark:text-white">
            <span>Total Payable Amount:</span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 text-base">
              ৳{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800">
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
            variant="primary"
            size="sm"
            disabled={submitting || (paymentMethod === "WALLET" && !hasEnoughBalance)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-semibold"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                <span>Confirm & Place Order</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

