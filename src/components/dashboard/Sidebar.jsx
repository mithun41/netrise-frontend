"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  GitFork,
  Wallet,
  Percent,
  Menu,
  ShieldCheck,
  ShoppingBag,
  Package,
  Boxes,
  Users,
  Truck,
  Target,
  Store,
  HeartPulse,
  Award,
  PieChart,
  BarChart3,
  SlidersHorizontal,
  PlusCircle,
} from "lucide-react";

// Core member features
export const SIDEBAR_ITEMS = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Packages & Shop",
    icon: ShoppingBag,
    href: "/products",
  },
  {
    title: "My Orders",
    icon: Package,
    href: "/orders",
  },
  {
    title: "My Team (10-Tier Tree)",
    icon: GitFork,
    href: "/team",
  },
  {
    title: "E-Revenue & Wallet",
    icon: Wallet,
    href: "/wallet",
  },
  {
    title: "Commission Engine (100%)",
    icon: Percent,
    href: "/commissions",
    badge: "Live",
  },
  {
    title: "KPI & Rank",
    icon: Target,
    href: "/kpi",
  },
  {
    title: "Super Shop",
    icon: Store,
    href: "/super-shop",
  },
  {
    title: "Secure Life",
    icon: HeartPulse,
    href: "/secure-life",
  },
];

// Admin pages beyond the core three
const ADMIN_ITEMS = [
  { title: "E-Wallet Top-ups", icon: PlusCircle, href: "/admin/topups" },
  { title: "Commission Rates", icon: SlidersHorizontal, href: "/admin/commission-rules" },
  { title: "Rank & Incentives", icon: Award, href: "/admin/ranks" },
  { title: "Super Shops", icon: Store, href: "/admin/super-shops" },
  { title: "Secure Life", icon: HeartPulse, href: "/admin/secure-life" },
  { title: "Shareholders", icon: PieChart, href: "/admin/shareholders" },
  { title: "Reports & Audit", icon: BarChart3, href: "/admin/reports" },
];

