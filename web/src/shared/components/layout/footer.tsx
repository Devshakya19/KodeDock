import Link from "next/link";
import { GithubIcon } from "@/shared/components/icons/github";
import { TwitterIcon } from "@/shared/components/icons/twitter";
import { LinkedinIcon } from "@/shared/components/icons/linkedin";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="font-marketing font-bold text-2xl tracking-tight">
              Kode<span className="text-primary">Dock</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              India's first developer marketplace. Buy and sell premium code assets with instant GitHub delivery.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><TwitterIcon size={20} /></a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><GithubIcon size={20} /></a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><LinkedinIcon size={20} /></a>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-foreground mb-2">Marketplace</h4>
            <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Code</Link>
            <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Categories</Link>
            <Link href="/seller" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Start Selling</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-foreground mb-2">Company</h4>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-foreground mb-2">Legal</h4>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/refund" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Refund Policy</Link>
            <Link href="/license" className="text-sm text-muted-foreground hover:text-foreground transition-colors">License Agreement</Link>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} KodeDock. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Designed for Developers
          </div>
        </div>
      </div>
    </footer>
  );
}
