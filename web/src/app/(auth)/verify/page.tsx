"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function verifyAccount() {
      if (!token) {
        setError("Missing verification token. Please check your verification link.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setLoading(false);
        } else {
          setError(data.error || "Failed to verify email. The link may be expired.");
          setLoading(false);
        }
      } catch {
        setError("Network error while verifying your email.");
        setLoading(false);
      }
    }

    verifyAccount();
  }, [token]);

  if (loading) {
    return (
      <div className="w-full max-w-md">
        <Card className="border-white/[0.08] bg-[#0b0c10]/90 backdrop-blur-2xl shadow-2xl text-white">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-[#842cf9] animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Verifying...</h1>
            <p className="text-sm text-[#9496ac] mt-2">
              Please wait while we verify your email address
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md">
        <Card className="border-white/[0.08] bg-[#0b0c10]/90 backdrop-blur-2xl shadow-2xl text-white">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verification failed</h1>
            <p className="text-sm text-[#9496ac] mt-3">{error}</p>
            <Link href="/login">
              <Button className="mt-6 bg-[#842cf9] text-white hover:bg-[#702ffc]">
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
      <Card className="border-white/[0.08] bg-[#0b0c10]/90 backdrop-blur-2xl shadow-2xl text-white">
        <CardContent className="p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Email verified!</h1>
          <p className="text-sm text-[#9496ac] mt-3 leading-relaxed">
            Your email has been verified successfully. You can now sign in to your KodeDock account.
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="mt-6 bg-[#842cf9] text-white hover:bg-[#702ffc] cursor-pointer"
          >
            Sign in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <Card className="border-white/[0.08] bg-[#0b0c10]/90 backdrop-blur-2xl shadow-2xl text-white">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-10 h-10 text-[#842cf9] animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white">Loading...</h1>
            </CardContent>
          </Card>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
