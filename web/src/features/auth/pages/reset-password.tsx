"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent } from "@/shared/ui/card";
import { apiPost } from "@/shared/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Check if token exists on mount
  useEffect(() => {
    if (!token) {
      setError("No reset token found. Please request a new reset link.");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!token) {
      setError("No reset token found. Please request a new reset link.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      setLoading(false);
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      setLoading(false);
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      setLoading(false);
      return;
    }

    try {
      const result = await apiPost("/auth/reset-password", { token, password });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Failed to reset password");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <Card className="border-slate-200 shadow-lg shadow-slate-200/20">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-950">Password updated!</h1>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Your password has been successfully updated.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="mt-6 bg-slate-950 text-white hover:bg-slate-800"
            >
              Sign in with new password
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Card className="border-slate-200 shadow-lg shadow-slate-200/20">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-950">Reset password</h1>
            <p className="text-sm text-slate-600 mt-2">
              Enter your new password below
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {!token ? (
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-4">
                This password reset link is invalid or has expired.
              </p>
              <Link href="/forgot-password">
                <Button variant="outline" className="border-slate-300 text-slate-700">
                  Request a new reset link
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 border-slate-300 bg-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Min 8 characters, 1 uppercase, 1 lowercase, 1 number
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 border-slate-300 bg-white"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-slate-950 text-white hover:bg-slate-800"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md">
        <Card className="border-slate-200 shadow-lg shadow-slate-200/20">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
