"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import Button from "@/components/common/Button";
import UserEditModal from "@/components/admin/UserEditModal";
import UserDeleteModal from "@/components/admin/UserDeleteModal";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Award,
  Wallet,
  Phone,
  Mail,
  Loader2,
  Store,
  UserCheck,
  Building,
} from "lucide-react";

export default function AdminUsersPage() {
  const { user, isAuthenticated, initializeAuth } = useAuthStore();
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    staff: 0,
    members: 0,
    agents: 0,
    super_shops: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [roleFilter, setRoleFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);

  // Staff check
  const isStaff = Boolean(user?.is_staff || user?.is_superuser || user?.user_type === "ADMIN");

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const loadUsersData = () =>
    api
      .get("/api/auth/admin/users/")
      .then((res) => {
        setUsersList(res?.results || []);
        if (res?.stats) setStats(res.stats);
      })
      .catch((err) => {
        if (err.status !== 403) {
          console.error("Failed to load admin users:", err);
        }
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => setIsRefreshing(false), 300);
      });

  const refreshUsers = () => {
    setIsRefreshing(true);
    loadUsersData();
  };

  useEffect(() => {
    if (isAuthenticated && isStaff) {
      loadUsersData();
    }
  }, [isAuthenticated, isStaff]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setSelectedUserForEdit(null);
    setIsEditModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (target) => {
    setSelectedUserForEdit(target);
    setIsEditModalOpen(true);
  };

  // Open modal for Delete
  const handleOpenDelete = (target) => {
    setSelectedUserForDelete(target);
    setIsDeleteModalOpen(true);
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
          Only verified administrators and staff can access user directories, roles, and privileges.
        </p>
        <Link href="/dashboard" className="inline-block mt-4">
          <Button size="sm" variant="outline" className="text-xs">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // Filter users
  const filteredUsers = usersList.filter((u) => {
    if (roleFilter !== "all") {
      if (roleFilter === "inactive") {
        if (u.is_active) return false;
      } else if (roleFilter === "staff") {
        if (!u.is_staff) return false;
      } else if (u.user_type !== roleFilter) {
        return false;
      }
    }

    if (rankFilter !== "all" && u.current_rank !== rankFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchUsername = u.username?.toLowerCase().includes(q);
      const matchName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchPhone = u.phone_number?.toLowerCase().includes(q);
      const matchRef = u.referral_code?.toLowerCase().includes(q);
      if (!matchUsername && !matchName && !matchEmail && !matchPhone && !matchRef) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  User & Role Management
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Inspect platform accounts, manage roles, adjust MLM ranks, and control user permissions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshUsers}
            disabled={isRefreshing}
            className="h-9 px-3 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Add User */}
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-9 px-3.5 text-xs bg-[#F7A600] hover:bg-[#e69b00] text-black font-bold flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Add New User (নতুন ইউজার)</span>
          </Button>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Users
            </span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
            {stats.total}
          </div>
          <span className="text-[10px] text-gray-400">All registered accounts</span>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Affiliate Members
            </span>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {stats.members}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">Registered customers / downlines</span>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Shops & Agents
            </span>
            <Store className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
            {stats.super_shops + stats.agents}
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold">
            {stats.super_shops} Super Shops, {stats.agents} Agents
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Staff & Admins
            </span>
            <Shield className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
            {stats.staff}
          </div>
          <span className="text-[10px] text-purple-600 font-semibold">Elevated administration</span>
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username, full name, email, phone, or referral code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-[#F7A600] text-gray-900 dark:text-white"
          />
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Roles" },
            { id: "MEMBER", label: "Members" },
            { id: "SUPER_SHOP", label: "Super Shops" },
            { id: "AGENT", label: "Agents" },
            { id: "staff", label: "Staff Admins" },
            { id: "inactive", label: "Suspended" },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRoleFilter(r.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                roleFilter === r.id
                  ? "bg-gray-900 dark:bg-white text-white dark:text-black border-transparent shadow-xs"
                  : "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-100"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Users Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#F7A600] mb-2" />
            <p className="text-xs">Loading user registry...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center p-8">
            <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              No users found
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No users matching your search filters. Click &quot;+ Add New User&quot; to register a new member.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">User & Code</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">MLM Rank</th>
                  <th className="py-3 px-4 text-right">Wallet Balance</th>
                  <th className="py-3 px-4">Sponsor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-gray-800 dark:text-zinc-200">
                {filteredUsers.map((u) => {
                  const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim();

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* User Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs uppercase shrink-0 shadow-2xs">
                            {u.username.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white text-xs flex items-center gap-1.5">
                              <span>@{u.username}</span>
                              {u.is_staff && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">
                                  STAFF
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 font-medium">
                              {fullName || "—"}
                            </div>
                            <span className="inline-block font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded mt-0.5">
                              {u.referral_code || "No Code"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex items-center gap-1 text-gray-700 dark:text-zinc-300">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="truncate max-w-[160px]">{u.email}</span>
                          </div>
                          {u.phone_number ? (
                            <div className="flex items-center gap-1 text-gray-500">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{u.phone_number}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[10px]">No phone</span>
                          )}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.user_type === "ADMIN"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300"
                              : u.user_type === "SUPER_SHOP"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300"
                              : u.user_type === "AGENT"
                              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300"
                              : "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200"
                          }`}
                        >
                          {u.user_type}
                        </span>
                      </td>

                      {/* MLM Rank */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 text-[11px] font-black border border-amber-200 dark:border-amber-800">
                          <Award className="h-3 w-3 text-[#F7A600]" />
                          <span>{u.current_rank || "SPP"}</span>
                        </span>
                      </td>

                      {/* Wallet Balance */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        ৳{Number(u.wallet_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Sponsor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {u.sponsor_username ? (
                          <span className="text-[11px] font-medium text-gray-700 dark:text-zinc-300">
                            @{u.sponsor_username}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">None (Root)</span>
                        )}
                        <div className="text-[10px] text-gray-400">
                          {u.direct_referrals_count || 0} downlines
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.is_active
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                          }`}
                        >
                          {u.is_active ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-rose-600" />
                          )}
                          <span>{u.is_active ? "Active" : "Suspended"}</span>
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(u)}
                            className="h-7 px-2 text-xs font-semibold flex items-center gap-1 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300 transition-colors"
                            title="Edit User & Roles"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                          </Button>

                          {/* Delete / Suspend */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDelete(u)}
                            className="h-7 px-2 text-xs font-semibold flex items-center gap-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950 dark:hover:text-rose-300 transition-colors"
                            title="Suspend or Delete User"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
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

      {/* 5. User Edit Modal */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUserForEdit(null);
        }}
        targetUser={selectedUserForEdit}
        onSuccess={() => loadUsersData()}
      />

      {/* 6. User Delete Modal */}
      <UserDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUserForDelete(null);
        }}
        targetUser={selectedUserForDelete}
        onSuccess={() => loadUsersData()}
      />
    </div>
  );
}

