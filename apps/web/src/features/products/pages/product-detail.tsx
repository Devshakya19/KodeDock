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
  category: { name: string } | null;
  seller: { full_name: string; avatar_url: string | null; github_username: string | null } | null;
  tags: string[];
  tech_stack: string[];
  status: string;
  github_repo_url: string | null;
  image_url: string | null;
  demo_url: string | null;
  sales_count: number;
  view_count: number;
  rating: number;
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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");

  // Auth handled by custom auth client
  const productId = params.id as string;

  useEffect(() => {
    async function loadProduct() {
      try {
        // Fetch product from backend API
        const productResult = await apiGet<Product>(`/api/products/${productId}`);
        if (productResult.success && productResult.data) {
          setProduct(productResult.data);
        } else {
          setError("Product not found");
          setLoading(false);
          return;
        }

        // Fetch reviews from backend API
        const reviewsResult = await apiGet<Review[]>(`/api/reviews/${productId}`);
        setReviews(reviewsResult.data || []);
      } catch (err) {
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
      const session = await auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      router.push(`/checkout?product_id=${productId}`);
    } catch (err) {
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/browse" className="flex items-center gap-2 text-slate-600 hover:text-slate-950 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Browse</span>
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Product Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <GithubIcon className="w-16 h-16 text-slate-400" />
              {discount > 0 && (
                <Badge className="absolute top-4 right-4 bg-emerald-500 text-white border-0">
                  {discount}% OFF
                </Badge>
              )}
            </div>

            <div>
              <Badge variant="secondary" className="mb-2 bg-slate-100 border-slate-200 text-slate-700">
                {product.category?.name || "Uncategorized"}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-950">{product.title}</h1>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-950 mb-2">Description</h2>
              <p className="text-slate-600 leading-relaxed">
                {product.description || "No description available."}
              </p>
            </div>

            {product.long_description && (
              <div>
                <h2 className="text-lg font-semibold text-slate-950 mb-2">Details</h2>
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {product.long_description}
                </div>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-950 mb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-slate-100 border-slate-200 text-slate-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {product.tech_stack && product.tech_stack.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-950 mb-2">Tech Stack</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tech_stack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="bg-blue-50 border-blue-200 text-blue-700">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-slate-950 mb-4">
                Reviews ({product.review_count})
              </h2>
              {reviews.length === 0 ? (
                <p className="text-slate-500 text-sm">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(review.created_at).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                        {review.title && (
                          <h4 className="text-sm font-semibold text-slate-950 mb-1">{review.title}</h4>
                        )}
                        <p className="text-sm text-slate-600">{review.comment}</p>
                        <div className="mt-2 text-xs text-slate-500">
                          by {review.user?.full_name || "Anonymous"}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-slate-950">₹{price.toLocaleString()}</span>
                      {originalPrice && (
                        <span className="text-lg text-slate-400 line-through">₹{originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    {discount > 0 && (
                      <p className="text-sm text-emerald-600 font-medium mt-1">
                        {discount}% off — Save ₹{(originalPrice! - price).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700">
                      {product.seller?.avatar_url ? (
                        <img src={product.seller.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        product.seller?.full_name?.[0]?.toUpperCase() || "S"
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-950">{product.seller?.full_name || "Seller"}</div>
                      {product.seller?.github_username && (
                        <a
                          href={`https://github.com/${product.seller.github_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                        >
                          <GithubIcon className="w-3 h-3" />@{product.seller.github_username}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-200">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(product.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-950">{product.rating.toFixed(1)}</span>
                    <span className="text-sm text-slate-500">({product.review_count} reviews)</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <ShoppingCart className="w-4 h-4" />
                      <span>{product.sales_count} sales</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{product.view_count} views</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleBuy}
                    disabled={buying}
                    className="w-full h-12 bg-slate-950 text-white hover:bg-slate-800 text-base font-semibold"
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

                  {product.github_repo_url && (
                    <a
                      href={product.github_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <GithubIcon className="w-4 h-4" />
                      View on GitHub
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {product.demo_url && (
                    <a
                      href={product.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Listed {new Date(product.created_at).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
