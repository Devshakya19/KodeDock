import Link from "next/link";
import { Terminal, Globe } from "lucide-react";
import { GithubIcon } from "@/shared/components/github-icon";
import { Badge } from "@/shared/ui/badge";

const FOOTER_LINKS = {
  Product: [
    { label: "Browse Products", href: "/browse" },
    { label: "Categories", href: "/browse" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Live Preview", href: "/browse" },
    { label: "GitHub Integration", href: "/developer" },
  ],
  Sellers: [
    { label: "Start Selling", href: "/developer" },
    { label: "Seller Dashboard", href: "/seller" },
    { label: "Payouts", href: "/seller/earnings" },
    { label: "Seller Analytics", href: "/seller" },
    { label: "Seller Guide", href: "/developer" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Press Kit", href: "/press" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
    { label: "License Agreement", href: "/license" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white">
                <Terminal className="w-4.5 h-4.5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-950">
                Code<span className="text-slate-600">Haat</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
              India&apos;s simplest developer marketplace for code delivered as GitHub repos.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { label: "GitHub", icon: GithubIcon, href: "https://github.com/codehaat" },
                { label: "Twitter", icon: Globe, href: "https://twitter.com/codehaat" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:text-slate-950 border border-slate-200 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold mb-4 text-slate-950">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-slate-950 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} CodeHaat. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Made with</span>
            <span className="text-slate-950">&#9829;</span>
            <span>in India</span>
            <span className="mx-1">&middot;</span>
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-950 border border-slate-200">
              v1.0
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
}
