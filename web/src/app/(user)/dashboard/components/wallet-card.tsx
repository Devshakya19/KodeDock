"use client";

import { useState } from "react";
import { Wallet, ChevronRight } from "lucide-react";
import { WalletPopup } from "@/components/wallet/wallet-popup";

interface WalletCardProps {
  initialBalance: number | null;
}

export function WalletCard({ initialBalance }: WalletCardProps) {
  const [showWallet, setShowWallet] = useState(false);

  return (
    <>
      <div onClick={() => setShowWallet(true)} className="bg-primary text-primary-foreground rounded-[24px] p-6 shadow-xl shadow-foreground/5 relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-foreground/10 transition-all hover:-translate-y-0.5 flex flex-col justify-between h-full">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-primary-foreground flex items-center justify-center border border-border/10 backdrop-blur-md">
              <Wallet className="w-5.5 h-5.5" />
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-white/10 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Wallet Balance</p>
            {initialBalance !== null ? (
              <p className="text-3xl font-black text-primary-foreground tracking-tight">₹{(initialBalance / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            ) : (
              <div className="h-9 flex items-center"><div className="w-24 h-6 bg-white/10 rounded-lg animate-pulse" /></div>
            )}
          </div>
        </div>
      </div>
      {showWallet && <WalletPopup onClose={() => setShowWallet(false)} />}
    </>
  );
}
