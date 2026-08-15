import Link from "next/link";
import { Button } from "@/shared/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-slate-950 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-950 mb-4">Page not found</h2>
        <p className="text-slate-600 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-slate-950 text-white hover:bg-slate-800">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
