import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">KodeDock Central Auth</h1>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
          The centralized marketing and authentication hub for KodeDock.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90"
          >
            Sign In
          </Link>
          <a
            href={process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3003"}
            className="px-6 py-3 border border-[var(--border-subtle)] text-white rounded-lg font-medium hover:bg-[var(--bg-surface)]"
          >
            Explore Store
          </a>
        </div>
      </div>
    </div>
  );
}
