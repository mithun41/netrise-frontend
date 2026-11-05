"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AppShell({ children }) {
  const pathname = usePathname();
  // Routes that should use the full-screen Enterprise Dashboard layout
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/team") ||
    pathname.startsWith("/wallet") ||
    pathname.startsWith("/commissions") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/team") ||
    pathname.startsWith("/kpi") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/super-shop") ||
    pathname.startsWith("/secure-life") ||
    pathname.startsWith("/admin");

  if (isDashboardRoute) {
    return <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0D0E12]">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

