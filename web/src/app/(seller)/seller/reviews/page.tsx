"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Star,
  MessageSquare,
  RefreshCw,
  Search,
  Package,
  Calendar,
  CheckCircle2,
  ThumbsUp,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { apiGet } from "@/lib/api/client";
import { SellerHeader } from "../components/seller-header";

interface SellerReviewItem {
  id: string;
  product_id: string;
  product_title: string;
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
}

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState<SellerReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState<number | "all">("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchReviews = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await apiGet<SellerReviewItem[]>("/seller/reviews");
      if (res.success && res.data) {
        setReviews(res.data);
        setLastUpdated(new Date());
      }
    } catch {
      // Ignore background errors
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesStar = starFilter === "all" || review.rating === starFilter;
      const pTitle = review.product_title.toLowerCase();
      const rTitle = (review.title || "").toLowerCase();
      const rComment = (review.comment || "").toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchesSearch = pTitle.includes(q) || rTitle.includes(q) || rComment.includes(q);

      return matchesStar && matchesSearch;
    });
  }, [reviews, starFilter, searchQuery]);

  // Calculate average rating
  const avgRating = useMemo(() => {
    if (reviews.length === 0) return "0.0";
    return (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  // Group by star rating
  const ratingDistribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((r) => r.rating === stars).length;
      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
      return { stars, count, percentage };
    });
  }, [reviews]);

  if (loading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Loading Customer Feedback...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      {/* 1. Header */}
      <SellerHeader
        badge="Reputation & Trust"
        title="Product Reviews"
        description="Monitor buyer feedback, rating distributions, and customer satisfaction across your catalog."
        lastUpdated={lastUpdated}
        onRefresh={() => fetchReviews(true)}
        refreshing={refreshing}
      />

      {/* 2. Rating Breakdown Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Star Distribution Card */}
        <div className="lg:col-span-5 rounded-[28px] bg-white p-2 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[22px] bg-gradient-to-b from-white to-slate-50/40 p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex flex-col items-center justify-center min-w-[110px] text-center border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0 sm:pr-6">
              <span className="text-5xl font-black text-slate-950 tracking-tight tabular-nums">
                {avgRating}
              </span>
              <div className="flex items-center gap-1 mt-2 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(Number(avgRating))
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-100 text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 mt-2 font-bold">
                {reviews.length} total reviews
              </span>
            </div>

            <div className="flex-1 w-full space-y-2">
              {ratingDistribution.map((dist) => (
                <button
                  key={dist.stars}
                  type="button"
                  onClick={() => setStarFilter(starFilter === dist.stars ? "all" : dist.stars)}
                  className={`flex items-center gap-3 text-xs font-semibold w-full p-1.5 rounded-xl transition-all cursor-pointer ${
                    starFilter === dist.stars
                      ? "bg-slate-900 text-white font-bold"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-1 w-7 shrink-0">
                    <span>{dist.stars}</span>
                    <Star
                      className={`w-3 h-3 ${
                        starFilter === dist.stars
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-300 text-slate-300"
                      }`}
                    />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                  <div
                    className={`w-6 text-right tabular-nums text-[11px] ${
                      starFilter === dist.stars ? "text-white font-black" : "text-slate-400 font-bold"
                    }`}
                  >
                    {dist.count}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Creator Trust Statement */}
        <div className="lg:col-span-7 rounded-[28px] bg-white p-2 ring-1 ring-slate-200/80 shadow-xs">
          <div className="rounded-[22px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-7 text-white h-full flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Star className="w-48 h-48 rotate-12 translate-x-8 -translate-y-8" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-wider mb-3 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Verified Purchases</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
                High ratings drive 3.2x higher conversion.
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl font-normal leading-relaxed">
                Every review on KodeDock is linked directly to a verified customer purchase. Maintaining detailed documentation and responsive updates helps keep your average above 4.8 stars.
              </p>
            </div>

            <div className="relative z-10 pt-4 flex items-center gap-4 text-xs font-semibold text-slate-400 border-t border-white/10 mt-4">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Authentic
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>Immutable blockchain-style order hash</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search */}
      <div className="rounded-[28px] bg-white p-2 ring-1 ring-slate-200/80 shadow-xs mb-8">
        <div className="rounded-[22px] bg-gradient-to-b from-white to-slate-50/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setStarFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                starFilter === "all"
                  ? "bg-slate-950 text-white shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              All Reviews ({reviews.length})
            </button>
            {[5, 4, 3, 2, 1].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStarFilter(s)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  starFilter === s
                    ? "bg-slate-950 text-white shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                <span>{s}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200/80 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* 4. Reviews List */}
      <div className="rounded-[28px] bg-white p-2 ring-1 ring-slate-200/80 shadow-xs">
        <div className="rounded-[22px] bg-gradient-to-b from-white to-slate-50/40 p-5 sm:p-6">
          {filteredReviews.length === 0 ? (
            <div className="py-20 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-black text-slate-900">No reviews found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {searchQuery || starFilter !== "all"
                  ? "No reviews match your selected filter criteria."
                  : "Buyers haven't left feedback on your products yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => {
                const formattedDate = new Date(review.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div
                    key={review.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/60 hover:border-slate-300 hover:shadow-2xs transition-all flex flex-col gap-3 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center font-black text-slate-600 text-sm shrink-0 overflow-hidden">
                          {review.user_avatar ? (
                            <img src={review.user_avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (review.user_name || "A")[0].toUpperCase()
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-950">
                              {review.user_name || "Verified Buyer"}
                            </h4>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified Purchase
                            </span>
                          </div>

                          <div className="flex items-center gap-1 mt-1 text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-slate-100 text-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-700">
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[180px]">{review.product_title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    {(review.title || review.comment) && (
                      <div className="pt-2 border-t border-slate-100 mt-1">
                        {review.title && (
                          <h5 className="text-sm font-bold text-slate-900 mb-1">
                            {review.title}
                          </h5>
                        )}
                        {review.comment && (
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
