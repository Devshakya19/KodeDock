"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent } from "@/shared/ui/card";
import { apiPost } from "@/shared/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await apiPost("/auth/forgot-password", { email });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Failed to send reset link");
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
            <h1 className="text-2xl font-bold text-slate-950">Check your email</h1>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              If an account exists with{" "}
              <span className="font-semibold text-slate-950">{email}</span>,
              we&apos;ve sent a password reset link.
            </p>
            <Link href="/login">
              <Button variant="outline" className="mt-6 border-slate-300 text-slate-700">
                Back to sign in
              </Button>
            </Link>
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
            <h1 className="text-2xl font-bold text-slate-950">Forgot password?</h1>
            <p className="text-sm text-slate-600 mt-2">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                "Send reset link"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-slate-950 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
