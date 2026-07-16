"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { auth } from "@/shared/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export default function EarningsDetailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  // Auth handled by custom auth client

  useEffect(() => {
    async function loadStats() {
      const user = await auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const session = await auth.getSession();
        const res = await fetch(`${API_URL}/api/seller/stats`, {
          headers: { Authorization: `Bearer ${session?.token}` },
        });
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch {}
      setLoading(false);
    }
    loadStats();
  }, [router, auth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-950">Earnings</h1>
        <p className="text-slate-600 mt-1">Detailed breakdown of your earnings</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="text-sm text-slate-500">Total Revenue</div>
            <div className="text-2xl font-bold text-slate-950 mt-1">
              ₹{((stats?.total_revenue_paise || 0) / 100).toLocaleString()}
            </div>
            <div className="text-xs text-emerald-600 mt-1">100% of sales</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="text-sm text-slate-500">Platform Fee (2.5%)</div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              -₹{((stats?.total_revenue_paise || 0) * 0.025 / 100).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">Deducted per sale</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="text-sm text-slate-500">You Keep (97.5%)</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              ₹{((stats?.total_earned_paise || 0) / 100).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">Available for withdrawal</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="text-sm text-slate-500">Total Sales</div>
            <div className="text-2xl font-bold text-slate-950 mt-1">
              {stats?.total_sales || 0}
            </div>
            <div className="text-xs text-slate-500 mt-1">Completed orders</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-slate-950 mb-4">Payout Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Payout Cycle</span>
              <span className="text-slate-950 font-medium">Every 7 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Minimum Payout</span>
              <span className="text-slate-950 font-medium">₹500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Payment Method</span>
              <span className="text-slate-950 font-medium">Bank Transfer (via Razorpay)</span>
            </div>
          </div>
          <Button className="mt-6 bg-slate-950 text-white hover:bg-slate-800" disabled>
            Request Withdrawal (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
