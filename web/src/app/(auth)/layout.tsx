import { Code2 } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Left Branding Panel (desktop only) ── */}
      <aside className="hidden lg:flex lg:w-[45%] relative flex-col justify-between overflow-hidden p-12 text-white">
        {/* Abstract Premium Background Image */}
        <div className="absolute inset-0 z-0 bg-slate-950">
          <Image 
            src="/images/auth-bg.jpg" 
            alt="Premium Abstract Background" 
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            priority
            className="object-cover object-center opacity-40"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-white transition-all group-hover:bg-white group-hover:text-slate-950 shadow-2xl">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">KodeDock</span>
          </Link>
        </div>

        {/* Mid content */}
        <div className="relative z-10 mt-16 max-w-lg">
          <h2 className="text-5xl lg:text-[54px] font-bold text-white leading-[1.1] tracking-tight drop-shadow-lg">
            Welcome to <br />
            <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-violet-300 bg-clip-text text-transparent">
              KodeDock.
            </span>
          </h2>
          <p className="mt-8 text-lg text-slate-200 leading-relaxed max-w-md font-light">
            The premium marketplace for top-tier source code, boilerplates, and developer tools.
          </p>
        </div>

      
        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs font-medium text-slate-300 mt-8 pt-8 border-t border-white/10">
          <p>© {new Date().getFullYear()} KodeDock. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </aside>

      {/* ── Right Form Panel ── */}
      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:p-12 relative bg-slate-50 overflow-y-auto">
        {/* Mobile-only background glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 lg:hidden overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-blue-100/50 blur-[100px]" />
          <div className="absolute -right-40 -bottom-40 h-[400px] w-[400px] rounded-full bg-violet-100/50 blur-[100px]" />
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">KodeDock</span>
          </Link>
        </div>

        <div className="relative w-full max-w-md z-10 pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
