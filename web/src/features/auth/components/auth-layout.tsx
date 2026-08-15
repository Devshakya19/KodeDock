import { Terminal } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Auth Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white">
              <Terminal className="w-4.5 h-4.5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-950">
              Code<span className="text-slate-600">Haat</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors"
          >
            Back to home
          </Link>
        </nav>
      </header>

      {/* Auth Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Auth Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} CodeHaat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
