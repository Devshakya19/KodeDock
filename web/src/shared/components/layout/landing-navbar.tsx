"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { useWindowScroll } from "react-use";
import { Menu, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function LandingNavbar() {
  const { y } = useWindowScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsScrolled(y > 20);
  }, [y]);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Categories", href: "#categories" },
    { label: "Browse", href: "/browse" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-border"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-marketing font-bold text-xl tracking-tight flex items-center gap-2">
            Kode<span className="text-primary">Dock</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-foreground transition-colors">
              Log in
            </Link>
            <Button asChild variant="outline" className="hidden lg:flex">
              <Link href="/seller">Start Selling</Link>
            </Button>
            <Button asChild>
              <Link href="/browse">Explore Assets</Link>
            </Button>
          </div>
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border p-4 flex flex-col gap-4 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-foreground py-2 border-b border-border/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild variant="outline" className="w-full justify-center">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="w-full justify-center">
              <Link href="/browse">Explore Assets</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
