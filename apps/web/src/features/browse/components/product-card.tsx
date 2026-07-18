"use client";
import { GithubIcon } from "@/shared/components/github-icon";

import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
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
    <Link href={`/products/${id}`}>
      <Card className="group border border-slate-200 hover:border-slate-950 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden h-full">
        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <GithubIcon className="w-10 h-10 text-slate-400" />
          )}
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 text-[10px] px-2 py-0.5 bg-white/90 border border-slate-200"
          >
            {category}
          </Badge>
          {originalPrice && originalPrice > price && (
            <Badge className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-emerald-500 text-white border-0">
              {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-slate-950 text-sm leading-snug group-hover:text-slate-700 transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{description}</p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 mt-3">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-slate-700">{rating}</span>
            <span className="text-xs text-slate-400">({reviews})</span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-950">₹{price}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-slate-400 line-through">₹{originalPrice}</span>
              )}
            </div>
            <span className="text-[11px] text-slate-500">by {seller}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
