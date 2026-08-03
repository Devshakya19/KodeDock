"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Loader2, Landmark, Smartphone } from "lucide-react";
import { apiPost } from "@/shared/lib/api";

export interface PayoutAccountData {
  id: string;
  account_type: string;
  account_holder_name: string | null;
  masked_account_number: string | null;
  ifsc_code: string | null;
  bank_name: string | null;
  upi_id: string | null;
}

interface AddPayoutMethodProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing?: PayoutAccountData | null;
  onSaved: (account: PayoutAccountData) => void;
}

export default function AddPayoutMethod({
  open,
  onOpenChange,
  existing,
  onSaved,
}: AddPayoutMethodProps) {
  const isEditing = !!existing;
  const [accountType, setAccountType] = useState<"bank_account" | "upi">(
    existing?.account_type === "upi" ? "upi" : "bank_account"
  );
  const [holderName, setHolderName] = useState(existing?.account_holder_name || "");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState(existing?.ifsc_code || "");
  const [bankName, setBankName] = useState(existing?.bank_name || "");
  const [upiId, setUpiId] = useState(existing?.upi_id || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setError("");
    setHolderName(existing?.account_holder_name || "");
    setAccountNumber("");
    setIfscCode(existing?.ifsc_code || "");
    setBankName(existing?.bank_name || "");
    setUpiId(existing?.upi_id || "");
  }

  function handleClose(open: boolean) {
    if (!open) resetForm();
    onOpenChange(open);
  }

  function validate(): boolean {
    setError("");

    if (accountType === "bank_account") {
      if (!holderName.trim()) {
        setError("Account holder name is required");
        return false;
      }
      if (!accountNumber || accountNumber.length < 9 || accountNumber.length > 18 || !/^\d+$/.test(accountNumber)) {
        setError("Account number must be 9-18 digits");
        return false;
      }
      if (!ifscCode || ifscCode.length !== 11) {
        setError("IFSC code must be 11 characters");
        return false;
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
        setError("Invalid IFSC format (e.g. SBIN0001234)");
        return false;
      }
      if (!bankName.trim()) {
        setError("Bank name is required");
        return false;
      }
    } else {
      if (!upiId || !upiId.includes("@")) {
        setError("Invalid UPI ID (format: yourname@upi)");
        return false;
      }
      const [name, provider] = upiId.split("@");
      if (!name || !provider) {
        setError("Invalid UPI ID (format: yourname@upi)");
        return false;
      }
    }
    return true;
  }

  async function handleSave() {
    if (!validate()) return;

    setSaving(true);
    setError("");

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
      if (result.success && result.data) {
        onSaved(result.data);
        onOpenChange(false);
        resetForm();
      } else {
        setError(result.error || "Failed to save payout method");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-slate-950">
            {isEditing ? "Update Payout Method" : "Add Payout Method"}
          </SheetTitle>
          <p className="text-sm text-slate-500">
            Choose how you want to receive your earnings
          </p>
        </SheetHeader>

        {/* Account Type Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setAccountType("bank_account")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              accountType === "bank_account"
                ? "border-slate-950 bg-slate-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <Landmark className={`w-6 h-6 ${accountType === "bank_account" ? "text-slate-950" : "text-slate-400"}`} />
            <span className={`text-sm font-medium ${accountType === "bank_account" ? "text-slate-950" : "text-slate-500"}`}>
              Bank Account
            </span>
          </button>
          <button
            type="button"
            onClick={() => setAccountType("upi")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              accountType === "upi"
                ? "border-slate-950 bg-slate-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <Smartphone className={`w-6 h-6 ${accountType === "upi" ? "text-slate-950" : "text-slate-400"}`} />
            <span className={`text-sm font-medium ${accountType === "upi" ? "text-slate-950" : "text-slate-500"}`}>
              UPI ID
            </span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Bank Account Form */}
        {accountType === "bank_account" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Account Holder Name
              </label>
              <Input
                type="text"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="As per bank records"
                className="h-11 border-slate-300 bg-white"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Account Number
              </label>
              <Input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                placeholder={isEditing ? "Enter new number to update" : "9-18 digit account number"}
                className="h-11 border-slate-300 bg-white"
                maxLength={18}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                IFSC Code
              </label>
              <Input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="SBIN0001234"
                className="h-11 border-slate-300 bg-white uppercase"
                maxLength={11}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Bank Name
              </label>
              <Input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. State Bank of India"
                className="h-11 border-slate-300 bg-white"
                maxLength={100}
              />
            </div>
          </div>
        )}

        {/* UPI Form */}
        {accountType === "upi" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                UPI ID
              </label>
              <Input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="h-11 border-slate-300 bg-white"
                maxLength={100}
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Make sure this UPI ID is linked to your bank account
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-slate-300 h-11"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-slate-950 text-white hover:bg-slate-800 h-11"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isEditing ? "Update" : "Save"} Payout Method
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
