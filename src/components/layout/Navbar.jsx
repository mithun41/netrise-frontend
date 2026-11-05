"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { Layers, Menu, X, Users, User, LogOut, LogIn, UserPlus } from "lucide-react";

export default function Navbar() {
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useAppStore();
  const { user, isAuthenticated, logout, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <span className="tracking-tight">{SITE_CONFIG.name}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false} // A logged-out prefetch caches the redirect to /login and breaks login
              className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/team" className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                <Users className="h-3.5 w-3.5" />
                <span>My Team</span>
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-zinc-300 font-medium">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span>@{user?.username}</span>
                <Badge variant="purple" size="sm">
                  {user?.current_rank || "SPP"}
                </Badge>
              </div>
              <Button size="sm" variant="ghost" onClick={logout} className="text-xs text-red-600 hover:text-red-700">
                <LogOut className="h-3.5 w-3.5 mr-1" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="ghost">
                  <LogIn className="h-3.5 w-3.5 mr-1" /> Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="primary">
                  <UserPlus className="h-3.5 w-3.5 mr-1" /> Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <Badge variant="info" size="sm">
              @{user?.username}
            </Badge>
          )}
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <nav className="flex flex-col space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                onClick={closeMobileMenu}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link href="/team" onClick={closeMobileMenu}>
                    <Button size="sm" variant="outline" className="w-full">
                      My Team & Tree
                    </Button>
                  </Link>
                  <Button size="sm" variant="danger" className="w-full" onClick={() => { logout(); closeMobileMenu(); }}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMobileMenu}>
                    <Button size="sm" variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeMobileMenu}>
                    <Button size="sm" variant="primary" className="w-full">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
