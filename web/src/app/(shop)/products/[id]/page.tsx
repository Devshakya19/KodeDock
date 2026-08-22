"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Star, ShoppingCart, ExternalLink, Eye,
  Loader2, Shield, Package, Users, X, MessageSquare, CheckCircle2, ChevronRight, Code2, Zap
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { auth } from "@/shared/lib/auth/client";
import { apiGet, apiPost } from "@/shared/lib/api/client";
import { GithubIcon } from "@/shared/components/icons/github";

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
          <Star className={`${size} ${
            i < (hover || Math.round(rating))
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-100 text-muted-foreground/60"
          } transition-colors`} />
        </button>
      ))}
    </div>
  );
}

function getCart(): { id: string; title: string; price_paise: number; image_url: string | null }[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("kodedock_cart") || "[]"); } catch { return []; }
}

function saveCart(cart: { id: string; title: string; price_paise: number; image_url: string | null }[]) {
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
    <div className="min-h-screen bg-secondary/50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-border border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-secondary/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-[32px] p-10 max-w-md w-full text-center shadow-xl shadow-slate-200/50 border border-border">
        <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-muted-foreground/80" />
        </div>
        <h1 className="text-2xl font-black text-foreground mb-2">Product not found</h1>
        <p className="text-muted-foreground mb-8 font-medium">{error || "The product you're looking for doesn't exist or was removed."}</p>
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
  const ratingNum = typeof product.rating === "string" ? parseFloat(product.rating) : product.rating;

  return (
    <div className="min-h-screen bg-secondary/50 pb-20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/browse" className="flex items-center gap-2 text-[13px] font-bold text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Browse
          </Link>
          <div className="flex items-center gap-4 text-[13px] font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {product.view_count} views</span>
            <span className="w-1 h-1 rounded-full bg-border/80" />
            <span className="flex items-center gap-1.5"><ShoppingCart className="w-4 h-4" /> {product.sales_count} sales</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Image & Details */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Product Showcase Image */}
            <div className="relative rounded-[32px] overflow-hidden bg-background border border-border/60 shadow-sm group">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none z-10" />
              <div className="aspect-[16/10] sm:aspect-[21/9] lg:aspect-[16/10] relative flex items-center justify-center bg-secondary/30 p-4 sm:p-8">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.title} 
                    className="w-full h-full object-contain rounded-2xl transition-transform duration-700 group-hover:scale-[1.02]" 
                  />
                ) : (
                  <GithubIcon className="w-32 h-32 text-muted-foreground/60" />
                )}
              </div>
            </div>

            {/* Header Info (Mobile & Desktop) */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <Badge variant="outline" className="border-border bg-background text-muted-foreground text-[11px] font-bold tracking-wider uppercase px-2.5 py-1">
                  {product.category_name || "Uncategorized"}
                </Badge>
                {discount > 0 && (
                  <Badge className="bg-success/20 text-success border-success/30 text-[11px] font-bold tracking-wider uppercase px-2.5 py-1">
                    Save {discount}%
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-foreground leading-[1.15] tracking-tight mb-5">
                {product.title}
              </h1>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-4xl">
                {product.description}
              </p>
            </div>

            {/* Content Sections */}
            <div className="space-y-10">
              {/* Features / Included */}
              {product.long_description && (
                <section>
                  <h2 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-2">
                    <Code2 className="w-6 h-6 text-accent" /> What&apos;s Included
                  </h2>
                  <div className="prose prose-slate max-w-none text-muted-foreground font-medium leading-relaxed bg-background p-8 rounded-[24px] border border-border/60 shadow-sm whitespace-pre-wrap">
                    {product.long_description}
                  </div>
                </section>
              )}

              {/* Tech Stack & Tags */}
              <div className="grid sm:grid-cols-2 gap-8">
                {product.tech_stack && product.tech_stack.length > 0 && (
                  <section>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tech_stack.map((tech) => (
                        <div key={tech} className="bg-accent/10 border border-accent/20 text-accent px-3 py-1.5 rounded-lg text-[13px] font-bold">
                          {tech}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {product.tags && product.tags.length > 0 && (
                  <section>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <div key={tag} className="bg-background border border-border text-muted-foreground px-3 py-1.5 rounded-lg text-[13px] font-bold shadow-sm">
                          {tag}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Reviews Section */}
              <section className="pt-6 border-t border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                  <div>
                    <h2 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">Customer Reviews</h2>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-warning/10 px-3 py-1 rounded-full border border-amber-100">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-warning">{ratingNum.toFixed(1)}</span>
                      </div>
                      <span className="text-sm font-bold text-muted-foreground">Based on {product.review_count} reviews</span>
                    </div>
                  </div>
                  
                  {eligibleOrderId && !showReviewForm && (
                    <Button
                      onClick={() => setShowReviewForm(true)}
                      className="bg-background text-foreground border border-border hover:bg-secondary/50 font-bold rounded-xl h-11 px-6 shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" /> Write a Review
                    </Button>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="mb-8 p-6 rounded-[24px] border border-border bg-background shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-foreground">Share your experience</h3>
                      <button onClick={() => setShowReviewForm(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {reviewError && <div className="mb-4 p-3 rounded-xl bg-rose-50 text-sm font-bold text-rose-700 border border-rose-100">{reviewError}</div>}
                    {reviewSuccess && <div className="mb-4 p-3 rounded-xl bg-success/10 text-sm font-bold text-success border border-success/20">{reviewSuccess}</div>}

                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[13px] font-bold text-foreground mb-2">Overall Rating</label>
                        <Stars rating={reviewRating} size="w-6 h-6" interactive onRate={setReviewRating} />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-foreground mb-2">Title (Optional)</label>
                        <input
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="Summarize your review"
                          className="w-full rounded-xl border border-border px-4 py-3 text-sm font-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-shadow bg-secondary/50 focus:bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-foreground mb-2">Your Review</label>
                        <textarea
                          rows={4}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="What did you like or dislike? What is this product best used for?"
                          className="w-full rounded-xl border border-border px-4 py-3 text-sm font-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-shadow bg-secondary/50 focus:bg-background resize-none"
                        />
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={reviewSubmitting}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl h-11 px-8 shadow-lg shadow-foreground/5">
                          {reviewSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                          Submit Review
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <div className="text-center py-16 bg-background rounded-[24px] border border-border/60 border-dashed">
                    <Star className="w-10 h-10 mx-auto mb-3 text-muted-foreground/80" />
                    <h3 className="text-lg font-bold text-foreground mb-1">No reviews yet</h3>
                    <p className="text-sm text-muted-foreground font-medium">Be the first to review this product!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-6 rounded-[24px] bg-background border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                              {(r.user_name || "A")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{r.user_name || "Anonymous User"}</p>
                              <p className="text-xs font-medium text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</p>
                            </div>
                          </div>
                          <Stars rating={r.rating} size="w-4 h-4" />
                        </div>
                        {r.title && <h4 className="text-base font-bold text-foreground mb-2">{r.title}</h4>}
                        <p className="text-[15px] text-muted-foreground font-medium leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Right Column: Pricing & Action Card */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <div className="bg-background rounded-[32px] p-6 sm:p-8 border border-border/80 shadow-lg">
                
                <div className="mb-8">
                  <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest mb-3">License & Access</p>
                  <div className="flex items-end gap-3 flex-wrap">
                    <span className={`text-[40px] font-black tracking-tight leading-none ${price === 0 ? "text-success" : "text-foreground"}`}>
                      {price === 0 ? "Free" : `₹${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    </span>
                    {origPrice && price > 0 && (
                      <span className="text-lg text-muted-foreground font-bold line-through mb-1">₹{origPrice.toLocaleString()}</span>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-success/10 text-success rounded-lg text-[13px] font-bold">
                      <Zap className="w-4 h-4 fill-emerald-500 text-success" /> 
                      You save ₹{(origPrice! - price).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-8">
                  <Button onClick={handleBuy} disabled={buying}
                    className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-bold rounded-2xl shadow-lg shadow-foreground/10 transition-all hover:-translate-y-0.5">
                    {buying ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{price === 0 ? "Download Free Code" : "Buy Now"}</>}
                  </Button>

                  {inCart ? (
                    <Button onClick={handleRemoveFromCart} variant="outline"
                      className="w-full h-12 border-destructive/30 text-destructive hover:bg-red-50 hover:text-red-700 rounded-2xl text-[15px] font-bold transition-colors">
                      <X className="w-4 h-4 mr-2" /> Remove from Cart
                    </Button>
                  ) : (
                    <Button onClick={handleAddToCart} variant="outline"
                      className="w-full h-12 border-border text-foreground hover:bg-secondary/50 hover:text-foreground rounded-2xl text-[15px] font-bold transition-colors">
                      <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                    </Button>
                  )}
                </div>

                <div className="space-y-4 pt-6 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-foreground">Secure Payment</p>
                      <p className="text-[11px] font-medium text-muted-foreground">256-bit encryption</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-foreground">Full Source Code</p>
                      <p className="text-[11px] font-medium text-muted-foreground">Instant repository access</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-foreground">Trusted by Developers</p>
                      <p className="text-[11px] font-medium text-muted-foreground">{product.sales_count} successful purchases</p>
                    </div>
                  </div>
                </div>

                {product.demo_url && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <a href={product.demo_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between px-5 py-4 bg-secondary/50 hover:bg-secondary rounded-2xl transition-colors group">
                      <div className="flex items-center gap-3">
                        <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                        <span className="text-[15px] font-bold text-foreground group-hover:text-foreground">View Live Demo</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/80 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </a>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
