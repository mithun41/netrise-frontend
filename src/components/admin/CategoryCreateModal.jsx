"use client";

import React, { useState } from "react";
import { FolderPlus, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { api } from "@/services/api";

export default function CategoryCreateModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter category name.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/products/admin/categories/create/", {
        name: name.trim(),
        description: description.trim(),
      });
      setSuccessMessage(`Category "${res.name}" created!`);
      if (onSuccess) onSuccess(res);

      setTimeout(() => {
        setName("");
        setDescription("");
        setSuccessMessage("");
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Create category error:", err);
      setErrorMessage(err.data?.name?.[0] || err.message || "Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Category (নতুন ক্যাটাগরি যোগ করুন)"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
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

        <div>
          <label className="block font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px] mb-1">
            Category Name *
          </label>
          <Input
            type="text"
            placeholder="e.g. Health Supplements / Cosmetics / Groceries"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px] mb-1">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Short description for this category..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#F7A600]"
          />
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-2">
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
            <span>Save Category</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

