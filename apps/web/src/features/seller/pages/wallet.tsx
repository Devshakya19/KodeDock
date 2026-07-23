"use client";

import { useState, useEffect, useCallback } from "react";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw, Banknote } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent } from "@/shared/ui/card";
import { apiGet, apiPost } from "@/shared/lib/api";

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

export default function SellerWalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, txRes] = await Promise.all([
        apiGet<WalletData>("/wallet"),
        apiGet<Transaction[]>("/wallet/transactions"),
      ]);
      if (walletRes.data) setWallet(walletRes.data);
      if (txRes.data) setTransactions(txRes.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleWithdraw() {
    const amountPaise = Math.round(parseFloat(withdrawAmount) * 100);
    if (isNaN(amountPaise) || amountPaise < 50000) {
      setError("Minimum withdrawal is ₹500");
      return;
    }
    if (wallet && amountPaise > wallet.balance_paise) {
      setError("Insufficient balance");
      return;
    }

    setWithdrawing(true);
    setError("");
    setSuccess("");

    try {
      const result = await apiPost("/wallet/withdraw", { amount_paise: amountPaise });
      if (result.success) {
        setSuccess("Withdrawal successful! Funds will be transferred to your bank account.");
        setWithdrawAmount("");
        fetchData();
      } else {
        setError(result.error || "Withdrawal failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setWithdrawing(false);
    }
  }

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
          <h1 className="text-2xl font-bold text-slate-950">Wallet</h1>
          <p className="text-slate-600 mt-1">Your earnings and withdrawals</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="border-slate-300">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Available Balance</p>
                <p className="text-2xl font-bold text-slate-950">₹{((wallet?.balance_paise ?? 0) / 100).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Pending (in escrow)</p>
                <p className="text-2xl font-bold text-slate-950">₹{((wallet?.pending_paise ?? 0) / 100).toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">Released after 7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Earned</p>
                <p className="text-2xl font-bold text-slate-950">₹{((wallet?.total_earned_paise ?? 0) / 100).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Section */}
      <Card className="border-slate-200 mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-950 mb-4">Withdraw Funds</h3>
          <p className="text-sm text-slate-500 mb-4">Minimum withdrawal: ₹500. Funds will be transferred to your linked bank account.</p>

          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
          {success && <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">{success}</div>}

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (INR)</label>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Min ₹500"
                min="500"
                className="h-11"
              />
            </div>
            <Button
              onClick={handleWithdraw}
              disabled={withdrawing || !withdrawAmount}
              className="bg-slate-950 text-white hover:bg-slate-800 h-11"
            >
              {withdrawing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Banknote className="w-4 h-4 mr-2" />}
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-950 mb-4">Transaction History</h3>
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.amount_paise > 0 ? "bg-emerald-100" : "bg-red-100"
                    }`}>
                      {tx.amount_paise > 0 ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-950">
                        {tx.description || tx.type}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(tx.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.amount_paise > 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {tx.amount_paise > 0 ? "+" : ""}₹{(Math.abs(tx.amount_paise) / 100).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">Balance: ₹{(tx.balance_after_paise / 100).toLocaleString()}</p>
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
