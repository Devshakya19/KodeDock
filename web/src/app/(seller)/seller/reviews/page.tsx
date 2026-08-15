"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Star,
  MessageSquare,
  RefreshCw,
  Search,
  Package,
  Calendar,
} from "lucide-react";
import { apiGet } from "@/lib/api/client";

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
  const filteredReviews = reviews.filter((review) => {
    const pTitle = review.product_title.toLowerCase();
    const rTitle = (review.title || "").toLowerCase();
    const rComment = (review.comment || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    
    return pTitle.includes(q) || rTitle.includes(q) || rComment.includes(q);
  });

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  // Group by star rating
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100 : 0
  }));

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Customer Feedback
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Reviews
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            See what buyers are saying about your digital products
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-[11px] text-slate-400">
                Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={() => fetchReviews(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 rounded-xl px-3 py-2 shadow-sm transition-all hover:bg-slate-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Analytics Card */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-6">
          <div className="flex flex-col items-center justify-center w-24">
            <span className="text-4xl font-extrabold text-slate-900">{avgRating}</span>
            <div className="flex items-center gap-0.5 mt-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(Number(avgRating)) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 mt-1 font-medium">{reviews.length} reviews</span>
          </div>

          <div className="flex-1 space-y-2 border-l border-slate-100 pl-6">
            {ratingDistribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-3 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1 w-8">
                  {dist.stars} <Star className="w-3 h-3 fill-slate-300 text-slate-300" />
                </div>
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-amber-400" 
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
                <div className="w-8 text-right text-slate-400">{dist.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[24px] p-6 shadow-md border border-slate-800 text-white flex flex-col justify-center lg:col-span-2 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-1">Reviews build trust.</h3>
            <p className="text-sm text-slate-300 max-w-md">
              High-quality products attract better reviews, which directly influences future buyers and boosts your overall sales conversion rate.
            </p>
          </div>
          <Star className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 rotate-12" />
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Recent Feedback <span className="text-slate-400 font-normal">({filteredReviews.length})</span>
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products or reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No reviews found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Buyers haven't left any reviews on your products yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => {
              const formattedDate = new Date(review.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
              });

              return (
                <div
                  key={review.id}
                  className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/60 transition-all flex flex-col gap-4 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                        {review.user_avatar ? (
                          <img src={review.user_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-slate-500">
                            {(review.user_name || "A")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {review.user_name || "Anonymous Buyer"}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[120px] sm:max-w-[200px]">{review.product_title}</span>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <Calendar className="w-3 h-3" /> {formattedDate}
                      </span>
                    </div>
                  </div>

                  {(review.title || review.comment) && (
                    <div className="pl-13 pt-2 border-t border-slate-100/60 mt-1">
                      {review.title && (
                        <h5 className="text-sm font-bold text-slate-800 mb-1">{review.title}</h5>
                      )}
                      {review.comment && (
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
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
  );
}
