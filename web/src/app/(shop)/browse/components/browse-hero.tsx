"use client";

import { Sparkles, GitBranch, ShieldCheck, Box, Zap } from "lucide-react";
import Image from "next/image";

export function BrowseHero() {
  return (
    <div className="relative w-full rounded-[28px] md:rounded-[32px] border border-[#282240] p-7 sm:p-10 md:p-12 lg:p-14 mb-10 overflow-hidden shadow-[0_12px_50px_-10px_rgba(139,92,246,0.25)] min-h-[380px] md:min-h-[430px] flex items-center bg-[#07060c]">
      {/* Real Sci-Fi Background Hero Image */}
      <Image
        src="/images/browse-hero.png"
        alt="Build. Ship. Scale. All in KodeDock."
        fill
        priority
        sizes="(max-width: 1200px) 100vw, 1500px"
        className="object-cover object-right md:object-[75%_center] lg:object-center pointer-events-none select-none transition-transform duration-700 ease-out"
      />

      {/* Deep Shadow & Contrast Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#07060c] via-[#07060c]/90 via-48% to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07060c]/70 via-transparent to-[#07060c]/20 pointer-events-none" />

      {/* Cyber Grid Subtle Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_20%_40%,#000_50%,transparent_100%)] pointer-events-none" />

      {/* Left Content Area */}
      <div className="relative z-10 max-w-xl lg:max-w-3xl space-y-6">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950/60 border border-violet-500/30 text-[11px] font-extrabold uppercase tracking-widest text-violet-300 backdrop-blur-md shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Developer-First Marketplace
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-white leading-[1.1] tracking-tight">
          Build. Ship. Scale. <br />
          All in{" "}
          <span className="text-violet-400 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">
            KodeDock.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-[15px] sm:text-[16px] leading-relaxed max-w-lg font-medium">
          Discover production-ready templates, boilerplates, UI kits, and tools from top developers.
          Save time. Ship faster.
        </p>

        {/* Redesigned Futuristic Stats Deck */}
        <div className="pt-2">
          <div className="inline-flex flex-wrap sm:flex-nowrap items-stretch gap-2.5 p-2 rounded-2xl bg-[#090714]/85 border border-violet-500/30 backdrop-blur-xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.8),0_0_20px_-5px_rgba(139,92,246,0.25)]">
            {/* Metric 1: Curated Assets */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#130f24]/80 hover:bg-[#1a1433] border border-[#261f42] hover:border-violet-500/50 transition-all duration-300 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/30 to-indigo-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300 shadow-inner group-hover:scale-105 transition-transform">
                <Box className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-black text-white tracking-tight">2,400+</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-wider">
                    Curated
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                  Verified Code Assets
                </p>
              </div>
            </div>

            {/* Metric 2: Instant GitHub Push */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#130f24]/80 hover:bg-[#1a1433] border border-[#261f42] hover:border-emerald-500/50 transition-all duration-300 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600/30 to-teal-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-inner group-hover:scale-105 transition-transform">
                <GitBranch className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-black text-white tracking-tight">&lt; 30s</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                    Instant
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                  Automated GitHub Push
                </p>
              </div>
            </div>

            {/* Metric 3: Escrow Buyer Protection */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#130f24]/80 hover:bg-[#1a1433] border border-[#261f42] hover:border-amber-500/50 transition-all duration-300 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600/30 to-orange-600/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-black text-white tracking-tight">100%</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                    Escrow
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                  7-Day Safe Guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
