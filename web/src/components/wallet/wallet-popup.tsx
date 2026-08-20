"use client";

import { useState, useEffect } from "react";
import { X, ArrowUpRight, ArrowDownLeft, Loader2, Wallet as WalletIcon, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { apiGet } from "@/shared/lib/api/client";
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

import { PopupWrapper } from "@/shared/ui/popup-wrapper";

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

  return (
    <>
      <PopupWrapper 
        title="My Wallet" 
        icon={WalletIcon} 
        onClose={onClose}
      >

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <>
              {/* Balance + Add Money */}
              <div className="px-4 py-4 bg-secondary/50 border-b border-border">
                <div className="text-xs text-muted-foreground mb-1">Available Balance</div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-foreground">
                    ₹{((wallet?.balance_paise ?? 0) / 100).toLocaleString()}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowAddMoney(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Money
                  </Button>
                </div>
                {(wallet?.pending_paise ?? 0) > 0 && (
                  <div className="text-xs text-warning mt-1">
                    ₹{(wallet!.pending_paise / 100).toLocaleString()} pending in escrow
                  </div>
                )}
              </div>

              {/* Transactions */}
              <div className="px-4 py-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">Recent Activity</div>
                {transactions.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No transactions yet</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            tx.amount_paise > 0 ? "bg-success/20" : "bg-destructive/20"
                          }`}>
                            {tx.amount_paise > 0 ? (
                              <ArrowDownLeft className="w-3 h-3 text-success" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3 text-destructive" />
                            )}
                          </div>
                          <span className="text-xs text-foreground truncate">{tx.description || tx.type}</span>
                        </div>
                        <span className={`text-xs font-semibold flex-shrink-0 ml-2 ${
                          tx.amount_paise > 0 ? "text-success" : "text-destructive"
                        }`}>
                          {tx.amount_paise > 0 ? "+" : ""}₹{(Math.abs(tx.amount_paise) / 100).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border">
                <a
                  href="/dashboard/wallet"
                  className="block w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  View Full Wallet →
                </a>
              </div>
            </>
          )}
      </PopupWrapper>

      {showAddMoney && (
        <AddMoneyModal
          onClose={() => setShowAddMoney(false)}
          onSuccess={() => { setShowAddMoney(false); fetchData(); }}
        />
      )}
    </>
  );
}
