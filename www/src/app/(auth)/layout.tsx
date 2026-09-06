import React from "react";
import Image from "next/image";
import Link from "next/link";

const techBadges = [
  { name: "Next.js", icon: "/icons/tech/nextjs.svg" },
  { name: "TypeScript", icon: "/icons/tech/typescript.svg" },
  { name: "React", icon: "/icons/tech/react.svg" },
  { name: "Python", icon: "/icons/tech/python.svg" },
  { name: "Node.js", icon: "/icons/tech/nodejs.svg" },
  { name: "AWS", icon: "/icons/tech/aws.svg" },
  { name: "Tailwind", icon: "/icons/tech/tailwindcss.svg" },
  { name: "GitHub", icon: "/icons/tech/github.svg", invert: true },
  { name: "Stripe", icon: "/icons/tech/stripe.svg" },
  { name: "Razorpay", icon: "/icons/tech/razorpay.svg" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-[#1D1D21] text-[#EDEDF0] flex flex-col lg:flex-row overflow-x-hidden selection:bg-[#8535FC]/30 selection:text-white">
      {/* LEFT SHOWCASE COLUMN (Desktop: 52% width) */}
      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[50%] flex-col justify-between p-12 xl:p-16 border-r border-[#414146]/50 overflow-hidden">
        {/* Background Artwork Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/auth-bg.jpg"
            alt="KodeDock Cybernetic Infrastructure"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-cover object-center opacity-30 scale-105 transition-transform duration-1000 hover:scale-100"
          />
          {/* Multi-layered futuristic dark gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1D1D21] via-[#1D1D21]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1D1D21]/50 to-[#1D1D21]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(133,53,252,0.25)_0%,transparent_60%)]" />
          {/* Subtle Cyber Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#8535fc15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        </div>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-10 w-96 h-96 bg-[#8535FC]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Direct Brand Logo & Live Protocol Status */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group transition-transform hover:scale-105">
            <Image
              src="/icons/logo/kd.svg"
              alt="KodeDock Emblem"
              width={34}
              height={34}
              className="object-contain"
            />
            <Image
              src="/icons/logo/KodeDock-theme.svg"
              alt="KodeDock"
              width={125}
              height={26}
              className="h-6 w-auto object-contain"
            />
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#27272A]/80 border border-[#414146]/70 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono font-medium text-[#EDEDF0] tracking-wide">
              ESCROW PROTOCOL ONLINE
            </span>
          </div>
        </div>

        {/* Center Hero Copy & Tech Cloud */}
        <div className="relative z-10 my-auto py-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#8535FC]/15 to-[#06B6D4]/15 border border-[#8535FC]/30 text-xs font-medium text-purple-200 mb-6 backdrop-blur-md shadow-[0_0_24px_rgba(133,53,252,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8535FC] shadow-[0_0_8px_#8535FC]" />
            <span>Automated AST Escrow & Code Vault</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#8535FC]/30 text-white ml-1">v2.1</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold font-heading tracking-tight leading-[1.12] text-white">
            Trade & Deploy <br />
            <span className="bg-gradient-to-r from-white via-purple-100 to-[#8535FC] bg-clip-text text-transparent">
              Production Codebases
            </span>{" "}
            with Real Escrow.
          </h1>

          <p className="mt-4 text-base text-[#A1A1AA] leading-relaxed font-sans">
            The escrow exchange where engineering teams buy and sell turnkey microservices, full-stack templates, and battle-tested repositories with zero leak risks.
          </p>

          {/* 3 Core Value Props */}
          <div className="mt-6 grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-[#27272A]/50 border border-[#414146]/60 backdrop-blur-sm">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span className="text-emerald-400 text-sm">⚡</span> AST Scanning
              </div>
              <p className="text-[11px] text-[#A1A1AA] mt-1 leading-snug">0 leaked secrets</p>
            </div>
            <div className="p-3 rounded-xl bg-[#27272A]/50 border border-[#414146]/60 backdrop-blur-sm">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span className="text-purple-400 text-sm">🔒</span> Safe Escrow
              </div>
              <p className="text-[11px] text-[#A1A1AA] mt-1 leading-snug">Funds locked safely</p>
            </div>
            <div className="p-3 rounded-xl bg-[#27272A]/50 border border-[#414146]/60 backdrop-blur-sm">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span className="text-cyan-400 text-sm">📦</span> Direct Handoff
              </div>
              <p className="text-[11px] text-[#A1A1AA] mt-1 leading-snug">AES-256 S3 stream</p>
            </div>
          </div>

          {/* Supported Stack Dock */}
          <div className="mt-8 pt-6 border-t border-[#414146]/40">
            <p className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]/80 mb-3.5">
              Supported Stacks & Integrations
            </p>
            <div className="flex flex-wrap gap-2.5">
              {techBadges.map((tech) => (
                <div
                  key={tech.name}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#27272A]/70 border border-[#414146]/60 backdrop-blur-sm transition-all hover:border-[#8535FC]/60 hover:bg-[#27272A] hover:scale-105 hover:shadow-[0_0_12px_rgba(133,53,252,0.18)]"
                >
                  <Image
                    src={tech.icon}
                    alt={tech.name}
                    width={16}
                    height={16}
                    className={`w-4 h-4 object-contain ${tech.invert ? "invert brightness-200" : ""}`}
                  />
                  <span className="text-xs font-medium text-[#EDEDF0]">
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Social Proof & Trust Footer */}
        <div className="relative z-10 pt-6 border-t border-[#414146]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-[11px] font-bold text-white ring-2 ring-[#1D1D21]">
                AK
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-[11px] font-bold text-white ring-2 ring-[#1D1D21]">
                SR
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-[11px] font-bold text-white ring-2 ring-[#1D1D21]">
                DX
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#27272A] text-[10px] font-bold text-[#EDEDF0] ring-2 ring-[#1D1D21]">
                +2k
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Trusted by 2,400+ Developers</p>
              <p className="text-[11px] text-[#A1A1AA]">Trading verified production software</p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#27272A]/70 border border-[#414146]/60 backdrop-blur-sm">
            <div className="flex text-amber-400 text-xs">★★★★★</div>
            <span className="text-xs font-mono font-medium text-white">4.9/5</span>
          </div>
        </div>
      </div>

      {/* RIGHT AUTH FORM AREA */}
      <div className="relative flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 z-10">
        {/* Subtle Ambient Glows behind Right Area */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8535FC]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#06B6D4]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Mobile Header (Brand link visible on small screens) */}
        <div className="lg:hidden flex items-center justify-between w-full max-w-md lg:max-w-[490px] mx-auto mb-6 pb-4 border-b border-[#414146]/40">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image
              src="/icons/logo/kd.svg"
              alt="KodeDock"
              width={28}
              height={28}
              className="object-contain"
            />
            <Image
              src="/icons/logo/KodeDock-theme.svg"
              alt="KodeDock"
              width={105}
              height={21}
              className="h-5 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#27272A] border border-[#414146]/60 text-[10px] font-mono text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Escrow</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md lg:max-w-[490px] mx-auto my-auto py-4 px-1 sm:px-0">
          {children}
        </div>

        {/* Footer info & compliance */}
        <div className="w-full max-w-md lg:max-w-[490px] mx-auto pt-6 text-center border-t border-[#414146]/30">
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-[#A1A1AA]/80 font-mono">
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>AES-256-GCM Cryptographic Sessions</span>
            </span>
            <span className="text-[#414146] hidden sm:inline">•</span>
            <span className="text-purple-300">Argon2id Protected</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-[11px] text-[#A1A1AA]/60 mt-2">
            <span>© {new Date().getFullYear()} KodeDock Inc.</span>
            <span>•</span>
            <Link href="#" className="hover:text-[#EDEDF0] transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="#" className="hover:text-[#EDEDF0] transition-colors">Terms</Link>
            <span>•</span>
            <Link href="#" className="hover:text-[#EDEDF0] transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
