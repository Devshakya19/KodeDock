"use client";
import { GithubIcon } from "@/shared/components/github-icon";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Star, ShoppingCart, ExternalLink, Clock, Eye,
  Loader2, Shield, Package, Users, Plus, Minus, X, MessageSquare,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { auth } from "@/shared/lib/auth";
import { apiGet, apiPost } from "@/shared/lib/api";

interface Product {
  id: string; title: string; slug: string; description: string;
  long_description: string; price_paise: number;
  original_price_paise: number | null; category_name: string | null;
  seller_id: string; tags: string[]; tech_stack: string[];
  status: string; image_url: string | null; demo_url: string | null;
  sales_count: number; view_count: number; rating: string | number;
  review_count: number; created_at: string;
}
interface Review {
  id: string; rating: number; title: string; comment: string;
  user_name: string | null; user_avatar: string | null;
  created_at: string;
}

function Stars({ rating, size = "w-4 h-4", interactive = false, onRate }: { rating: number; size?: string; interactive?: boolean; onRate?: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate && onRate(i + 1)}
          onMouseEnter={() => interactive && setHover(i + 1)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? "cursor-pointer" : "cursor-default"}`}
        >
          <Star className={`${size} ${
            i < (hover || Math.round(rating))
              ? "fill-amber-400 text-amber-400"
              : "text-slate-200"
          } transition-colors`} />
        </button>
      ))}
    </div>
  );
}

function getCart(): { id: string; title: string; price_paise: number; image_url: string | null }[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("codehaat_cart") || "[]"); } catch { return []; }
}

function saveCart(cart: { id: string; title: string; price_paise: number; image_url: string | null }[]) {
  localStorage.setItem("codehaat_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");
  const [inCart, setInCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [eligibleOrderId, setEligibleOrderId] = useState<string | null>(null);
  const productId = params.id as string;

  const checkCart = useCallback(() => {
    setInCart(getCart().some((item) => item.id === productId));
  }, [productId]);

  useEffect(() => { checkCart(); }, [checkCart]);

  useEffect(() => {
    const handler = () => checkCart();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [checkCart]);

  useEffect(() => {
    async function load() {
      try {
        const pr = await apiGet<Product>(`/products/${productId}`);
        if (pr.success && pr.data) {
          setProduct(pr.data);
        } else { setError("Product not found"); setLoading(false); return; }
        const rr = await apiGet<Review[]>(`/reviews/${productId}`);
        setReviews(rr.data ?? []);

        try {
          const ordersRes = await apiGet<any[]>(`/orders`);
          if (ordersRes.success && ordersRes.data) {
            const eligible = ordersRes.data.find((o: any) => o.product_id === productId && o.status === "completed");
            if (eligible) setEligibleOrderId(eligible.id);
          }
        } catch {}
      } catch { setError("Failed to load product"); }
      finally { setLoading(false); }
    }
    if (productId) load();
  }, [productId]);

  function handleAddToCart() {
    if (!product) return;
    const cart = getCart();
    if (cart.some((item) => item.id === productId)) return;
    cart.push({ id: product.id, title: product.title, price_paise: product.price_paise, image_url: product.image_url });
    saveCart(cart);
    setInCart(true);
  }

  function handleRemoveFromCart() {
    const cart = getCart().filter((item) => item.id !== productId);
    saveCart(cart);
    setInCart(false);
  }

  async function handleBuy() {
    setBuying(true);
    try {
      const user = await auth.getUser();
      if (!user) { router.push("/login"); return; }
      // Remove from cart if in cart
      handleRemoveFromCart();
      router.push(`/checkout?product_id=${productId}`);
    } catch { setError("Failed to process purchase"); }
    finally { setBuying(false); }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!eligibleOrderId) return;
    setReviewSubmitting(true);
    setReviewError("");
    setReviewSuccess("");
    try {
      const result = await apiPost("/reviews", {
        product_id: productId,
        order_id: eligibleOrderId,
        rating: reviewRating,
        title: reviewTitle || undefined,
        comment: reviewComment || undefined,
      });
      if (result.success) {
        setShowReviewForm(false);
        setReviewRating(5);
        setReviewTitle("");
        setReviewComment("");
        setReviewSuccess("Review submitted!");
        const rr = await apiGet<Review[]>(`/reviews/${productId}`);
        setReviews(rr.data ?? []);
        const pr = await apiGet<Product>(`/products/${productId}`);
        if (pr.success && pr.data) setProduct(pr.data);
        setTimeout(() => setReviewSuccess(""), 3000);
      } else {
        setReviewError(result.error || "Failed to submit review");
      }
    } catch {
      setReviewError("Network error");
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
    </div>
  );
  if (error || !product) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-950 mb-2">Product not found</h1>
        <p className="text-slate-500 mb-6">{error || "The product you're looking for doesn't exist."}</p>
        <Link href="/browse"><Button className="bg-slate-950 text-white hover:bg-slate-800 rounded-xl px-8">Browse Products</Button></Link>
      </div>
    </div>
  );

  const price = product.price_paise / 100;
  const origPrice = product.original_price_paise ? product.original_price_paise / 100 : null;
  const discount = origPrice ? Math.round(((origPrice - price) / origPrice) * 100) : 0;
  const ratingNum = typeof product.rating === "string" ? parseFloat(product.rating) : product.rating;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/browse" className="flex items-center gap-2 text-slate-500 hover:text-slate-950 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{product.view_count}</span>
            <span className="flex items-center gap-1.5"><ShoppingCart className="w-3.5 h-3.5" />{product.sales_count}</span>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 mb-14">
          <div className="lg:col-span-3">
            <div className="relative rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10 pointer-events-none" />
              <div className="transition-transform duration-500 group-hover:scale-[1.015]">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} className="w-full aspect-[16/10] object-contain bg-slate-50 rounded-xl border border-slate-100" />
                ) : (
                  <div className="aspect-[16/10] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
                    <GithubIcon className="w-24 h-24 text-slate-200" />
                  </div>
                )}
              </div>
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-white/50">
                  {product.category_name || "Uncategorized"}
                </span>
              </div>
              {discount > 0 && (
                <div className="absolute top-4 right-4 z-20 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/25">
                  {discount}% OFF
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Stars rating={ratingNum} size="w-4 h-4" />
                  <span className="text-white/90 text-sm font-semibold">{ratingNum.toFixed(1)}</span>
                  <span className="text-white/50 text-sm">({product.review_count} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20 space-y-5">
              <div>
                <Badge variant="outline" className="mb-3 border-slate-200 text-slate-500 text-[11px] font-medium tracking-wide uppercase">
                  {product.category_name || "Uncategorized"}
                </Badge>
                <h1 className="text-[28px] sm:text-3xl font-extrabold text-slate-950 leading-tight tracking-tight">
                  {product.title}
                </h1>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className={`text-[36px] font-extrabold tracking-tight leading-none ${price === 0 ? "text-emerald-600" : "text-slate-950"}`}>
                    {price === 0 ? "Free" : `₹${price.toLocaleString()}`}
                  </span>
                  {origPrice && price > 0 && <span className="text-base text-slate-400 line-through">₹{origPrice.toLocaleString()}</span>}
                </div>
                {discount > 0 && (
                  <p className="text-sm font-medium text-emerald-600">You save ₹{(origPrice! - price).toLocaleString()}</p>
                )}

                {/* Buy Now / Get Free Code */}
                <Button onClick={handleBuy} disabled={buying}
                  className="w-full h-12 bg-slate-950 text-white hover:bg-slate-800 text-[15px] font-semibold rounded-xl shadow-lg shadow-slate-950/20 transition-all hover:shadow-xl active:scale-[0.98]">
                  {buying ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{price === 0 ? "Get Free Code" : "Buy Now"}</>}
                </Button>

                {/* Add to Cart */}
                {inCart ? (
                  <Button onClick={handleRemoveFromCart} variant="outline"
                    className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium">
                    <X className="w-4 h-4 mr-2" /> Remove from Cart
                  </Button>
                ) : (
                  <Button onClick={handleAddToCart} variant="outline"
                    className="w-full h-11 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium">
                    <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                  </Button>
                )}

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="flex flex-col items-center gap-1 text-center py-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] text-slate-500 font-medium">Secure</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center py-2 border-x border-slate-100">
                    <Package className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] text-slate-500 font-medium">Source Code</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center py-2">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] text-slate-500 font-medium">{product.sales_count} bought</span>
                  </div>
                </div>
              </div>

              {product.demo_url && (
                <a href={product.demo_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all w-full">
                  <ExternalLink className="w-4 h-4" /> Live Demo
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-0">
            <section className="py-8 border-t border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-950 mb-3 tracking-tight">About this product</h2>
              <p className="text-slate-600 leading-relaxed text-[15px]">{product.description || "No description available."}</p>
            </section>

            {product.long_description && (
              <section className="py-8 border-t border-slate-100">
                <h2 className="text-lg font-extrabold text-slate-950 mb-3 tracking-tight">What&apos;s included</h2>
                <div className="text-slate-600 leading-relaxed text-[15px] whitespace-pre-wrap bg-slate-50 rounded-xl p-5 border border-slate-100">
                  {product.long_description}
                </div>
              </section>
            )}

            {product.tech_stack && product.tech_stack.length > 0 && (
              <section className="py-8 border-t border-slate-100">
                <h2 className="text-lg font-extrabold text-slate-950 mb-3 tracking-tight">Tech Stack</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tech_stack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="bg-blue-50 border-blue-100 text-blue-700 px-3 py-1 text-xs font-medium">{tech}</Badge>
                  ))}
                </div>
              </section>
            )}

            {product.tags && product.tags.length > 0 && (
              <section className="py-8 border-t border-slate-100">
                <h2 className="text-lg font-extrabold text-slate-950 mb-3 tracking-tight">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-slate-100 border-slate-200 text-slate-600 px-3 py-1 text-xs">{tag}</Badge>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">Reviews</h2>
                <span className="text-sm text-slate-400">{product.review_count}</span>
              </div>

              <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-3xl font-extrabold text-slate-950 leading-none">{ratingNum.toFixed(1)}</span>
                <div>
                  <Stars rating={ratingNum} size="w-4 h-4" />
                  <p className="text-xs text-slate-400 mt-0.5">{product.review_count} reviews</p>
                </div>
              </div>

              {/* Write Review Button */}
              {eligibleOrderId && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <MessageSquare className="w-4 h-4" /> Write a Review
                </button>
              )}

              {/* Review Form */}
              {showReviewForm && (
                <div className="mb-5 p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-950">Your Review</h3>
                    <button onClick={() => setShowReviewForm(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {reviewError && <div className="mb-3 p-2 rounded-lg bg-red-50 text-xs text-red-700">{reviewError}</div>}
                  {reviewSuccess && <div className="mb-3 p-2 rounded-lg bg-emerald-50 text-xs text-emerald-700">{reviewSuccess}</div>}

                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Rating</label>
                      <Stars rating={reviewRating} size="w-5 h-5" interactive onRate={setReviewRating} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Title (optional)</label>
                      <input
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Summarize your experience"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Comment</label>
                      <textarea
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Tell others about your experience..."
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none"
                      />
                    </div>
                    <Button type="submit" disabled={reviewSubmitting}
                      className="w-full bg-slate-950 text-white hover:bg-slate-800 rounded-lg text-sm h-9">
                      {reviewSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                      Submit Review
                    </Button>
                  </form>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="text-center py-10 text-sm text-slate-400">
                  <Star className="w-7 h-7 mx-auto mb-2 text-slate-200" />
                  No reviews yet
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <Stars rating={r.rating} size="w-3.5 h-3.5" />
                        <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                      </div>
                      {r.title && <h4 className="text-sm font-semibold text-slate-900 mb-1">{r.title}</h4>}
                      <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                      <p className="text-xs text-slate-400 mt-2">— {r.user_name || "Anonymous"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
