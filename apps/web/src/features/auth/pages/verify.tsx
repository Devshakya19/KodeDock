"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: Implement email verification via backend
    // For now, show success
    setSuccess(true);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-md">
        <Card className="border-slate-200 shadow-lg shadow-slate-200/20">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-slate-400 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-950">Verifying...</h1>
            <p className="text-sm text-slate-600 mt-2">
              Please wait while we verify your email
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md">
        <Card className="border-slate-200 shadow-lg shadow-slate-200/20">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-950">Verification failed</h1>
            <p className="text-sm text-slate-600 mt-3">{error}</p>
            <Link href="/login">
              <Button className="mt-6 bg-slate-950 text-white hover:bg-slate-800">
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
        <CardContent className="p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Email verified!</h1>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Your email has been verified successfully.
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="mt-6 bg-slate-950 text-white hover:bg-slate-800"
          >
            Sign in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
