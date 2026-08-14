"use client";

import { useState, useEffect } from "react";
import { Landmark, Smartphone, Loader2, CheckCircle, AlertTriangle, CreditCard } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { apiGet, apiPost } from "@/shared/lib/api";
import type { PayoutAccountData } from "@/features/wallet/components/add-payout-method";

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
      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-100 flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Payout Details</h2>
          <p className="text-[13px] text-slate-500 font-medium mt-0.5">Configure where you want to receive your earnings</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100/50 text-sm font-medium text-emerald-800 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100/50 text-sm font-medium text-red-800 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
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
                ? "border-blue-600 bg-blue-50/50 shadow-sm"
                : "border-slate-100 hover:border-slate-200 bg-white"
            }`}
          >
            <Landmark className={`w-6 h-6 ${accountType === "bank_account" ? "text-blue-600" : "text-slate-400"}`} />
            <span className={`text-[13px] font-semibold ${accountType === "bank_account" ? "text-blue-700" : "text-slate-500"}`}>
              Bank Account
            </span>
          </button>
          <button
            type="button"
            onClick={() => setAccountType("upi")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              accountType === "upi"
                ? "border-blue-600 bg-blue-50/50 shadow-sm"
                : "border-slate-100 hover:border-slate-200 bg-white"
            }`}
          >
            <Smartphone className={`w-6 h-6 ${accountType === "upi" ? "text-blue-600" : "text-slate-400"}`} />
            <span className={`text-[13px] font-semibold ${accountType === "upi" ? "text-blue-700" : "text-slate-500"}`}>
              UPI ID
            </span>
          </button>
        </div>

        {accountType === "bank_account" && (
          <div className="space-y-5">
            <div>
              <label className="block text-[14px] font-semibold text-slate-900 mb-2">Account Holder Name</label>
              <Input
                type="text"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="As per bank records"
                className="h-12 border-slate-200 bg-slate-50/50 focus-visible:bg-white rounded-xl text-[15px]"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-slate-900 mb-2">Account Number</label>
              <Input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 9-18 digit account number"
                className="h-12 border-slate-200 bg-slate-50/50 focus-visible:bg-white rounded-xl text-[15px]"
                maxLength={18}
              />
              <p className="text-[12px] font-medium text-slate-500 mt-2">For security reasons, please re-enter your full account number to update.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-semibold text-slate-900 mb-2">IFSC Code</label>
                <Input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="SBIN0001234"
                  className="h-12 border-slate-200 bg-slate-50/50 focus-visible:bg-white rounded-xl text-[15px] uppercase"
                  maxLength={11}
                />
              </div>
              <div>
                <label className="block text-[14px] font-semibold text-slate-900 mb-2">Bank Name</label>
                <Input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank"
                  className="h-12 border-slate-200 bg-slate-50/50 focus-visible:bg-white rounded-xl text-[15px]"
                  maxLength={100}
                />
              </div>
            </div>
          </div>
        )}

        {accountType === "upi" && (
          <div className="space-y-5">
            <div>
              <label className="block text-[14px] font-semibold text-slate-900 mb-2">UPI ID</label>
              <Input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="h-12 border-slate-200 bg-slate-50/50 focus-visible:bg-white rounded-xl text-[15px]"
                maxLength={100}
              />
              <p className="text-[12px] font-medium text-slate-500 mt-2">Make sure this UPI ID is linked to your bank account to receive payouts successfully.</p>
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-semibold shadow-md transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Payout Details
          </Button>
        </div>
      </form>
    </div>
  );
}
