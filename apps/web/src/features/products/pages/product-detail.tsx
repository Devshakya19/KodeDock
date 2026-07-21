"use client";
import { GithubIcon } from "@/shared/components/github-icon";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Star, ShoppingCart, ExternalLink, Clock, Eye,
  Loader2, Shield, Package, Users,
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
  user: { full_name: string; avatar_url: string | null } | null;
  created_at: string;
}
interface SellerProfile {
  id: string; full_name: string | null; avatar_url: string | null;
  github_username: string | null; bio: string | null;
}

function Stars({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${size} ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
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
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [eligibleOrderId, setEligibleOrderId] = useState<string | null>(null);
  const productId = params.id as string;

  useEffect(() => {
    async function load() {
      try {
        const pr = await apiGet<Product>(`/products/${productId}`);
        if (pr.success && pr.data) {
          setProduct(pr.data);
          if (pr.data.seller_id) {
            const sr = await apiGet<SellerProfile>(`/profile/${pr.data.seller_id}`);
            if (sr.success && sr.data) setSeller(sr.data);
          }
        } else { setError("Product not found"); setLoading(false); return; }
        const rr = await apiGet<Review[]>(`/reviews/${productId}`);
        setReviews(rr.data ?? []);
        
        // Check if current user has a completed order for this product (eligible to review)
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

  async function handleBuy() {
    setBuying(true);
    try {
      const user = await auth.getUser();
      if (!user) { router.push("/login"); return; }
      router.push(`/checkout?product_id=${productId}`);
    } catch { setError("Failed to process purchase"); }
    finally { setBuying(false); }
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

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!eligibleOrderId) return;
    setReviewSubmitting(true);
    setReviewError("");
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
        // Refresh reviews
        const rr = await apiGet<Review[]>(`/reviews/${productId}`);
        setReviews(rr.data ?? []);
        // Refresh product stats
        const pr = await apiGet<Product>(`/products/${productId}`);
        if (pr.success && pr.data) setProduct(pr.data);
      } else {
        setReviewError(result.error || "Failed to submit review");
      }
    } catch {
      setReviewError("Network error");
    } finally {
      setReviewSubmitting(false);
    }
  }

  const price = product.price_paise / 100;
  const origPrice = product.original_price_paise ? product.original_price_paise / 100 : null;
  const discount = origPrice ? Math.round(((origPrice - price) / origPrice) * 100) : 0;
  const ratingNum = typeof product.rating === "string" ? parseFloat(product.rating) : product.rating;

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Header ─── */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/browse" className="flex items-center gap-2 text-slate-500 hover:text-slate-950 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Browse
          </Link>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{product.view_count}</span>
            <span className="flex items-center gap-1.5"><ShoppingCart className="w-3.5 h-3.5" />{product.sales_count}</span>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* ═══ HERO: Image + Purchase ═══ */}
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 mb-14">
          {/* ── Image (3 cols) ── */}
          <div className="lg:col-span-3">
            <div className="relative rounded-2xl overflow-hidden group">
              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10 pointer-events-none" />

              <div className="transition-transform duration-500 group-hover:scale-[1.015]">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} className="w-full aspect-[16/10] object-cover" />
                ) : (
                  <div className="aspect-[16/10] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
                    <GithubIcon className="w-24 h-24 text-slate-200" />
                  </div>
                )}
              </div>

              {/* Floating badges ON the image */}
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

              {/* Bottom overlay info */}
              <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Stars rating={ratingNum} size="w-4 h-4" />
                  <span className="text-white/90 text-sm font-semibold">{ratingNum.toFixed(1)}</span>
                  <span className="text-white/50 text-sm">({product.review_count} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Purchase Panel (2 cols, sticky) ── */}
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

              {/* Price Block */}
              <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-[36px] font-extrabold text-slate-950 tracking-tight leading-none">₹{price.toLocaleString()}</span>
                  {origPrice && <span className="text-base text-slate-400 line-through">₹{origPrice.toLocaleString()}</span>}
                </div>
                {discount > 0 && (
                  <p className="text-sm font-medium text-emerald-600">
                    You save ₹{(origPrice! - price).toLocaleString()}
                  </p>
                )}

                <Button onClick={handleBuy} disabled={buying}
                  className="w-full h-12 bg-slate-950 text-white hover:bg-slate-800 text-[15px] font-semibold rounded-xl shadow-lg shadow-slate-950/20 transition-all hover:shadow-xl hover:shadow-slate-950/30 active:scale-[0.98]">
                  {buying ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShoppingCart className="w-5 h-5 mr-2" />Buy Now</>}
                </Button>

                {/* Trust Strip */}
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

              {/* Seller Card */}
              <div className="rounded-2xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                <Link href={`/sellers/${product.seller_id}`} className="flex items-center gap-3 group/s">
                  <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0 group-hover/s:ring-2 ring-slate-300 transition-all">
                    {seller?.avatar_url ? <img src={seller.avatar_url} alt="" className="w-full h-full object-cover" /> : seller?.full_name?.[0]?.toUpperCase() || "S"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-950 group-hover/s:text-blue-600 transition-colors truncate">{seller?.full_name || "Seller"}</div>
                    {seller?.github_username && <div className="text-xs text-slate-400 flex items-center gap-1"><GithubIcon className="w-3 h-3" />@{seller.github_username}</div>}
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover/s:text-slate-500 transition-colors" />
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { n: product.sales_count, l: "Sales" },
                  { n: product.view_count, l: "Views" },
                  { n: product.review_count, l: "Reviews" },
                ].map((s) => (
                  <div key={s.l} className="text-center py-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-lg font-extrabold text-slate-950">{s.n}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{s.l}</div>
                  </div>
                ))}
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

        {/* ═══ DETAILS + REVIEWS ═══ */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-0">
            {/* Description */}
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

          {/* Reviews */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">Reviews</h2>
                <span className="text-sm text-slate-400">{product.review_count}</span>
              </div>

              {/* Rating Summary */}
              <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-3xl font-extrabold text-slate-950 leading-none">{ratingNum.toFixed(1)}</span>
                <div>
                  <Stars rating={ratingNum} size="w-4 h-4" />
                  <p className="text-xs text-slate-400 mt-0.5">{product.review_count} reviews</p>
                </div>
              </div>

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
                      <p className="text-xs text-slate-400 mt-2">— {r.user?.full_name || "Anonymous"}</p>
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
