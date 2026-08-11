"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, Shield, Trash2, ArrowLeft, KeyRound, AlertTriangle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { auth } from "@/shared/lib/auth";
import { apiPost, apiDelete } from "@/shared/lib/api";

export default function SellerSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const user = await auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setSaving(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      setSaving(false);
      return;
    }

    try {
      const result = await apiPost("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (result.success) {
        setSuccess("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.error || "Failed to update password");
      }
    } catch {
      setError("Network error occurred while updating password.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("Are you absolutely sure you want to delete your seller account? This action cannot be undone and will permanently remove all your products and data.")) {
      return;
    }

    try {
      const result = await apiDelete("/auth/delete-account");
      if (result.success) {
        try { await auth.signOut(); } catch {}
        window.location.replace("/login");
      } else {
        alert(result.error || "Failed to delete account");
      }
    } catch {
      alert("Network error occurred.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <Link href="/seller" className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-1 text-[15px]">Manage your security preferences and account status</p>
      </div>

      <div className="space-y-8">
        
        {/* Security Section */}
        <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Security & Password</h2>
              <p className="text-[13px] text-slate-500 font-medium mt-0.5">Keep your account secure by updating your password regularly</p>
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

          <form onSubmit={handlePasswordChange} className="space-y-6 max-w-xl">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
                <KeyRound className="w-4 h-4 text-slate-400" />
                Current Password
              </label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className="h-12 border-slate-200 bg-slate-50/50 focus-visible:bg-white rounded-xl text-[15px]"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-[14px] font-semibold text-slate-900">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className="h-12 border-slate-200 bg-slate-50/50 focus-visible:bg-white rounded-xl text-[15px]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-[14px] font-semibold text-slate-900">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="h-12 border-slate-200 bg-slate-50/50 focus-visible:bg-white rounded-xl text-[15px]"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-semibold shadow-md transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50/30 rounded-[24px] p-6 sm:p-8 border border-red-100">
          <div className="flex items-start justify-between gap-6 flex-col sm:flex-row">
            <div>
              <h2 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h2>
              <p className="text-[14px] text-slate-600 font-medium max-w-md">
                Permanently delete your seller account, all active product listings, and remove all associated data. This action cannot be undone.
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={handleDeleteAccount}
              className="h-12 px-6 rounded-xl border-red-200 bg-white text-red-600 font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all shadow-sm shrink-0"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
