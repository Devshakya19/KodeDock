import React from "react";
import Image from "next/image";
import Link from "next/link";

const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || "http://localhost:3000";

export default function PlatformFooter() {
  return (
    <footer className="w-full border-t border-[#414146]/50 bg-[#1D1D21] text-[#A1A1AA] text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#414146]/30">
          <div className="flex items-center gap-3">
            <Image
              src="/icons/logo/kd.svg"
              alt="KodeDock"
              width={26}
              height={26}
              style={{ width: "auto", height: "26px" }}
            />
            <span className="text-sm font-semibold text-[#EDEDF0]">
              KodeDock Platform & Escrow Engine
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">
              Marketplace Shop
            </Link>
            <Link href="/developer/products/new" className="hover:text-white transition-colors text-[#06B6D4]">
              Seller Studio
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Buyer Library
            </Link>
            <a href={MARKETING_URL} className="hover:text-white transition-colors">
              Marketing & Docs
            </a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#71717A]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Escrow Settlement State Machine: OPERATIONAL</span>
          </div>
          <div>
            Built with 100% Zero-Mock Rust Engine & Next.js 16. Integer paise financial accounting.
          </div>
        </div>
      </div>
    </footer>
  );
}
