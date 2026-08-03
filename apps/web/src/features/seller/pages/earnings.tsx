"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  RefreshCw,
  Clock,
  Banknote,
  TrendingUp,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { apiGet } from "@/shared/lib/api";

interface WalletData {
  user_id: string;
  balance_paise: number;
  pending_paise: number;
  total_earned_paise: number;
  total_spent_paise: number;
}

interface Transaction {
  id: string;
  type: string;
  amount_paise: number;
  balance_after_paise: number;
  description: string | null;
  created_at: string;
}

export default function SellerEarningsPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, txRes] = await Promise.all([
        apiGet<WalletData>("/wallet"),
        apiGet<Transaction[]>("/wallet/transactions?limit=50"),
      ]);
      if (walletRes.data) setWallet(walletRes.data);
      if (txRes.data) setTransactions(txRes.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter only earning-related transactions (sales, withdrawals)
  const earningTxs = transactions.filter(
    (tx) => tx.type === "sale" || tx.type === "withdrawal" || tx.type === "commission"
  );

  // Compute total withdrawn
  const totalWithdrawn = transactions
    .filter((tx) => tx.type === "withdrawal")
    .reduce((sum, tx) => sum + Math.abs(tx.amount_paise), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Earnings</h1>
          <p className="text-slate-600 mt-1">
            Track your revenue, withdrawals, and payout history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchData} variant="outline" className="border-slate-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/seller/wallet">
            <Button className="bg-slate-950 text-white hover:bg-slate-800">
              <Banknote className="w-4 h-4 mr-2" />
              Withdraw Funds
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Earned</p>
                <p className="text-2xl font-bold text-slate-950">
                  ₹{((wallet?.total_earned_paise ?? 0) / 100).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Available Balance</p>
                <p className="text-2xl font-bold text-slate-950">
                  ₹{((wallet?.balance_paise ?? 0) / 100).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Pending (Escrow)</p>
                <p className="text-2xl font-bold text-slate-950">
                  ₹{((wallet?.pending_paise ?? 0) / 100).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400">Released after 7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Withdrawn</p>
                <p className="text-2xl font-bold text-slate-950">
                  ₹{(totalWithdrawn / 100).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-950 mb-4">
            Earnings History
          </h3>
          {earningTxs.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No earnings yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Your sales and withdrawal history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {earningTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === "sale"
                          ? "bg-emerald-100"
                          : tx.type === "withdrawal"
                            ? "bg-red-100"
                            : "bg-orange-100"
                      }`}
                    >
                      {tx.type === "sale" ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                      ) : tx.type === "withdrawal" ? (
                        <ArrowUpRight className="w-4 h-4 text-red-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-950">
                        {tx.description || tx.type}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(tx.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        tx.type === "sale"
                          ? "text-emerald-600"
                          : tx.type === "withdrawal"
                            ? "text-red-600"
                            : "text-orange-600"
                      }`}
                    >
                      {tx.amount_paise > 0 ? "+" : ""}
                      ₹{(Math.abs(tx.amount_paise) / 100).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      Balance: ₹{(tx.balance_after_paise / 100).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
