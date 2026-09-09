"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Download, ShieldCheck, ArrowRight, Terminal } from "lucide-react";

export interface ProductSummary {
  public_id: string;
  title: string;
  slug: string;
  description?: string | null;
  price_paise: number;
  original_price_paise?: number | null;
  image_url?: string | null;
  rating: number;
  review_count: number;
  sales_count: number;
  tech_stack?: string[] | null;
  seller_username?: string | null;
  category_name?: string | null;
}

export default function ProductCard({ product }: { product: ProductSummary }) {
  // Format integer paise to INR rupees (zero float, integer math)
  const formatPrice = (paise: number) => {
    const rupees = Math.floor(paise / 100);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rupees);
  };

  const discountPercent =
    product.original_price_paise &&
    product.original_price_paise > product.price_paise
      ? Math.round(
          ((product.original_price_paise - product.price_paise) /
            product.original_price_paise) *
            100
        )
      : 0;

  return (
    <div className="group flex flex-col justify-between bg-[#27272A] border border-[#414146] hover:border-[#52525B] rounded-lg transition-all duration-200 overflow-hidden">
      {/* Top Media / Code Preview Area */}
      <Link href={`/product/${product.slug}`} className="block relative">
        <div className="relative aspect-[16/9] w-full bg-[#141417] border-b border-[#414146] overflow-hidden flex items-center justify-center">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            /* Developer-centric Code Header Preview when no image */
            <div className="w-full h-full p-2.5 sm:p-4 flex flex-col justify-between bg-[#141417] text-[#A1A1AA] select-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="size-1.5 sm:size-2 rounded-full bg-[#414146]" />
                  <span className="size-1.5 sm:size-2 rounded-full bg-[#414146]" />
                  <span className="size-1.5 sm:size-2 rounded-full bg-[#414146]" />
                </div>
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono text-[#A1A1AA]">
                  <Terminal size={10} className="text-[#8535FC]" />
                  <span>main</span>
                </div>
              </div>

              <div className="font-mono text-[10px] sm:text-xs text-[#A1A1AA] space-y-0.5 sm:space-y-1">
                <p className="text-[#8535FC] font-semibold flex items-center gap-1 truncate">
                  <span>$</span>
                  <span className="text-[#EDEDF0] truncate">
                    git clone {product.slug}
                  </span>
                </p>
                <p className="text-[9px] sm:text-[11px] text-[#A1A1AA] truncate hidden xs:block">
                  ✓ Verified AST clean & 0 leaks
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#414146]/50 text-[9px] sm:text-[10px] font-mono">
                <span className="text-[#10B981] flex items-center gap-1">
                  <ShieldCheck size={11} />
                  <span>Audited</span>
                </span>
                <span className="text-[#A1A1AA] hidden sm:inline">Paise Safe</span>
              </div>
            </div>
          )}

          {/* Category Pill Tag */}
          {product.category_name && (
            <div className="absolute top-1.5 sm:top-2.5 left-1.5 sm:left-2.5 bg-[#1D1D21]/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded border border-[#414146] text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[#EDEDF0] truncate max-w-[120px]">
              {product.category_name}
            </div>
          )}

          {/* Discount Tag */}
          {discountPercent > 0 && (
            <div className="absolute top-1.5 sm:top-2.5 right-1.5 sm:right-2.5 bg-[#10B981]/15 backdrop-blur-sm px-1.5 py-0.5 rounded border border-[#10B981]/30 text-[9px] sm:text-[10px] font-mono font-semibold text-[#10B981]">
              {discountPercent}%
            </div>
          )}
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Slug */}
          <Link href={`/product/${product.slug}`} className="block group/title">
            <h3 className="font-heading font-semibold text-xs sm:text-base text-[#EDEDF0] group-hover/title:text-[#8535FC] transition-colors line-clamp-2 leading-snug mb-1 sm:mb-1.5">
              {product.title}
            </h3>
          </Link>

          {/* Description */}
          {product.description && (
            <p className="text-[11px] sm:text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed mb-2 sm:mb-3">
              {product.description}
            </p>
          )}

          {/* Tech Stack Pills */}
          {product.tech_stack && product.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5 sm:mb-4">
              {product.tech_stack.slice(0, 2).map((tech) => (
                <span
                  key={tech}
                  className="px-1.5 sm:px-2 py-0.5 rounded bg-[#141417] border border-[#414146] text-[9px] sm:text-[10px] font-mono text-[#A1A1AA]"
                >
                  {tech}
                </span>
              ))}
              {product.tech_stack.length > 2 && (
                <span className="px-1 sm:px-1.5 py-0.5 rounded bg-[#141417] border border-[#414146] text-[9px] sm:text-[10px] font-mono text-[#A1A1AA]">
                  +{product.tech_stack.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-2 sm:pt-3 border-t border-[#414146]/70">
          {/* Metadata Row: Seller + Rating */}
          <div className="flex items-center justify-between text-xs text-[#A1A1AA] mb-2 sm:mb-3">
            <div className="flex items-center gap-1 truncate max-w-[75px] sm:max-w-[130px]">
              <span className="font-mono text-[10px] sm:text-[11px] text-[#EDEDF0] truncate">
                @{product.seller_username || "kodedock"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 font-mono text-[10px] sm:text-[11px]">
              <div className="flex items-center gap-0.5 sm:gap-1 text-[#EDEDF0]">
                <Star size={11} className="text-[#F59E0B] fill-[#F59E0B]" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <div className="hidden xs:flex items-center gap-1 text-[#A1A1AA]">
                <Download size={11} />
                <span>{product.sales_count}</span>
              </div>
            </div>
          </div>

          {/* Price & Action Row */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            <div className="flex flex-col min-w-0">
              {product.original_price_paise &&
                product.original_price_paise > product.price_paise && (
                  <span className="text-[10px] sm:text-[11px] font-mono text-[#71717A] line-through truncate">
                    {formatPrice(product.original_price_paise)}
                  </span>
                )}
              <span
                className={`font-heading font-bold text-xs sm:text-base truncate ${
                  product.price_paise === 0
                    ? "text-[#10B981]"
                    : "text-[#EDEDF0]"
                }`}
              >
                {product.price_paise === 0
                  ? "Free"
                  : formatPrice(product.price_paise)}
              </span>
            </div>

            <Link
              href={`/product/${product.slug}`}
              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium bg-[#8535FC] hover:bg-[#9B51E0] text-white transition-colors group/btn shrink-0"
            >
              <span className="hidden sm:inline">View Code</span>
              <span className="sm:hidden">View</span>
              <ArrowRight
                size={11}
                className="transition-transform group-hover/btn:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}