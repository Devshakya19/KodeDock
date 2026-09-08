import Link from "next/link";
import Image from "next/image";
import { Star, Download, User } from "lucide-react";

export interface ProductSummary {
  public_id: string;
  title: string;
  slug: string;
  price_paise: number;
  original_price_paise?: number | null;
  image_url?: string | null;
  rating: number;
  review_count: number;
  sales_count: number;
  seller_username?: string | null;
  category_name?: string | null;
}

export default function ProductCard({ product }: { product: ProductSummary }) {
  const formatPrice = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30">
        <div className="relative aspect-video w-full bg-black/40 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/20">
              <CodeIcon size={48} />
            </div>
          )}
          {product.category_name && (
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-medium text-gray-200 border border-white/10">
              {product.category_name}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg text-white leading-tight line-clamp-1 group-hover:text-purple-400 transition-colors mb-2">
            {product.title}
          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-gray-500">({product.review_count})</span>
            </div>
            <div className="flex items-center gap-1">
              <Download size={14} />
              <span>{product.sales_count}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <User size={14} />
              <span className="truncate max-w-[120px]">{product.seller_username || "anonymous"}</span>
            </div>

            <div className="flex flex-col items-end">
              {product.original_price_paise && product.original_price_paise > product.price_paise && (
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(product.original_price_paise)}
                </span>
              )}
              <span className="font-bold text-white">
                {product.price_paise === 0 ? "Free" : formatPrice(product.price_paise)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CodeIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"></polyline>
      <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
  );
}