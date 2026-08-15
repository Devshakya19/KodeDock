"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, Terminal } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Sell Code", href: "/developer" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white">
            <Terminal className="w-4.5 h-4.5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-950">
            Code<span className="text-slate-600">Haat</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors rounded-lg hover:bg-slate-100"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-sm font-medium text-slate-700 hover:text-slate-950">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="text-sm font-semibold bg-slate-950 text-white rounded-full px-4 py-2 hover:bg-slate-800">
              Get Started
            </Button>
          </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-700 hover:text-slate-950">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col gap-1 mt-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-slate-200 my-3" />
              <Link href="/login">
                <Button variant="outline" className="w-full justify-center text-slate-900">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="w-full justify-center mt-2 bg-slate-950 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  );
}
