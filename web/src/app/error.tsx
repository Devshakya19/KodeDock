"use client";

import { useEffect } from "react";
import { Button } from "@/shared/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-slate-950 mb-4">Something went wrong</h1>
        <p className="text-slate-600 mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset} className="bg-slate-950 text-white hover:bg-slate-800">
          Try Again
        </Button>
      </div>
    </div>
  );
}
