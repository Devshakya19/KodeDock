"use client";

import { useState, useEffect } from "react";
import { Landmark, Smartphone, Loader2, CheckCircle, AlertTriangle, CreditCard } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { apiGet, apiPost } from "@/shared/lib/api/client";
import { theme } from "@/shared/lib/theme";
export interface PayoutAccountData {
  account_type: "bank_account" | "upi";
  account_holder_name?: string;
  account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  upi_id?: string;
}

export function PayoutSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [accountType, setAccountType] = useState<"bank_account" | "upi">("bank_account");
  const [holderName, setHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    async function fetchPayoutAccount() {
      try {
        const res = await apiGet<PayoutAccountData>("/seller/payout-account");
        if (res.success && res.data) {
          const data = res.data;
          setAccountType(data.account_type === "upi" ? "upi" : "bank_account");
          if (data.account_holder_name) setHolderName(data.account_holder_name);
          if (data.ifsc_code) setIfscCode(data.ifsc_code);
          if (data.bank_name) setBankName(data.bank_name);
          if (data.upi_id) setUpiId(data.upi_id);
        }
      } catch (err) {
        console.error("Failed to fetch payout account");
      } finally {
        setLoading(false);
      }
    }
    fetchPayoutAccount();
  }, []);

  function validate(): boolean {
    setError("");
    if (accountType === "bank_account") {
      if (!holderName.trim()) { setError("Account holder name is required"); return false; }
      if (!accountNumber && !loading) { 
        // if editing, we might not have account number in state, but let's say if they want to save, they need to provide it?
        // Actually, the backend requires account number. If it's already there and they just want to update name, they still need to re-enter account number.
        // Wait, backend requires it for bank_account. 
        setError("Account number is required"); return false; 
      }
      if (accountNumber && (accountNumber.length < 9 || accountNumber.length > 18 || !/^\d+$/.test(accountNumber))) {
        setError("Account number must be 9-18 digits"); return false;
      }
      if (!ifscCode || ifscCode.length !== 11) { setError("IFSC code must be 11 characters"); return false; }
      if (!bankName.trim()) { setError("Bank name is required"); return false; }
    } else {
      if (!upiId || !upiId.includes("@")) { setError("Invalid UPI ID format"); return false; }
    }
    return true;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload: Record<string, string> = { account_type: accountType };
      if (accountType === "bank_account") {
        payload.account_holder_name = holderName.trim();
        payload.account_number = accountNumber;
        payload.ifsc_code = ifscCode.toUpperCase();
        payload.bank_name = bankName.trim();
      } else {
        payload.upi_id = upiId.trim();
      }

      const result = await apiPost<PayoutAccountData>("/seller/payout-account", payload);
      if (result.success) {
        setSuccess("Payout details saved successfully!");
        setAccountNumber(""); // clear sensitive data
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.error || "Failed to save payout details");
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-background rounded-[24px] p-6 sm:p-8 border border-border flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className={theme.components.card}>
      <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Payout Details</h2>
          <p className="text-[13px] text-muted-foreground font-medium mt-0.5">Configure where you want to receive your earnings</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-success/10 border border-success/20 text-sm font-medium text-success flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-success" />
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-sm font-medium text-destructive flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-xl">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setAccountType("bank_account")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              accountType === "bank_account"
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border hover:border-border/80 bg-background"
            }`}
          >
            <Landmark className={`w-6 h-6 ${accountType === "bank_account" ? "text-accent" : "text-muted-foreground"}`} />
            <span className={`text-[13px] font-semibold ${accountType === "bank_account" ? "text-accent" : "text-muted-foreground"}`}>
              Bank Account
            </span>
          </button>
          <button
            type="button"
            onClick={() => setAccountType("upi")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              accountType === "upi"
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border hover:border-border/80 bg-background"
            }`}
          >
            <Smartphone className={`w-6 h-6 ${accountType === "upi" ? "text-accent" : "text-muted-foreground"}`} />
            <span className={`text-[13px] font-semibold ${accountType === "upi" ? "text-accent" : "text-muted-foreground"}`}>
              UPI ID
            </span>
          </button>
        </div>

        {accountType === "bank_account" && (
          <div className="space-y-5">
            <div>
              <label className="block text-[14px] font-semibold text-foreground mb-2">Account Holder Name</label>
              <Input
                type="text"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="As per bank records"
                className={theme.inputs.base}
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-foreground mb-2">Account Number</label>
              <Input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 9-18 digit account number"
                className={theme.inputs.base}
                maxLength={18}
              />
              <p className="text-[12px] font-medium text-muted-foreground mt-2">For security reasons, please re-enter your full account number to update.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-semibold text-foreground mb-2">IFSC Code</label>
                <Input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="SBIN0001234"
                  className="h-12 border-border bg-secondary/50 focus-visible:bg-background rounded-xl text-[15px] uppercase"
                  maxLength={11}
                />
              </div>
              <div>
                <label className="block text-[14px] font-semibold text-foreground mb-2">Bank Name</label>
                <Input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank"
                  className={theme.inputs.base}
                  maxLength={100}
                />
              </div>
            </div>
          </div>
        )}

        {accountType === "upi" && (
          <div className="space-y-5">
            <div>
              <label className="block text-[14px] font-semibold text-foreground mb-2">UPI ID</label>
              <Input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className={theme.inputs.base}
                maxLength={100}
              />
              <p className="text-[12px] font-medium text-muted-foreground mt-2">Make sure this UPI ID is linked to your bank account to receive payouts successfully.</p>
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[14px] font-semibold shadow-md transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Payout Details
          </Button>
        </div>
      </form>
    </div>
  );
}
