"use client";
import { GithubIcon } from "@/shared/components/github-icon";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  ExternalLink,
  Clock,
  Eye,
  Loader2,
  Shield,
  Zap,
  Users,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { auth } from "@/shared/lib/auth";
import { apiGet } from "@/shared/lib/api";

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string;
  price_paise: number;
  original_price_paise: number | null;
  category_name: string | null;
  seller_id: string;
  tags: string[];
  tech_stack: string[];
  status: string;
  image_url: string | null;
  demo_url: string | null;
  sales_count: number;
  view_count: number;
  rating: string | number;
  review_count: number;
  created_at: string;
}

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  user: { full_name: string; avatar_url: string | null } | null;
  created_at: string;
}

interface SellerProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  github_username: string | null;
  bio: string | null;
}

function StarRating({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");

  const productId = params.id as string;

  useEffect(() => {
    async function loadProduct() {
      try {
        const productResult = await apiGet<Product>(`/products/${productId}`);
        if (productResult.success && productResult.data) {
          setProduct(productResult.data);

          // Fetch seller profile
          if (productResult.data.seller_id) {
            const sellerResult = await apiGet<SellerProfile>(`/profile/${productResult.data.seller_id}`);
            if (sellerResult.success && sellerResult.data) {
              setSeller(sellerResult.data);
            }
          }
        } else {
          setError("Product not found");
          setLoading(false);
          return;
        }

        const reviewsResult = await apiGet<Review[]>(`/reviews/${productId}`);
        setReviews(reviewsResult.data ?? []);
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    if (productId) loadProduct();
  }, [productId]);

  async function handleBuy() {
    setBuying(true);
    setError("");
    try {
      const user = await auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      router.push(`/checkout?product_id=${productId}`);
    } catch {
      setError("Failed to process purchase");
    } finally {
      setBuying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-950 mb-2">Product not found</h1>
          <p className="text-slate-600 mb-4">{error || "The product you're looking for doesn't exist."}</p>
          <Link href="/browse">
            <Button className="bg-slate-950 text-white hover:bg-slate-800">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = product.price_paise / 100;
  const originalPrice = product.original_price_paise ? product.original_price_paise / 100 : null;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const ratingNum = typeof product.rating === "string" ? parseFloat(product.rating) : product.rating;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/browse" className="flex items-center gap-2 text-slate-600 hover:text-slate-950 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Browse</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Eye className="w-4 h-4" />
            <span>{product.view_count} views</span>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image + Purchase Section */}
        <div className="grid lg:grid-cols-5 gap-8 mb-10">
          {/* Image (3 cols) */}
          <div className="lg:col-span-3">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="aspect-video flex items-center justify-center">
                  <GithubIcon className="w-20 h-20 text-slate-300" />
                </div>
              )}
              {discount > 0 && (
                <Badge className="absolute top-4 right-4 bg-emerald-500 text-white border-0 text-sm px-3 py-1">
                  {discount}% OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Purchase Card (2 cols) */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-5">
              {/* Category */}
              <Badge variant="secondary" className="bg-slate-100 border-slate-200 text-slate-700 text-xs px-3 py-1">
                {product.category_name || "Uncategorized"}
              </Badge>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 leading-tight">
                {product.title}
              </h1>

              {/* Rating + Stats */}
              <div className="flex items-center gap-3">
                <StarRating rating={ratingNum} />
                <span className="text-sm font-medium text-slate-900">{ratingNum.toFixed(1)}</span>
                <span className="text-sm text-slate-400">({product.review_count} reviews)</span>
                <span className="text-slate-300">|</span>
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5" /> {product.sales_count} sales
                </span>
              </div>

              {/* Price */}
              <Card className="border-slate-200 bg-slate-50">
                <CardContent className="p-5">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-3xl font-bold text-slate-950">₹{price.toLocaleString()}</span>
                    {originalPrice && (
                      <span className="text-lg text-slate-400 line-through">₹{originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  {discount > 0 && (
                    <p className="text-sm text-emerald-600 font-medium">
                      Save ₹{(originalPrice! - price).toLocaleString()} ({discount}% off)
                    </p>
                  )}

                  <Button
                    onClick={handleBuy}
                    disabled={buying}
                    className="w-full h-12 mt-4 bg-slate-950 text-white hover:bg-slate-800 text-base font-semibold rounded-xl"
                  >
                    {buying ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Buy Now
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-2 mt-3 justify-center text-xs text-slate-500">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Secure payment via Razorpay</span>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Info */}
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/sellers/${product.seller_id}`} className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                        {seller?.avatar_url ? (
                          <img src={seller.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          seller?.full_name?.[0]?.toUpperCase() || "S"
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-950 truncate">{seller?.full_name || "Seller"}</div>
                        {seller?.github_username && (
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <GithubIcon className="w-3 h-3" />@{seller.github_username}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Info */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-slate-50">
                  <div className="text-lg font-bold text-slate-950">{product.sales_count}</div>
                  <div className="text-xs text-slate-500">Sales</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-50">
                  <div className="text-lg font-bold text-slate-950">{product.view_count}</div>
                  <div className="text-xs text-slate-500">Views</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-50">
                  <div className="text-lg font-bold text-slate-950">{product.review_count}</div>
                  <div className="text-xs text-slate-500">Reviews</div>
                </div>
              </div>

              {product.demo_url && (
                <a
                  href={product.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors w-full"
                >
                  <ExternalLink className="w-4 h-4" />
                  Live Demo
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-xl font-bold text-slate-950 mb-3">Description</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                {product.description || "No description available."}
              </p>
            </section>

            {product.long_description && (
              <section>
                <h2 className="text-xl font-bold text-slate-950 mb-3">Details</h2>
                <div className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap bg-slate-50 rounded-xl p-5">
                  {product.long_description}
                </div>
              </section>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-950 mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-slate-100 border-slate-200 text-slate-700 px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Tech Stack */}
            {product.tech_stack && product.tech_stack.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-950 mb-3">Tech Stack</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tech_stack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="bg-blue-50 border-blue-200 text-blue-700 px-3 py-1">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Reviews Sidebar */}
          <div className="lg:col-span-1">
            <section>
              <h2 className="text-xl font-bold text-slate-950 mb-4">
                Reviews ({product.review_count})
              </h2>
              {reviews.length === 0 ? (
                <Card className="border-slate-200">
                  <CardContent className="p-8 text-center">
                    <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No reviews yet. Be the first to review!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <StarRating rating={review.rating} size="w-3.5 h-3.5" />
                          <span className="text-xs text-slate-400">
                            {new Date(review.created_at).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                        {review.title && (
                          <h4 className="text-sm font-semibold text-slate-950 mb-1">{review.title}</h4>
                        )}
                        <p className="text-sm text-slate-600">{review.comment}</p>
                        <div className="mt-2 text-xs text-slate-400">
                          — {review.user?.full_name || "Anonymous"}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
