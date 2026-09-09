"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Zap,
  Terminal,
  Lock,
  ArrowUpRight,
  Heart,
} from "lucide-react";
import { GithubIcon } from "@/shared/components/icons/github";

export default function ShopFooter() {
  return (
    <footer className="w-full bg-[#141417] border-t border-[#414146] text-[#EDEDF0] transition-colors mt-12">
      {/* Upper Features / Trust Micro-Bar */}
      <div className="border-b border-[#414146]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-[#27272A] border border-[#414146] flex items-center justify-center text-[#8535FC] shrink-0">
                <Zap size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#EDEDF0]">Instant Transfer</p>
                <p className="text-[11px] text-[#A1A1AA]">Automated GitHub repo access</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-[#27272A] border border-[#414146] flex items-center justify-center text-[#10B981] shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#EDEDF0]">AST Secret Scan</p>
                <p className="text-[11px] text-[#A1A1AA]">Zero secret leaks & audited code</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-[#27272A] border border-[#414146] flex items-center justify-center text-[#8535FC] shrink-0">
                <Lock size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#EDEDF0]">PostgreSQL Escrow</p>
                <p className="text-[11px] text-[#A1A1AA]">Double-entry ledger security</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-[#27272A] border border-[#414146] flex items-center justify-center text-[#10B981] shrink-0">
                <Terminal size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#EDEDF0]">Production Ready</p>
                <p className="text-[11px] text-[#A1A1AA]">Zero mocks, 100% real tech stacks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Brand Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Column (5 Cols) */}
          <div className="md:col-span-4 lg:col-span-5 space-y-4">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#8535FC] rounded-lg py-0.5"
              aria-label="KodeDock Store Home"
            >
              <Image
                src="/icons/logo/KodeDock-theme.svg"
                alt="KodeDock"
                width={136}
                height={22}
                className="h-6 w-auto object-contain"
              />
              <span className="font-mono text-[9px] tracking-widest uppercase text-[#8535FC] bg-[#8535FC]/10 border border-[#8535FC]/20 px-1.5 py-0.5 rounded">
                Store
              </span>
            </Link>

            <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-sm">
              The premier developer marketplace for production-grade full-stack codebases, AI agent kits, and scalable application architectures. Built for engineers by engineers.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://github.com/Devshakya19/KodeDock"
                target="_blank"
                rel="noopener noreferrer"
                className="size-8 rounded-lg bg-[#27272A] border border-[#414146] hover:border-[#52525B] text-[#A1A1AA] hover:text-[#EDEDF0] flex items-center justify-center transition-colors"
                aria-label="KodeDock GitHub Repository"
              >
                <GithubIcon size={15} />
              </a>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#27272A] border border-[#414146] text-[10px] font-mono text-[#A1A1AA]">
                <span className="size-1.5 rounded-full bg-[#10B981]" />
                <span>Rust & Postgres Core</span>
              </div>
            </div>
          </div>

          {/* Links Columns (7 Cols) */}
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Marketplace Column */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs uppercase tracking-wider text-[#EDEDF0] font-semibold">
                Marketplace
              </h4>
              <ul className="space-y-2 text-xs text-[#A1A1AA]">
                <li>
                  <Link href="/explore" className="hover:text-[#EDEDF0] transition-colors">
                    Explore Codebases
                  </Link>
                </li>
                <li>
                  <Link href="/explore?cat=ai-agents" className="hover:text-[#EDEDF0] transition-colors">
                    AI Agent Kits
                  </Link>
                </li>
                <li>
                  <Link href="/explore?cat=saas-boilerplates" className="hover:text-[#EDEDF0] transition-colors">
                    SaaS Boilerplates
                  </Link>
                </li>
                <li>
                  <Link href="/explore?cat=mobile-suites" className="hover:text-[#EDEDF0] transition-colors">
                    Mobile Suites
                  </Link>
                </li>
                <li>
                  <Link href="/explore?price=free" className="hover:text-[#EDEDF0] transition-colors">
                    Free Open Source
                  </Link>
                </li>
              </ul>
            </div>

            {/* Developers & Sellers Column */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs uppercase tracking-wider text-[#EDEDF0] font-semibold">
                Developers
              </h4>
              <ul className="space-y-2 text-xs text-[#A1A1AA]">
                <li>
                  <Link href="/developer-register" className="hover:text-[#8535FC] transition-colors flex items-center gap-1">
                    <span>Sell Code</span>
                    <ArrowUpRight size={11} />
                  </Link>
                </li>
                <li>
                  <Link href="/seller/dashboard" className="hover:text-[#EDEDF0] transition-colors">
                    Seller HQ
                  </Link>
                </li>
                <li>
                  <Link href="/seller/upload" className="hover:text-[#EDEDF0] transition-colors">
                    Upload Codebase
                  </Link>
                </li>
                <li>
                  <Link href="/seller/payouts" className="hover:text-[#EDEDF0] transition-colors">
                    Payouts & Ledger
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account & Licenses Column */}
            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h4 className="font-mono text-xs uppercase tracking-wider text-[#EDEDF0] font-semibold">
                Account & Keys
              </h4>
              <ul className="space-y-2 text-xs text-[#A1A1AA]">
                <li>
                  <Link href="/profile?tab=purchases" className="hover:text-[#EDEDF0] transition-colors">
                    My Purchases
                  </Link>
                </li>
                <li>
                  <Link href="/profile?tab=licenses" className="hover:text-[#EDEDF0] transition-colors">
                    Commercial Licenses
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-[#EDEDF0] transition-colors">
                    Account Settings
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#EDEDF0] transition-colors">
                    Developer Sign In
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Bar: Legal & Copyright */}
        <div className="mt-12 pt-6 border-t border-[#414146]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#71717A]">
          <p className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} KodeDock Inc. Crafted with</span>
            <Heart size={11} className="text-[#EF4444] fill-[#EF4444]" />
            <span>for verified builders.</span>
          </p>

          <div className="flex items-center gap-4 text-xs">
            <span className="font-mono text-[11px] text-[#A1A1AA]">
              Paise Math & AST Validated
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
