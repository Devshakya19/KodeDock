"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  ExternalLink,
  Eye,
  Loader2,
  Shield,
  Package,
  Users,
  X,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  Code2,
  Zap,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { auth } from "@/shared/lib/auth/client";
import { apiGet, apiPost } from "@/shared/lib/api/client";
import { GithubIcon } from "@/shared/components/icons/github";

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
  user_name: string | null;
  user_avatar: string | null;
  created_at: string;
}

function Stars({
  rating,
  size = "w-4 h-4",
  interactive = false,
  onRate,
}: {
  rating: number;
  size?: string;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate && onRate(i + 1)}
          onMouseEnter={() => interactive && setHover(i + 1)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
        >
          <Star
            className={`${size} ${
              i < (hover || Math.round(rating))
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-100 text-muted-foreground/60"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

function getCart(): { id: string; title: string; price_paise: number; image_url: string | null }[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("kodedock_cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(
  cart: { id: string; title: string; price_paise: number; image_url: string | null }[]
) {
  localStorage.setItem("kodedock_cart", JSON.stringify(cart));
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

  useEffect(() => {
    checkCart();
  }, [checkCart]);

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
        } else {
          setError("Product not found");
          setLoading(false);
          return;
        }
        const rr = await apiGet<Review[]>(`/reviews/${productId}`);
        setReviews(rr.data ?? []);

        try {
          const ordersRes = await apiGet<any[]>(`/orders`);
          if (ordersRes.success && ordersRes.data) {
            const eligible = ordersRes.data.find(
              (o: any) => o.product_id === productId && o.status === "completed"
            );
            if (eligible) setEligibleOrderId(eligible.id);
          }
        } catch {}
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    if (productId) load();
  }, [productId]);

  function handleAddToCart() {
    if (!product) return;
    const cart = getCart();
    if (cart.some((item) => item.id === productId)) return;
    cart.push({
      id: product.id,
      title: product.title,
      price_paise: product.price_paise,
      image_url: product.image_url,
    });
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
      if (!user) {
        router.push("/login");
        return;
      }
      handleRemoveFromCart();
      router.push(`/checkout?product_id=${productId}`);
    } catch {
      setError("Failed to process purchase");
    } finally {
      setBuying(false);
    }
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

  if (loading)
    return (
      <div className="min-h-screen bg-secondary/50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-border border-t-blue-600 rounded-full animate-spin" />
      </div>
    );

  if (error || !product)
    return (
      <div className="min-h-screen bg-secondary/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-[32px] p-10 max-w-md w-full text-center shadow-xl shadow-slate-200/50 border border-border">
          <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-muted-foreground/80" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">Product not found</h1>
          <p className="text-muted-foreground mb-8 font-medium">
            {error || "The product you're looking for doesn't exist or was removed."}
          </p>
          <Link href="/browse">
            <Button className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-bold">
              Browse Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );

  const price = product.price_paise / 100;
  const origPrice = product.original_price_paise ? product.original_price_paise / 100 : null;
  const discount = origPrice ? Math.round(((origPrice - price) / origPrice) * 100) : 0;
  const ratingNum =
    typeof product.rating === "string" ? parseFloat(product.rating) : product.rating;

  return (
    <div className="min-h-screen bg-background pb-32 font-sans selection:bg-primary/20 selection:text-primary">
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          <span>/</span>
          <Link href="/browse" className="hover:text-foreground transition-colors">Web Templates</Link>
          <span>/</span>
          <Link href={`/browse?category=${product.category_name}`} className="hover:text-foreground transition-colors">
            {product.category_name || "Admin & Dashboard"}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Product Information */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Info */}
            <div className="space-y-4">
              <div>
                <span className="inline-block bg-[#291752] text-[#B388FF] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {product.category_name || "WEB TEMPLATE"}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">
                  {product.title}
                </h1>
                <CheckCircle2 className="w-6 h-6 text-primary fill-primary/20" />
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer">
                  <Eye className="w-4 h-4 text-primary" /> {product.view_count.toLocaleString()} views
                </span>
                <span className="text-[10px]">◆</span>
                <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer">
                  <ShoppingCart className="w-4 h-4 text-primary" /> {product.sales_count.toLocaleString()} sales
                </span>
                <span className="text-[10px]">◆</span>
                <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer">
                  <Star className="w-4 h-4 text-primary" /> Add Review
                </span>
              </div>
              
              <p className="text-[15px] text-muted-foreground/90 leading-relaxed max-w-2xl pt-2">
                {product.description}
              </p>

              {/* Tags / Tech Stack */}
              <div className="flex flex-wrap gap-3 pt-2">
                {(product.tech_stack?.length ? product.tech_stack : product.tags || []).slice(0, 4).map((tech, i) => (
                  <div
                    key={tech}
                    className="bg-[#18181B] border border-[#27272A] text-foreground px-3.5 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:border-primary/50 transition-colors cursor-default"
                  >
                    {i === 0 && <span className="w-2 h-2 rounded-full bg-[#339933]" />}
                    {i === 2 && <span className="w-2 h-2 rounded-sm bg-[#F7DF1E]" />}
                    {tech}
                  </div>
                ))}
              </div>
            </div>

            {/* Product Image Gallery */}
            <div>
              <div className="w-full aspect-[16/9] bg-[#111113] border border-[#27272A] rounded-2xl overflow-hidden relative flex items-center justify-center p-8 group">
                <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all z-10 opacity-0 group-hover:opacity-100">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all z-10 opacity-0 group-hover:opacity-100">
                  <ChevronRight className="w-5 h-5" />
                </button>

                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(124,58,237,0.15)]"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <GithubIcon className="w-16 h-16 opacity-30" />
                    <span className="text-sm font-medium">No preview available</span>
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              <div className="flex items-center justify-center gap-3 mt-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className={`w-20 h-12 rounded-lg border overflow-hidden cursor-pointer transition-all ${
                      i === 1 ? 'border-primary ring-1 ring-primary' : 'border-[#27272A] opacity-60 hover:opacity-100'
                    }`}
                  >
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#18181B]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bottom Full-Width Benefits Bar (Desktop layout) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#111113] border border-[#27272A] rounded-2xl p-6 mt-8">
              <div className="flex items-start gap-4">
                <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5 fill-primary/20" />
                <div>
                  <h4 className="text-sm font-bold text-foreground">Instant Download</h4>
                  <p className="text-xs text-muted-foreground mt-1">Get your files instantly</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-primary shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21.193 15.53m-15.557 2.83a9 9 0 010-12.728m0 0l2.829 2.829M5.636 5.636L2.807 8.464" />
                </svg>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Lifetime Access</h4>
                  <p className="text-xs text-muted-foreground mt-1">Use forever, anywhere</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Code2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-foreground">Easy to Customize</h4>
                  <p className="text-xs text-muted-foreground mt-1">Clean & well structured</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-primary shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Regular Updates</h4>
                  <p className="text-xs text-muted-foreground mt-1">Bug fixes & improvements</p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <section className="pt-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                    <h2 className="text-xl font-bold text-foreground">Customer Reviews</h2>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#18181B] border border-[#27272A] px-3 py-1.5 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-foreground">{ratingNum.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Based on {product.review_count} reviews
                    </span>
                  </div>
                </div>
                
                {eligibleOrderId && !showReviewForm && (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    variant="outline"
                    className="bg-primary/5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/50 h-10 px-5 rounded-lg font-medium text-sm transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Write a Review
                  </Button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="mb-8 p-6 rounded-xl border border-[#27272A] bg-[#111113]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-foreground">Write a Review</h3>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {reviewError && (
                    <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-sm font-medium text-destructive border border-destructive/20">
                      {reviewError}
                    </div>
                  )}
                  {reviewSuccess && (
                    <div className="mb-6 p-4 rounded-lg bg-success/10 text-sm font-medium text-success border border-success/20">
                      {reviewSuccess}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
                      <Stars rating={reviewRating} size="w-5 h-5" interactive onRate={setReviewRating} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                      <input
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Summary of your experience"
                        className="w-full rounded-lg border border-[#27272A] px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Review</label>
                      <textarea
                        rows={4}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="What did you think of the code quality and documentation?"
                        className="w-full rounded-lg border border-[#27272A] px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow resize-none"
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-10 px-6 font-medium text-sm"
                      >
                        {reviewSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Submit
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-10 rounded-xl border border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">No reviews yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Be the first to review this product!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-6 rounded-xl bg-[#111113] border border-[#27272A]">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-medium text-sm text-foreground">
                            {(r.user_name || "A")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {r.user_name || "Anonymous User"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(r.created_at).toLocaleDateString("en-IN", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <Stars rating={r.rating} size="w-3.5 h-3.5" />
                      </div>
                      {r.title && (
                        <h4 className="text-sm font-medium text-foreground mb-2">{r.title}</h4>
                      )}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {r.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Checkout & Summary */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-8">
              <div className="bg-[#111113] rounded-[1.5rem] p-6 border border-[#27272A]">
                
                <div className="mb-6">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Shield className="w-3 h-3" /> LICENSE & ACCESS
                  </p>
                  <div className="flex flex-col gap-1.5 mb-2">
                    <span className={`text-4xl font-bold tracking-tight ${price === 0 ? "text-emerald-500" : "text-foreground"}`}>
                      {price === 0
                        ? "Free"
                        : `₹${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Forever
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <Button
                    onClick={handleBuy}
                    disabled={buying}
                    className="w-full h-12 bg-primary text-white hover:bg-primary/90 text-sm font-medium rounded-xl"
                  >
                    {buying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {price === 0 ? "Download Free Code" : "Buy Now"}
                      </>
                    )}
                  </Button>

                  {inCart ? (
                    <Button
                      onClick={handleRemoveFromCart}
                      variant="outline"
                      className="w-full h-12 border-[#27272A] bg-transparent text-muted-foreground hover:bg-[#18181B] hover:text-foreground text-sm font-medium rounded-xl"
                    >
                      <X className="w-4 h-4 mr-2" /> Remove from Cart
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAddToCart}
                      variant="outline"
                      className="w-full h-12 border-[#27272A] bg-transparent text-foreground hover:bg-[#18181B] text-sm font-medium rounded-xl transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                    </Button>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="space-y-6 pt-6 border-t border-[#27272A]">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <Shield className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Secure Payment</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        256-bit SSL encryption
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <Code2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Full Source Code</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Instant repository access
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Trusted by Developers</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {product.sales_count.toLocaleString()} successful purchases
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[#27272A] flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>License</span>
                  <span className="text-foreground">MIT License</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
