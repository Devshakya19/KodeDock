import Link from "next/link";
import { Terminal } from "lucide-react";

interface StaticPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function StaticPageLayout({ children, title, description }: StaticPageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors">
            Back to home
          </Link>
        </nav>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-950">{title}</h1>
          {description && (
            <p className="text-lg text-slate-600 mt-3">{description}</p>
          )}
        </div>
        <div className="prose prose-slate max-w-none">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} CodeHaat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
