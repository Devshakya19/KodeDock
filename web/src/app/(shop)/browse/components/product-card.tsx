"use client";

import Link from "next/link";
import { Star, Code, ArrowRight } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

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
}

export function ProductCard({
  id,
  title,
  description,
  price,
  originalPrice,
  category,
  seller,
  rating,
  reviews,
  image,
  tags = [],
}: ProductCardProps) {
  return (
    <Link href={`/products/${id}`} className="group h-full flex flex-col relative">
      <div className="bg-background rounded-[20px] p-2 sm:p-2.5 border border-border/80 hover:border-blue-200 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.1)] transition-all duration-300 h-full flex flex-col relative z-10 hover:-translate-y-1">
        
        {/* Image Container */}
        <div className="relative aspect-[4/3] rounded-[14px] bg-secondary/50 overflow-hidden mb-4 border border-border">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              <Code className="w-10 h-10 text-muted-foreground/80" />
            </div>
          )}
          
          <Badge
            variant="secondary"
            className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-1 bg-background/95 backdrop-blur-md border border-border/20 text-foreground shadow-sm"
          >
            {category}
          </Badge>
          
          {originalPrice && originalPrice > price && (
            <Badge className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-1 bg-success text-primary-foreground border-0 shadow-md shadow-emerald-500/20">
              -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
            </Badge>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
            <div className="translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-background text-foreground text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-1.5 flex-1 flex flex-col">
          <h3 className="font-bold text-foreground text-[15px] leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
            {title}
          </h3>
          <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed flex-1">
            {description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 mb-1">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] font-medium px-2 py-0.5 bg-secondary text-muted-foreground rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer details */}
          <div className="mt-auto pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-[12px] font-bold text-foreground">{rating}</span>
                <span className="text-[11px] font-medium text-muted-foreground">({reviews})</span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[100px]">
                by {seller}
              </span>
            </div>

            <div className="flex items-end justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-lg font-black tracking-tight ${price === 0 ? "text-success" : "text-foreground"}`}>
                  {price === 0 ? "Free" : `₹${price}`}
                </span>
                {originalPrice && originalPrice > price && price > 0 && (
                  <span className="text-[13px] font-semibold text-muted-foreground line-through">₹{originalPrice}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
