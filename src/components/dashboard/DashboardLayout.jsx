"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, ShieldAlert } from "lucide-react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isAuthenticated, isInitialized, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  const isCheckingAuth = !isInitialized || !isAuthenticated;

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0D0E12] flex transition-colors relative">
      {/* Fixed Left Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapsed={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
        }`}
      >
        {/* Sticky Top Header */}
        <Header toggleMobileSidebar={() => setIsMobileOpen(true)} />

        {/* Page Content - Always rendered so Next.js Turbopack instant navigation segment validation succeeds */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Fullscreen Authentication Verification Overlay (covers dashboard if unauthenticated) */}
      {isCheckingAuth && (
        <div className="fixed inset-0 z-50 bg-[#F4F6F9] dark:bg-[#0D0E12] flex flex-col items-center justify-center p-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-xl shadow-lg mb-4 animate-pulse">
            NR
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            <span>
              {!isInitialized
                ? "Verifying Authentication... / লগইন যাচাই করা হচ্ছে..."
                : "Redirecting to Login... / লগইন পেজে নিয়ে যাওয়া হচ্ছে..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
