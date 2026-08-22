"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, Shield, Trash2, ArrowLeft, KeyRound, AlertTriangle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { auth } from "@/shared/lib/auth/client";
import { apiPost, apiDelete } from "@/shared/lib/api/client";
import { theme } from "@/shared/lib/theme";

interface SecuritySettingsProps {
  backLink?: string;
  backText?: string;
  deleteWarningText: string;
  hideHeader?: boolean;
}

export function SecuritySettings({ backLink, backText, deleteWarningText, hideHeader }: SecuritySettingsProps) {
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

    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter");
      setSaving(false);
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError("Password must contain at least one lowercase letter");
      setSaving(false);
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError("Password must contain at least one number");
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
    if (!confirm(`Are you absolutely sure you want to delete your account? ${deleteWarningText} This action cannot be undone.`)) {
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
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className={hideHeader ? "w-full" : "max-w-3xl mx-auto py-8"}>
      {!hideHeader && (
        <div className="mb-8">
          {backLink && backText && (
            <Link href={backLink} className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> {backText}
            </Link>
          )}
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-1 text-[15px]">Manage your security preferences and account status</p>
        </div>
      )}

      <div className="space-y-8">
        
        {/* Security Section */}
        <div className={theme.components.card}>
          <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Security & Password</h2>
              <p className="text-[13px] text-muted-foreground font-medium mt-0.5">Keep your account secure by updating your password regularly</p>
            </div>
          </div>

          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-success/10 border border-success/20 text-sm font-medium text-success-foreground flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-red-100/50 text-sm font-medium text-red-800 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {error}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-6 max-w-xl">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className={theme.typography.label}>
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                Current Password
              </label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className={theme.inputs.base}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-[14px] font-semibold text-foreground">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className={theme.inputs.base}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-[14px] font-semibold text-foreground">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className={theme.inputs.base}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[14px] font-semibold shadow-md transition-all"
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
              <h2 className="text-lg font-bold text-destructive flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h2>
              <p className="text-[14px] text-muted-foreground font-medium max-w-md">
                {deleteWarningText}
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={handleDeleteAccount}
              className="h-12 px-6 rounded-xl border-destructive/30 bg-background text-destructive font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all shadow-sm shrink-0"
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
