"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { Sparkles, RefreshCw, ArrowLeft, Radio } from "lucide-react";

interface SellerHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  actions?: ReactNode;
}

export function SellerHeader({
  badge = "Creator Studio",
  title,
  description,
  backHref,
  backLabel = "Back",
  lastUpdated,
  onRefresh,
  refreshing = false,
  actions,
}: SellerHeaderProps) {
  return (
    <div className="mb-8 md:mb-10">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all mb-4 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>{backLabel}</span>
        </Link>
      )}

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.18em] mb-3 shadow-xs">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>{badge}</span>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-slate-600 mt-2 text-sm sm:text-[15px] max-w-2xl font-medium leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {(onRefresh || lastUpdated) && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
              {lastUpdated && (
                <span className="text-[10px] font-bold text-slate-400 tabular-nums uppercase tracking-wider">
                  {lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Sync with live database"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      refreshing ? "animate-spin text-blue-600" : ""
                    }`}
                  />
                  <span>Sync</span>
                </button>
              )}
              <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-wider ml-1 pl-2 border-l border-slate-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live
              </span>
            </div>
          )}

          {actions}
        </div>
      </div>
    </div>
  );
}
