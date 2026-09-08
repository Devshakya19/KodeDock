"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { apiGet } from "@/shared/lib/api/client";
import { Loader2, Star, Download, User, ShoppingCart, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

export interface ProductDetails {
  public_id: string;
  title: string;
  slug: string;
  description?: string;
  long_description?: string;
  price_paise: number;
  original_price_paise?: number;
  tags: string[];
  tech_stack: string[];
  demo_url?: string;
  github_repo_url?: string;
  image_url?: string;
  rating: number;
  review_count: number;
  sales_count: number;
  seller_username?: string;
  seller_avatar?: string;
  category_name?: string;
  updated_at?: string;
}

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await apiGet<ProductDetails>(`/products/${slug}`);
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          setError(res.error || "Product not found");
        }
      } catch (err) {
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Oops!</h2>
          <p>{error || "Product not found."}</p>
          <button
            onClick={() => router.push("/explore")}
            className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(paise / 100);
  };

  return (
    <div className="py-8 pb-24">
      <Link href="/explore" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
        <ArrowLeft size={16} /> Back to Explore
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Media & Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video w-full bg-black/40 rounded-2xl overflow-hidden border border-white/10">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/10">
                <span className="text-2xl font-bold">No Image Available</span>
              </div>
            )}
          </div>

          <div className="space-y-6 bg-white/5 border border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-white">About this product</h2>
            <div className="prose prose-invert max-w-none text-gray-300">
              <p>{product.long_description || product.description || "No description provided."}</p>
            </div>

            {product.tech_stack && product.tech_stack.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tech_stack.map((tech) => (
                    <span key={tech} className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout & Meta */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl sticky top-24">
            <h1 className="text-3xl font-extrabold text-white mb-2">{product.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-white">{product.rating.toFixed(1)}</span>
                <span>({product.review_count} reviews)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Download size={16} />
                <span>{product.sales_count} sales</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-white">
                  {product.price_paise === 0 ? "Free" : formatPrice(product.price_paise)}
                </span>
                {product.original_price_paise && product.original_price_paise > product.price_paise && (
                  <span className="text-lg text-gray-500 line-through mb-1">
                    {formatPrice(product.original_price_paise)}
                  </span>
                )}
              </div>
              <p className="text-sm text-green-400 mt-2 font-medium">One-time payment. Lifetime access.</p>
            </div>

            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-600/20">
              <ShoppingCart size={20} />
              Add to Cart
            </button>

            {product.demo_url && (
              <a href={product.demo_url} target="_blank" rel="noopener noreferrer" className="w-full mt-3 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <ExternalLink size={18} />
                Live Preview
              </a>
            )}

            <hr className="border-white/10 my-6" />

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-800 border border-white/20 overflow-hidden relative flex-shrink-0">
                {product.seller_avatar ? (
                  <Image src={product.seller_avatar} alt={product.seller_username || ""} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-900 text-purple-200 font-bold">
                    {product.seller_username?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400">Created by</p>
                <div className="flex items-center gap-1 text-white font-medium">
                  <User size={14} />
                  <span>{product.seller_username || "Anonymous Developer"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
