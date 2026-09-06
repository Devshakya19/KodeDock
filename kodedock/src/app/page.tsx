import Image from "next/image";
import Link from "next/link";

const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || "http://localhost:3001";

export default function MarketingHomePage() {
  return (
    <div className="relative min-h-screen bg-[#1D1D21] text-[#EDEDF0] selection:bg-[#8535FC]/30 selection:text-white flex flex-col">
      {/* Top Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#8535FC]/20 via-[#06B6D4]/10 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(#8535fc10_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none z-0" />

      {/* TOP MARKETING NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full border-b border-[#414146]/50 bg-[#1D1D21]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="inline-flex items-center gap-3 group transition-transform hover:scale-105">
            <Image
              src="/icons/logo/kd.svg"
              alt="KodeDock Emblem"
              width={34}
              height={34}
              style={{ width: "auto", height: "34px" }}
              className="object-contain"
            />
            <Image
              src="/icons/logo/KodeDock-theme.svg"
              alt="KodeDock"
              width={125}
              height={26}
              style={{ width: "auto", height: "26px" }}
              className="h-6 w-auto object-contain"
            />
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#A1A1AA]">
            <a href="#features" className="hover:text-white transition-colors">
              Protocol Features
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              AST Security
            </a>
            <a href="#escrow" className="hover:text-white transition-colors">
              How Escrow Works
            </a>
            <a
              href={`${PLATFORM_URL}/developer/register`}
              className="text-[#06B6D4] hover:text-[#22d3ee] font-medium transition-colors"
            >
              For Sellers
            </a>
          </nav>

          {/* Action CTAs pointing to Platform */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href={`${PLATFORM_URL}/login`}
              className="px-4 py-2 text-sm font-medium text-[#EDEDF0] hover:text-white bg-[#27272A]/70 hover:bg-[#27272A] border border-[#414146]/60 rounded-xl transition-all"
            >
              Sign In
            </a>
            <a
              href={`${PLATFORM_URL}/register`}
              className="relative group overflow-hidden rounded-xl p-[1px] focus:outline-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#8535FC] to-[#06B6D4] rounded-xl transition-all duration-300 group-hover:opacity-90" />
              <span className="relative flex items-center gap-2 px-4 py-2 rounded-[11px] bg-[#1D1D21] text-white text-sm font-medium transition-all group-hover:bg-transparent">
                <span>Launch App</span>
                <span className="text-[#06B6D4] group-hover:text-white transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#27272A]/80 border border-[#8535FC]/40 backdrop-blur-md mb-8 shadow-lg shadow-[#8535FC]/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8535FC] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8535FC]" />
            </span>
            <span className="text-xs font-mono font-medium text-[#EDEDF0] tracking-wide">
              ZERO-MOCK ARCHITECTURE • REAL 48-HOUR ESCROW
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
            The Bank-Grade Escrow Marketplace for{" "}
            <span className="bg-gradient-to-r from-[#8535FC] via-[#A855F7] to-[#06B6D4] bg-clip-text text-transparent">
              Production Codebases
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
            Stop buying vulnerable, unverified templates. KodeDock inspects every repository with
            real AST parsing, locks funds in 48-hour escrow, and releases payouts only when code
            verifies clean.
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`${PLATFORM_URL}/`}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#8535FC] hover:bg-[#7828e8] text-white font-medium text-base shadow-lg shadow-[#8535FC]/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>Explore Marketplace Shop</span>
              <span>→</span>
            </a>
            <a
              href={`${PLATFORM_URL}/developer/register`}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#27272A]/80 hover:bg-[#27272A] border border-[#414146] text-[#EDEDF0] hover:text-white font-medium text-base transition-all flex items-center justify-center gap-2"
            >
              <span>Sell a Codebase (1% TDS Compliant)</span>
            </a>
          </div>

          {/* High-Trust Invariants Bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-[#27272A]/40 border border-[#414146]/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white font-mono">₹0.00 Float</div>
              <div className="text-xs text-[#A1A1AA] mt-1">100% Integer Paise Arithmetic</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#27272A]/40 border border-[#414146]/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-[#8535FC] font-mono">48h Escrow</div>
              <div className="text-xs text-[#A1A1AA] mt-1">Inspect Before Funds Settle</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#27272A]/40 border border-[#414146]/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-[#06B6D4] font-mono">Tree-Sitter</div>
              <div className="text-xs text-[#A1A1AA] mt-1">Deep AST & Secret Scanning</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#27272A]/40 border border-[#414146]/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-emerald-400 font-mono">RFC 6238</div>
              <div className="text-xs text-[#A1A1AA] mt-1">AES-256-GCM Encrypted 2FA</div>
            </div>
          </div>
        </section>

        {/* TWO PORTALS SHOWCASE */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-16 border-t border-[#414146]/40">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Engineered for Two Sides of the Ecosystem</h2>
            <p className="text-[#A1A1AA] mt-2">Zero friction for buyers, institutional-grade compliance for sellers.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Buyer Card */}
            <div className="p-8 rounded-3xl bg-[#27272A]/40 border border-[#8535FC]/30 relative overflow-hidden group hover:border-[#8535FC]/60 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#8535FC]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="inline-block px-3 py-1 rounded-lg bg-[#8535FC]/20 text-[#8535FC] text-xs font-semibold uppercase tracking-wider mb-4">
                For Buyers & Teams
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Ship Faster with Audit-Verified Code</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">
                Get full Git repositories with architecture diagrams, Docker configs, and zero hidden
                backdoors. Your funds stay locked in the escrow ledger until you verify the codebase.
              </p>
              <ul className="space-y-3 text-sm text-[#EDEDF0] mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-[#8535FC]">✔</span> 48-Hour Inspection Window Guarantee
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#8535FC]">✔</span> Direct AES-256 Encrypted ZIP Delivery
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#8535FC]">✔</span> Instant CGST/SGST/IGST Tax Invoices
                </li>
              </ul>
              <a
                href={`${PLATFORM_URL}/`}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#8535FC] group-hover:text-purple-300 transition-colors"
              >
                <span>Browse Verified Codebases</span>
                <span>→</span>
              </a>
            </div>

            {/* Seller Card */}
            <div className="p-8 rounded-3xl bg-[#27272A]/40 border border-[#06B6D4]/30 relative overflow-hidden group hover:border-[#06B6D4]/60 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="inline-block px-3 py-1 rounded-lg bg-[#06B6D4]/20 text-[#06B6D4] text-xs font-semibold uppercase tracking-wider mb-4">
                For Developers & Creators
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Monetize Production Software Hassle-Free</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">
                Connect your Git repository or upload via 64KB chunked buffers. We automatically deduct
                1.0% Section 194-O TDS, manage escrow release, and wire payouts directly to your bank account.
              </p>
              <ul className="space-y-3 text-sm text-[#EDEDF0] mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-[#06B6D4]">✔</span> Automated Tree-Sitter & Secret Sanitization
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#06B6D4]">✔</span> Double-Entry Balanced Ledger Accounting
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#06B6D4]">✔</span> Instant Bank / UPI Payout Integration
                </li>
              </ul>
              <a
                href={`${PLATFORM_URL}/developer/register`}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#06B6D4] group-hover:text-cyan-300 transition-colors"
              >
                <span>Open Developer Account</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#414146]/50 bg-[#1D1D21] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/icons/logo/kd.svg"
              alt="KodeDock"
              width={26}
              height={26}
              style={{ width: "auto", height: "26px" }}
            />
            <span className="text-sm text-[#A1A1AA]">
              © {new Date().getFullYear()} KodeDock Technologies. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-[#A1A1AA]">
            <a href={`${PLATFORM_URL}/login`} className="hover:text-white transition-colors">
              Platform Login
            </a>
            <a href={`${PLATFORM_URL}/developer/register`} className="hover:text-white transition-colors">
              Seller Hub
            </a>
            <span className="text-emerald-400 font-mono text-xs flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
