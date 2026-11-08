import React from "react";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { Layers, ShieldCheck, Phone, Mail, MapPin, ArrowRight } from "lucide-react";

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-gray-200 bg-gray-50/70 dark:border-zinc-800 dark:bg-zinc-950 text-gray-700 dark:text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black shadow-md shadow-blue-500/20">
                <Layers className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">
                {SITE_CONFIG.name}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              Business Operation Branch (BOB). A premier multi-tier network commerce, nationwide super shop franchise, and 100% net profit affiliate ecosystem.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Contract: SZIT-20191067</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3">
              Platform & Commerce
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Product Catalog & Packages
                </Link>
              </li>
              <li>
                <Link href="/#affiliate" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  10-Tier Compensation Plan
                </Link>
              </li>
              <li>
                <Link href="/super-shop" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Super Shop Franchise
                </Link>
              </li>
              <li>
                <Link href="/secure-life" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Secure Life Micro-Insurance
                </Link>
              </li>
            </ul>
          </div>

          {/* Member Portal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3">
              Member Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Member Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Join with Referral Code
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  E-Revenue & Cash Wallet
                </Link>
              </li>
              <li>
                <Link href="/commissions" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Live Commission Simulator
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3">
              Headquarters & Support
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>SoftZen IT Corporate Operations, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Helpline: +880 1700-000000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-600 shrink-0" />
                <span>support@netrisebob.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-zinc-500">
          <div>
            © {currentYear} {SITE_CONFIG.name}. All rights reserved. Technology powered by SoftZen IT.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-gray-900 dark:hover:text-white">
              Member Portal
            </Link>
            <span>•</span>
            <Link href="/register" className="hover:text-gray-900 dark:hover:text-white">
              Become an Affiliate
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