export default function Sidebar({ isCollapsed, toggleCollapsed, isMobileOpen, closeMobile }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isStaff = Boolean(user?.is_staff || user?.is_superuser || user?.user_type === "ADMIN");

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#16171B] text-[#A2A6B3] transition-all duration-300 ease-in-out border-r border-[#262830] select-none ${
          isCollapsed ? "w-[72px]" : "w-[260px]"
        } ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Brand Logo Bar */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-[#24262E]">
          {!isCollapsed ? (
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center bg-[#F7A600] text-black font-black text-xs px-2.5 py-1.5 rounded-lg shadow-sm tracking-wider uppercase">
                <span className="font-extrabold text-[#111] leading-none">
                  NETRISE
                  <span className="block text-[8px] font-bold text-black tracking-normal">BOB</span>
                </span>
              </div>
              <span className="text-white font-bold text-sm tracking-tight hidden sm:inline">
                PORTAL
              </span>
            </Link>
          ) : (
            <div className="mx-auto flex items-center justify-center bg-[#F7A600] text-black font-black text-[10px] w-8 h-8 rounded-lg">
              NRB
            </div>
          )}

          {/* Toggle Hamburger */}
          <button
            onClick={toggleCollapsed}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#252731] transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items (Member Section) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => {
                  if (isMobileOpen) closeMobile();
                }}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#282A31] text-white shadow-sm font-semibold"
                    : "text-[#9FA3B2] hover:bg-[#1E2026] hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
              >
                <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? "text-[#F7A600]" : "text-[#7E8292] group-hover:text-white"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate tracking-wide">{item.title}</span>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span className="rounded-full bg-[#32353E] px-2 py-0.5 text-[10px] text-[#A0A4B4]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Separate Administration Section (Visible strictly to staff/admins) */}
          {isStaff && (
            <div className="pt-4 mt-3 border-t border-[#23252D] space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-purple-400/90">
                  ADMINISTRATION
                </div>
              )}

              {/* Admin Order Fulfillment */}
              <Link
                href="/admin/orders"
                onClick={() => {
                  if (isMobileOpen) closeMobile();
                }}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  pathname === "/admin/orders"
                    ? "bg-[#282A31] text-purple-300 shadow-sm font-semibold border border-purple-500/40"
                    : "text-[#9FA3B2] hover:bg-[#1E2026] hover:text-purple-300"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title="Orders Fulfillment & Delivery"
              >
                <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
                  <Truck
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      pathname === "/admin/orders" ? "text-purple-400" : "text-[#7E8292] group-hover:text-purple-400"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate tracking-wide">Orders Fulfillment</span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="rounded-full bg-purple-950 px-2 py-0.5 text-[10px] text-purple-300 font-bold border border-purple-800">
                    Admin
                  </span>
                )}
              </Link>

              {/* Admin User & Role Management */}
              <Link
                href="/admin/users"
                onClick={() => {
                  if (isMobileOpen) closeMobile();
                }}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  pathname === "/admin/users"
                    ? "bg-[#282A31] text-purple-300 shadow-sm font-semibold border border-purple-500/40"
                    : "text-[#9FA3B2] hover:bg-[#1E2026] hover:text-purple-300"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title="User & Role Management"
              >
                <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
                  <Users
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      pathname === "/admin/users" ? "text-purple-400" : "text-[#7E8292] group-hover:text-purple-400"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate tracking-wide">User Management</span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="rounded-full bg-purple-950 px-2 py-0.5 text-[10px] text-purple-300 font-bold border border-purple-800">
                    Admin
                  </span>
                )}
              </Link>

              {/* Admin Product Management */}
              <Link
                href="/admin/products"
                onClick={() => {
                  if (isMobileOpen) closeMobile();
                }}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  pathname === "/admin/products"
                    ? "bg-[#282A31] text-purple-300 shadow-sm font-semibold border border-purple-500/40"
                    : "text-[#9FA3B2] hover:bg-[#1E2026] hover:text-purple-300"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title="Product & Package Manager"
              >
                <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
                  <Boxes
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      pathname === "/admin/products" ? "text-purple-400" : "text-[#7E8292] group-hover:text-purple-400"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate tracking-wide">Product Manager</span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="rounded-full bg-purple-950 px-2 py-0.5 text-[10px] text-purple-300 font-bold border border-purple-800">
                    Admin
                  </span>
                )}
              </Link>

              {/* Admin Cashout Clearance */}
              <Link
                href="/admin/settlements"
                onClick={() => {
                  if (isMobileOpen) closeMobile();
                }}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  pathname === "/admin/settlements"
                    ? "bg-[#282A31] text-purple-300 shadow-sm font-semibold border border-purple-500/40"
                    : "text-[#9FA3B2] hover:bg-[#1E2026] hover:text-purple-300"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title="Admin Cashout Clearance"
              >
                <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
                  <ShieldCheck
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      pathname === "/admin/settlements" ? "text-purple-400" : "text-[#7E8292] group-hover:text-purple-400"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate tracking-wide">Cashout Clearance</span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="rounded-full bg-purple-950 px-2 py-0.5 text-[10px] text-purple-300 font-bold border border-purple-800">
                    Admin
                  </span>
                )}
              </Link>

              {ADMIN_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (isMobileOpen) closeMobile();
                    }}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#282A31] text-purple-300 shadow-sm font-semibold border border-purple-500/40"
                        : "text-[#9FA3B2] hover:bg-[#1E2026] hover:text-purple-300"
                    } ${isCollapsed ? "justify-center px-2" : ""}`}
                    title={item.title}
                  >
                    <item.icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? "text-purple-400" : "text-[#7E8292] group-hover:text-purple-400"
                      }`}
                    />
                    {!isCollapsed && <span className="truncate tracking-wide">{item.title}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Version */}
        {!isCollapsed && (
          <div className="p-3 border-t border-[#23252D] bg-[#141518]/60">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#1C1E24]">
              <div className="h-7 w-7 rounded-lg bg-[#F7A600] text-black font-extrabold flex items-center justify-center text-xs">
                ★
              </div>
              <div className="truncate">
                <p className="text-[11px] font-bold text-white leading-tight">NetRise Core</p>
                <p className="text-[10px] text-[#7E8292]">10-Tier Commission Engine</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
