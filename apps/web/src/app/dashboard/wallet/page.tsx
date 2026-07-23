"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { apiGet } from "@/shared/lib/api";
import { AddMoneyModal } from "@/features/wallet/components/add-money-modal";

interface Wallet {
  balance_paise: number;
  pending_paise: number;
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

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [w, tx] = await Promise.all([
        apiGet<Wallet>("/wallet"),
        apiGet<Transaction[]>("/wallet/transactions"),
      ]);
      if (w.data) setWallet(w.data);
      if (tx.data) setTransactions(tx.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/browse" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Wallet</h1>
            <p className="text-slate-500 mt-1 text-sm">Your balance and transactions</p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" className="border-slate-300">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
        </div>

        {/* Balance */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                <WalletIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-500">Available</p>
              <p className="text-xl font-bold text-slate-950">₹{((wallet?.balance_paise ?? 0) / 100).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
                <ArrowUpRight className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xs text-slate-500">Pending</p>
              <p className="text-xl font-bold text-slate-950">₹{((wallet?.pending_paise ?? 0) / 100).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                <ArrowDownLeft className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs text-slate-500">Spent</p>
              <p className="text-xl font-bold text-slate-950">₹{((wallet?.total_spent_paise ?? 0) / 100).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Button onClick={() => setShowAddMoney(true)} className="bg-slate-950 text-white hover:bg-slate-800 mb-8">
          Add Money
        </Button>

        {/* Transactions */}
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-slate-950 mb-4">Transactions</h3>
            {transactions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        tx.amount_paise > 0 ? "bg-emerald-100" : "bg-red-100"
                      }`}>
                        {tx.amount_paise > 0 ? (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-950 truncate">{tx.description || tx.type}</p>
                        <p className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className={`text-sm font-semibold ${tx.amount_paise > 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {tx.amount_paise > 0 ? "+" : ""}₹{(Math.abs(tx.amount_paise) / 100).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">₹{(tx.balance_after_paise / 100).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {showAddMoney && <AddMoneyModal onClose={() => setShowAddMoney(false)} onSuccess={() => { setShowAddMoney(false); fetchData(); }} />}
    </div>
  );
}
