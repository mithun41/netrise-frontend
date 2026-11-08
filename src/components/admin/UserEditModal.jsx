"use client";

import React, { useState } from "react";
import {
  User,
  Shield,
  Key,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Award,
  ToggleLeft,
  ToggleRight,
  UserCheck,
} from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { api } from "@/services/api";

const ROLE_OPTIONS = [
  { value: "MEMBER", label: "Registered Member / Customer" },
  { value: "SUPER_SHOP", label: "Super Shop Partner" },
  { value: "AGENT", label: "Secure Life Agent" },
  { value: "ADMIN", label: "System Admin / Executive" },
];

const RANK_OPTIONS = [
  { value: "SPP", label: "SPP - Starting Point Partner" },
  { value: "SEO", label: "SEO - Senior Executive Officer" },
  { value: "SPO", label: "SPO - Senior Planning Officer" },
  { value: "SME", label: "SME - Senior Management Executive" },
  { value: "GEL", label: "GEL - Global Executive Leader" },
  { value: "CBD", label: "CBD - Chief Business Director" },
  { value: "ELP", label: "ELP - Elite Leader President" },
];

export default function UserEditModal({ isOpen, targetUser, ...props }) {
  if (!isOpen) return null;
  return <UserForm key={targetUser?.id ?? "new"} isOpen={isOpen} targetUser={targetUser} {...props} />;
}

function UserForm({
  isOpen,
  onClose,
  targetUser, // if null -> Create mode, if user object -> Edit mode
  onSuccess,
}) {
  const isEdit = Boolean(targetUser?.id);

  const [username, setUsername] = useState(targetUser?.username || "");
  const [firstName, setFirstName] = useState(targetUser?.first_name || "");
  const [lastName, setLastName] = useState(targetUser?.last_name || "");
  const [email, setEmail] = useState(targetUser?.email || "");
  const [phone, setPhone] = useState(targetUser?.phone_number || "");
  const [userType, setUserType] = useState(targetUser?.user_type || "MEMBER");
  const [rank, setRank] = useState(targetUser?.current_rank || "SPP");
  const [isStaff, setIsStaff] = useState(Boolean(targetUser?.is_staff));
  const [isActive, setIsActive] = useState(targetUser?.is_active !== undefined ? targetUser.is_active : true);
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRoleChange = (val) => {
    setUserType(val);
    if (val === "ADMIN") {
      setIsStaff(true);
    } else {
      setIsStaff(false);
    }
  };

  const handleStaffToggle = () => {
    const nextStaff = !isStaff;
    setIsStaff(nextStaff);
    if (nextStaff) {
      setUserType("ADMIN");
    } else if (userType === "ADMIN") {
      setUserType("MEMBER");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!username.trim()) {
      setErrorMessage("Username is required.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Valid email address is required.");
      return;
    }

    if (!isEdit && !password.trim()) {
      setErrorMessage("Password is required for new users (min 6 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone_number: phone.trim(),
        user_type: userType,
        current_rank: rank,
        is_staff: isStaff,
        is_active: isActive,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      let res;
      if (isEdit) {
        res = await api.patch(`/api/auth/admin/users/${targetUser.id}/`, payload);
        setSuccessMessage(`User @${res.username} updated successfully!`);
      } else {
        res = await api.post("/api/auth/admin/users/create/", payload);
        setSuccessMessage(`User @${res.username} created with code ${res.referral_code}!`);
      }

      if (onSuccess) onSuccess(res);

      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1200);
    } catch (err) {
      console.error("Save user error:", err);
      const detail = err.data?.detail || err.data?.username?.[0] || err.data?.email?.[0] || err.message || "Failed to save user.";
      setErrorMessage(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit User (@${targetUser.username})` : "Add New User Account"}
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

        {/* 1. Account Credentials */}
        <div className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/40 space-y-3">
          <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-white uppercase tracking-wider text-[11px]">
            <Key className="h-3.5 w-3.5 text-blue-600" />
            <span>Login Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 text-[10px] mb-1">
                Username *
              </label>
              <Input
                type="text"
                placeholder="e.g. rohim_corp"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isEdit} // username remains fixed in edit for referral safety
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 text-[10px] mb-1">
                {isEdit ? "New Password (leave blank to keep unchanged)" : "Password *"}
              </label>
              <Input
                type="password"
                placeholder={isEdit ? "Leave blank to keep unchanged" : "Min 6 characters"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isEdit}
              />
            </div>
          </div>
        </div>

        {/* 2. Personal & Contact Info */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 text-[10px] mb-1">
                First Name
              </label>
              <Input
                type="text"
                placeholder="e.g. Md. Rohim"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 text-[10px] mb-1">
                Last Name
              </label>
              <Input
                type="text"
                placeholder="e.g. Uddin"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 text-[10px] mb-1">
                Email Address *
              </label>
              <Input
                type="email"
                placeholder="e.g. rohim@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 text-[10px] mb-1">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="e.g. 01700000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 3. Role & Rank Privileges */}
        <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
          <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-300 text-[11px]">
            <Shield className="h-4 w-4 text-purple-600" />
            <span>Role & MLM Rank Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 text-[10px] mb-1">
                System Role
              </label>
              <select
                value={userType}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 text-[10px] mb-1">
                MLM Network Rank
              </label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                {RANK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Staff & Active toggles */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 text-[10px] mb-1">
                Staff / Admin Access
              </label>
              <button
                type="button"
                onClick={handleStaffToggle}
                className={`w-full h-9 px-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  isStaff
                    ? "border-purple-300 bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 font-bold"
                    : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-600"
                }`}
              >
                <span>{isStaff ? "Staff Admin" : "Regular User"}</span>
                {isStaff ? <ToggleRight className="h-4 w-4 text-purple-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
              </button>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 text-[10px] mb-1">
                Account Status
              </label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-full h-9 px-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  isActive
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 font-bold"
                    : "border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200 font-bold"
                }`}
              >
                <span>{isActive ? "Active" : "Suspended"}</span>
                {isActive ? <ToggleRight className="h-4 w-4 text-emerald-600" /> : <ToggleLeft className="h-4 w-4 text-rose-500" />}
              </button>
            </div>
          </div>
        </div>

        {/* 4. Action Footer */}
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
            <span>{isEdit ? "Update User" : "Create User"}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

