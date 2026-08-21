import Link from "next/link";
import Image from "next/image";

interface StaticPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function StaticPageLayout({ children, title, description }: StaticPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <Image src="/icons/logo/full-logo.svg" alt="KodeDock" width={175} height={24} className="h-7 w-auto object-contain" priority />
            </Link>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Back to home
          </Link>
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-lg text-muted-foreground mt-3">{description}</p>
          )}
        </div>
        <div className="prose prose-slate max-w-none">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} KodeDock. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
