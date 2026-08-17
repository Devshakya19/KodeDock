import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/server";
import { Navbar } from "@/components/layout/navbar";
import { Code2 } from "lucide-react";

export default async function ShopLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("codehaat_token")?.value;
  const claims = token ? await verifyToken(token) : null;

  const email = claims?.email || "";
  const fullName = claims?.full_name || undefined;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar variant="browse" email={email} fullName={fullName} />
      
      {children}

      {/* Premium Footer */}
      <footer className="border-t border-slate-200/60 bg-white mt-20 pt-16 pb-8">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-6 h-6 text-blue-600" />
                <span className="text-[18px] font-black tracking-tight text-slate-900">CodeHaat</span>
              </div>
              <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-6 max-w-xs">
                India's premium marketplace for developers. Buy and sell production-grade code assets with instant GitHub delivery.
              </p>
              <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400">
                <span>Made with ❤️ in India</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-bold text-slate-900 uppercase tracking-wider mb-2">Marketplace</span>
              <a href="/browse" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">All Products</a>
              <a href="/browse?category=web-templates" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Web Templates</a>
              <a href="/browse?category=ui-kits" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">UI Kits</a>
              <a href="/browse?category=mobile-apps" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Mobile Apps</a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-bold text-slate-900 uppercase tracking-wider mb-2">Resources</span>
              <a href="/developer" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Become a Seller</a>
              <a href="/blog" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Blog & News</a>
              <a href="/contact" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Help Center</a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-bold text-slate-900 uppercase tracking-wider mb-2">Legal</span>
              <a href="/terms" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Terms of Service</a>
              <a href="/privacy" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Privacy Policy</a>
              <a href="/license" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">License Details</a>
              <a href="/cookies" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit">Cookie Policy</a>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-100 gap-4">
            <p className="text-[13px] font-medium text-slate-400">
              &copy; {new Date().getFullYear()} CodeHaat. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
