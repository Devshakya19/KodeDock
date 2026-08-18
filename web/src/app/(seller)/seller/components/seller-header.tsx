"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { Sparkles, RefreshCw, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="mb-10 md:mb-16 pt-4">
      {backHref && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all mb-6 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm hover:border-slate-300 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform ease-[cubic-bezier(0.22,1,0.36,1)] duration-300" />
            <span>{backLabel}</span>
          </Link>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="max-w-2xl"
        >
          {badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{badge}</span>
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tighter leading-[1.1] flex flex-wrap" aria-label={title}>
            {title.split(" ").map((word, wordIndex, wordsArray) => {
              const previousCharsCount = wordsArray.slice(0, wordIndex).join("").length;
              return (
                <span key={wordIndex} className="inline-flex mr-[0.25em] last:mr-0">
                  {word.split("").map((char, charIndex) => (
                    <motion.span
                      key={charIndex}
                      initial={{ opacity: 0, filter: "blur(8px)", y: 15 }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      transition={{
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.15 + (previousCharsCount + charIndex) * 0.03,
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              );
            })}
          </h1>
          {description && (
            <p className="text-slate-500 mt-4 text-base sm:text-lg font-medium leading-relaxed">
              {description}
            </p>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="flex items-center flex-wrap gap-4"
        >
          {(onRefresh || lastUpdated) && (
            <div className="flex items-center gap-3 bg-white p-1.5 rounded-[1.25rem] border border-slate-200/80 shadow-sm">
              <div className="px-3 flex items-center gap-3">
                {lastUpdated && (
                  <span className="text-[10px] font-bold text-slate-400 tabular-nums uppercase tracking-[0.15em]">
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
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live
              </div>
            </div>
          )}

          {actions}
        </motion.div>
      </div>
    </div>
  );
}
