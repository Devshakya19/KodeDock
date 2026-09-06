"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || "http://localhost:3000";

interface HeaderProps {
  onSearchChange?: (term: string) => void;
  searchTerm?: string;
}

export default function PlatformHeader({ onSearchChange, searchTerm = "" }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#414146]/60 bg-[#1D1D21]/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* BRAND EMBLEM & LOGO */}
        <div className="flex items-center gap-6">
          <Link href="/" className="inline-flex items-center gap-3 group transition-transform hover:scale-105">
            <Image
              src="/icons/logo/kd.svg"
              alt="KodeDock Emblem"
              width={32}
              height={32}
              style={{ width: "auto", height: "32px" }}
              className="object-contain"
            />
            <Image
              src="/icons/logo/KodeDock-theme.svg"
              alt="KodeDock"
              width={115}
              height={24}
              style={{ width: "auto", height: "24px" }}
              className="h-6 w-auto object-contain"
            />
          </Link>

          {/* ESCROW BADGE */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#27272A]/70 border border-[#414146]/60 text-[11px] font-mono text-[#A1A1AA]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ESCROW SECURED</span>
          </div>
        </div>

        {/* SEARCH BAR (if applicable) */}
        {onSearchChange && (
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search verified codebases, Rust, Next.js, Go..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-12 py-2 bg-[#27272A]/70 hover:bg-[#27272A] focus:bg-[#1D1D21] border border-[#414146] focus:border-[#8535FC] rounded-xl text-sm text-[#EDEDF0] placeholder-[#71717A] outline-none transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#1D1D21] border border-[#414146] text-[#71717A] rounded">
                /
              </kbd>
            </div>
          </div>
        )}

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/"
            className={`font-medium transition-colors ${
              pathname === "/" ? "text-[#8535FC]" : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            Explore Shop
          </Link>

          <Link
            href="/dashboard"
            className={`font-medium transition-colors ${
              pathname.startsWith("/dashboard") ? "text-[#8535FC]" : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            My Purchases
          </Link>

          <a
            href={MARKETING_URL}
            className="text-[#A1A1AA] hover:text-white transition-colors"
          >
            About Protocol
          </a>
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          {/* SELL CODE CTA */}
          <Link
            href="/developer/products/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#06B6D4]/15 to-[#8535FC]/15 hover:from-[#06B6D4]/25 hover:to-[#8535FC]/25 border border-[#06B6D4]/40 text-[#06B6D4] hover:text-[#22d3ee] text-xs font-semibold tracking-wide uppercase transition-all"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span>Sell Code</span>
          </Link>

          {/* SIGN IN BUTTON */}
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-xl bg-[#27272A]/70 hover:bg-[#27272A] border border-[#414146] text-xs font-medium text-[#EDEDF0] hover:text-white transition-all"
          >
            Sign In
          </Link>

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#A1A1AA] hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#414146]/50 bg-[#1D1D21] px-6 py-4 space-y-3">
          {onSearchChange && (
            <input
              type="text"
              placeholder="Search codebases..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 bg-[#27272A] border border-[#414146] rounded-xl text-sm text-white placeholder-[#71717A]"
            />
          )}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-[#EDEDF0] hover:text-white py-1.5"
          >
            Explore Shop
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-[#EDEDF0] hover:text-white py-1.5"
          >
            My Purchases (Escrow Vault)
          </Link>
          <Link
            href="/developer/products/new"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-[#06B6D4] font-medium py-1.5"
          >
            + Sell a Codebase
          </Link>
          <a
            href={MARKETING_URL}
            className="block text-sm text-[#A1A1AA] hover:text-white py-1.5"
          >
            About Protocol
          </a>
        </div>
      )}
    </header>
  );
}
