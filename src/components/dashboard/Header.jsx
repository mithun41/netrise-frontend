"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import NotificationBell from "@/components/dashboard/NotificationBell";
import {
  Globe,
  Moon,
  Sun,
  MoreVertical,
  LogOut,
  User,
  GitFork,
  Wallet,
  Menu,
} from "lucide-react";

export default function Header({ toggleMobileSidebar }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useAppStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 dark:border-zinc-800 dark:bg-[#121316] transition-colors">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center px-2 py-1 rounded bg-[#F7A600] text-black font-extrabold text-xs uppercase tracking-wider">
            <span>NETRISE BOB</span>
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 hidden sm:inline">
            &bull; Affiliate & Network Commerce
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Public Website Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 shadow-2xs"
        >
          <Globe className="h-3.5 w-3.5 text-gray-500" />
          <span>Website</span>
        </Link>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 shadow-2xs transition-colors"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User Profile Pill */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-1.5 pr-2.5 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 shadow-2xs transition-all text-left"
          >
            {/* Avatar Placeholder */}
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs uppercase">
              {user?.username?.substring(0, 2) || "NR"}
            </div>

            {/* User Meta */}
            <div className="hidden md:block leading-tight">
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                {user?.referral_code || "NRB..."}
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-white block">
                {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username || "Member"}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 block">
                Rank: {user?.current_rank || "SPP"}
              </span>
            </div>

            <MoreVertical className="h-4 w-4 text-gray-400 hidden sm:block" />
          </button>

          {/* User Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-[#18191E] z-50">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-zinc-800 mb-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  @{user?.username}
                </p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                <span className="mt-1.5 inline-block text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  Rank: {user?.current_rank || "SPP"}
                </span>
              </div>

              <Link
                href="/team"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                <GitFork className="h-4 w-4 text-blue-500" />
                <span>My 10-Tier Team & Tree</span>
              </Link>

              <Link
                href="/wallet"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                <Wallet className="h-4 w-4 text-emerald-500" />
                <span>E-Revenue & Wallet</span>
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                <User className="h-4 w-4 text-indigo-500" />
                <span>Dashboard Overview</span>
              </Link>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                  router.replace("/login");
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors mt-1 border-t border-gray-100 dark:border-zinc-800 pt-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
