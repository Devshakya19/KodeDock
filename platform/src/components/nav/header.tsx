"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

interface HeaderProps {
  onSearchChange?: (term: string) => void;
  searchTerm?: string;
}

interface StoredUser {
  id?: string;
  email?: string;
  full_name?: string;
  role?: string;
  avatar_url?: string | null;
}

export default function PlatformHeader({ onSearchChange, searchTerm = "" }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Scroll listener for dynamic floating navbar compression
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync external searchTerm prop
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  // Load user data and login state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));

      const token = localStorage.getItem("kd_access_token");
      if (token) {
        setIsLoggedIn(true);
        const storedUserJson = localStorage.getItem("kd_user");
        if (storedUserJson) {
          try {
            const parsed = JSON.parse(storedUserJson);
            setUser(parsed);
          } catch {
            // Fallback to JWT payload
          }
        }

        // If no user object in localStorage, attempt parsing from JWT
        if (!storedUserJson) {
          try {
            const parts = token.split(".");
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              setUser({
                id: payload.sub,
                email: payload.email,
                role: payload.role,
              });
            }
          } catch {
            // Token parse fallback
          }
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    }
  }, [pathname]);

  // Keyboard shortcut: Ctrl+P / Cmd+P and "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+P or Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault(); // Prevent native browser print modal
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      // Pressing "/" outside of inputs
      else if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        const tagName = document.activeElement?.tagName.toLowerCase();
        if (tagName !== "input" && tagName !== "textarea") {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
      // Escape key to dismiss
      else if (e.key === "Escape") {
        searchInputRef.current?.blur();
        setUserMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute First Name (e.g., "Devraj Singh Shakya" -> "Devraj")
  const firstName = useMemo(() => {
    if (user?.full_name && user.full_name.trim()) {
      const parts = user.full_name.trim().split(/\s+/);
      return parts[0];
    }
    if (user?.email) {
      const username = user.email.split("@")[0];
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    return "Buyer";
  }, [user]);

  // Compute deterministic avatar SVG from seed (email or id)
  const avatarUrl = useMemo(() => {
    if (user?.avatar_url) return user.avatar_url;
    const seed = user?.email || user?.id || "buyer@kodedock.com";
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const avatarIndex = (Math.abs(hash) % 24) + 1;
    return `/avatars/avatar-${avatarIndex}.svg`;
  }, [user]);

  const handleSearchInput = (value: string) => {
    setLocalSearch(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSearchChange && localSearch.trim()) {
      router.push(`/explore?q=${encodeURIComponent(localSearch.trim())}`);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("kd_access_token");
    localStorage.removeItem("kd_user");
    setIsLoggedIn(false);
    setUser(null);
    setUserMenuOpen(false);
    router.push("/login");
  };

  return (
    <header
      className={`fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] sm:w-[95%] max-w-5xl transition-all duration-300 ease-out ${
        isScrolled
          ? "bg-[#141417]/95 backdrop-blur-2xl py-1.5 px-2.5 sm:px-4 rounded-full border border-[#8535FC]/30 shadow-2xl shadow-black/80 scale-[0.99]"
          : "bg-[#1D1D21]/90 backdrop-blur-xl py-2 px-2.5 sm:px-4 rounded-full border border-[#414146]/70 shadow-xl shadow-black/50 hover:border-[#8535FC]/40"
      }`}
    >
      <div className="flex items-center justify-between gap-1.5 sm:gap-4">
        {/* 1. BRANDING (Minimalist Developer-First with animated pulse dot) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link href="/explore" className="inline-flex items-center gap-1.5 sm:gap-2 group">
            <div className="relative w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Image
                src="/icons/logo/kd.svg"
                alt="KodeDock"
                width={28}
                height={28}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="font-heading font-semibold text-xs sm:text-base tracking-tight text-[#EDEDF0] hidden min-[380px]:inline-flex items-center">
              Kode<span className="text-[#8535FC]">Dock</span>
            </span>
          </Link>
        </div>

        {/* 2. COMPACT EXPANDING SEARCH BAR */}
        <div className="flex-1 min-w-0 max-w-xs sm:max-w-md mx-1 sm:mx-3 transition-all duration-300 focus-within:max-w-lg">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#A1A1AA]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search codebases..."
              value={localSearch}
              onChange={(e) => handleSearchInput(e.target.value)}
              className="w-full h-8 pl-8 pr-3 sm:pr-12 bg-[#141417]/90 hover:bg-[#141417] focus:bg-[#141417] border border-[#414146]/70 focus:border-[#8535FC] rounded-full text-xs text-[#EDEDF0] placeholder-[#A1A1AA] outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(133,53,252,0.25)] truncate"
            />

            {/* Shortcut Badge (Hidden on touch & mobile screens) */}
            <div className="absolute inset-y-0 right-0 pr-2 hidden sm:flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-[#27272A] border border-[#414146] text-[#A1A1AA] rounded-md">
                {isMac ? "⌘P" : "Ctrl+P"}
              </kbd>
            </div>
          </form>
        </div>

        {/* 3. USER PROFILE / AUTH ACTIONS */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isLoggedIn ? (
            /* Logged In: Circular Floating User Profile Chip & Dropdown */
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-0.5 sm:pl-1 sm:pr-2.5 sm:py-0.5 rounded-full bg-[#27272A]/90 hover:bg-[#323238] border border-[#414146] hover:border-[#8535FC] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8535FC]"
                aria-label="User profile menu"
              >
                {/* Circular Avatar SVG */}
                <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden shrink-0 border border-[#8535FC]/60 bg-[#141417]">
                  <Image
                    src={avatarUrl}
                    alt={firstName}
                    width={28}
                    height={28}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>

                {/* User First Name (Visible from 420px up to preserve space on ultra-small screens) */}
                <span className="text-xs font-semibold text-[#EDEDF0] tracking-wide max-w-[60px] sm:max-w-none truncate hidden min-[420px]:inline">
                  {firstName}
                </span>

                <svg
                  className={`w-3.5 h-3.5 text-[#A1A1AA] hidden min-[420px]:inline transition-transform duration-200 ${userMenuOpen ? "rotate-180 text-[#8535FC]" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[#27272A]/95 backdrop-blur-2xl border border-[#414146] shadow-2xl shadow-black/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Account Header */}
                  <div className="px-4 py-3 bg-[#1D1D21]/90 border-b border-[#414146]/60 flex items-center gap-3 rounded-t-2xl">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#8535FC]/60 shrink-0 bg-[#141417]">
                      <Image
                        src={avatarUrl}
                        alt={firstName}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#EDEDF0] truncate">
                        {user?.full_name || firstName}
                      </p>
                      <p className="text-[11px] font-sans text-[#A1A1AA] truncate mt-0.5">
                        {user?.email || "buyer@kodedock.com"}
                      </p>
                      <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 rounded-full border border-[#10B981]/20 mt-1">
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#EDEDF0] hover:bg-[#1D1D21] hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4 text-[#8535FC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>My Purchases (Vault)</span>
                    </Link>

                    <Link
                      href="/wallet"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#EDEDF0] hover:bg-[#1D1D21] hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span>Wallet & Ledger</span>
                    </Link>

                    <Link
                      href="/disputes"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#EDEDF0] hover:bg-[#1D1D21] hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                      <span>Dispute Desk</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#EDEDF0] hover:bg-[#1D1D21] hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4 text-[#C084FC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Account Settings</span>
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-[#414146]/60 pt-1 pb-0.5">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#EF4444] hover:bg-[#1D1D21] transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out: Primary Sign In Button (Design System V2 compliant) */
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-full bg-[#8535FC] hover:bg-[#7822FA] text-xs font-medium text-white transition-all shadow-md shadow-[#8535FC]/20 hover:scale-105 focus:ring-2 focus:ring-[#8535FC]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
