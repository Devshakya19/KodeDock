"use client";

import { useState, useEffect } from "react";
import { X, ArrowUpRight, ArrowDownLeft, Loader2, Wallet as WalletIcon, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { apiGet } from "@/shared/lib/api";
import { AddMoneyModal } from "./add-money-modal";

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

interface WalletPopupProps {
  onClose: () => void;
}

export function WalletPopup({ onClose }: WalletPopupProps) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);

  async function fetchData() {
    try {
      const [w, tx] = await Promise.all([
        apiGet<Wallet>("/wallet"),
        apiGet<Transaction[]>("/wallet/transactions?limit=10"),
      ]);
      if (w.data) setWallet(w.data);
      if (tx.data) setTransactions(tx.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
        <div
          className="mt-16 mr-4 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <WalletIcon className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-950">My Wallet</span>
            </div>
            <button onClick={onClose} className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center">
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Balance + Add Money */}
              <div className="px-4 py-4 bg-slate-50 border-b border-slate-100">
                <div className="text-xs text-slate-500 mb-1">Available Balance</div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-slate-950">
                    ₹{((wallet?.balance_paise ?? 0) / 100).toLocaleString()}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowAddMoney(true)}
                    className="bg-slate-950 text-white hover:bg-slate-800 h-8 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Money
                  </Button>
                </div>
                {(wallet?.pending_paise ?? 0) > 0 && (
                  <div className="text-xs text-amber-600 mt-1">
                    ₹{(wallet!.pending_paise / 100).toLocaleString()} pending in escrow
                  </div>
                )}
              </div>

              {/* Transactions */}
              <div className="px-4 py-3">
                <div className="text-xs font-medium text-slate-500 mb-2">Recent Activity</div>
                {transactions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No transactions yet</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            tx.amount_paise > 0 ? "bg-emerald-100" : "bg-red-100"
                          }`}>
                            {tx.amount_paise > 0 ? (
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3 text-red-600" />
                            )}
                          </div>
                          <span className="text-xs text-slate-700 truncate">{tx.description || tx.type}</span>
                        </div>
                        <span className={`text-xs font-semibold flex-shrink-0 ml-2 ${
                          tx.amount_paise > 0 ? "text-emerald-600" : "text-red-600"
                        }`}>
                          {tx.amount_paise > 0 ? "+" : ""}₹{(Math.abs(tx.amount_paise) / 100).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-slate-100">
                <a
                  href="/dashboard/wallet"
                  className="block w-full text-center text-xs font-medium text-slate-600 hover:text-slate-950"
                >
                  View Full Wallet →
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {showAddMoney && (
        <AddMoneyModal
          onClose={() => setShowAddMoney(false)}
          onSuccess={() => { setShowAddMoney(false); fetchData(); }}
        />
      )}
    </>
  );
}
