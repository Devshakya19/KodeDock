"use client";

import Link from "next/link";
import { Star, Code2, ArrowRight } from "lucide-react";

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  seller: string;
  rating: number;
  reviews: number;
  image?: string;
  tags?: string[];
  salesCount?: number;
  badgeType?: "best-seller" | "top-rated" | "new" | "popular" | null;
}

export function ProductCard({
  id,
  title,
  description,
  price,
  originalPrice,
  category,
  seller,
  rating = 0,
  reviews = 0,
  image,
  tags = [],
  salesCount = 0,
  badgeType,
}: ProductCardProps) {
  // Infer badge type dynamically from real metrics
  let badgeLabel = "";
  let badgeStyle = "";

  if (badgeType === "best-seller" || (!badgeType && salesCount >= 20)) {
    badgeLabel = "BEST SELLER";
    badgeStyle =
      "bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30 dark:border-rose-500/40 shadow-rose-950/20 dark:shadow-rose-950/50";
  } else if (badgeType === "top-rated" || (!badgeType && rating >= 4.8 && reviews >= 5)) {
    badgeLabel = "TOP RATED";
    badgeStyle =
      "bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:border-amber-500/40 shadow-amber-950/20 dark:shadow-amber-950/50";
  } else if (badgeType === "new" || (!badgeType && salesCount < 5 && reviews === 0)) {
    badgeLabel = "NEW";
    badgeStyle =
      "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-500/40 shadow-emerald-950/20 dark:shadow-emerald-950/50";
  } else if (badgeType === "popular" || (!badgeType && salesCount >= 5)) {
    badgeLabel = "POPULAR";
    badgeStyle =
      "bg-violet-500/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30 dark:border-violet-500/40 shadow-violet-950/20 dark:shadow-violet-950/50";
  }

  const displayTags = tags.length > 0 ? tags.slice(0, 3).join(", ") : description;

  return (
    <Link href={`/products/${id}`} className="group h-full flex flex-col relative">
      <div className="bg-white dark:bg-[#100e1c] rounded-[22px] p-3 border border-slate-200 dark:border-[#211d35] group-hover:border-violet-500/50 shadow-sm hover:shadow-lg dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] dark:group-hover:shadow-[0_8px_35px_-5px_rgba(139,92,246,0.25)] transition-all duration-300 h-full flex flex-col relative z-10 group-hover:-translate-y-1">
        {/* Preview Thumbnail Container */}
        <div className="relative aspect-[16/10] rounded-[16px] bg-slate-100 dark:bg-[#161326] overflow-hidden mb-3.5 border border-slate-200 dark:border-[#26213d]">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#131024] dark:to-[#1e1936] flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              <Code2 className="w-10 h-10 text-slate-400 dark:text-slate-600" />
            </div>
          )}

          {/* Status Badge Top Left */}
          {badgeLabel && (
            <div
              className={`absolute top-2.5 left-2.5 text-[9px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md border backdrop-blur-md shadow-xs ${badgeStyle}`}
            >
              {badgeLabel}
            </div>
          )}

          {/* Discount Tag Top Right if applicable */}
          {originalPrice && originalPrice > price && price > 0 && (
            <div className="absolute top-2.5 right-2.5 text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500 text-white shadow-xs">
              -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
            </div>
          )}

          {/* Hover View Button Overlay */}
          <div className="absolute inset-0 bg-[#070510]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
            <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-300 bg-violet-600 text-white text-[12px] font-bold px-4 py-2 rounded-xl shadow-lg shadow-violet-900/50 flex items-center gap-1.5 border border-violet-400/40">
              View Template <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="px-1.5 flex-1 flex flex-col justify-between space-y-2.5">
          <div>
            {/* Category / Asset Type Subtitle & Creator */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                {category || "Uncategorized"}
              </span>
              {seller && (
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate max-w-[110px]">
                  by {seller}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-bold text-slate-900 dark:text-white text-[15px] leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors line-clamp-1 mb-1">
              {title}
            </h3>

            {/* Tech Stack or Description */}
            <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium truncate">
              {displayTags}
            </p>
          </div>

          {/* Rating and Pricing Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-[#1e1b2f] flex items-center justify-between">
            {/* Star Rating & Review Count */}
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-[12px] font-bold text-slate-800 dark:text-white">
                {rating > 0 ? rating.toFixed(1) : "0.0"}
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                ({reviews})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1.5">
              {originalPrice && originalPrice > price && price > 0 && (
                <span className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 line-through">
                  ₹{originalPrice}
                </span>
              )}
              <span
                className={`text-[16px] font-black tracking-tight ${price === 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-900 dark:text-white"
                  }`}
              >
                {price === 0 ? "Free" : `₹${price}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
