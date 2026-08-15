"use client";
import { GithubIcon } from "@/shared/components/github-icon";
import { FadeIn } from "@/shared/components/fade-in";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Search,
  Sparkles,
  Activity,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";


export function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <motion.div ref={ref} style={{ opacity }} className="relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/5" />
      <div className="absolute left-1/2 top-10 -translate-x-1/2 w-[700px] h-[560px] rounded-full bg-slate-900/10 blur-3xl -z-10" />
      <div className="absolute right-0 top-32 w-[360px] h-[360px] rounded-full bg-slate-900/10 blur-3xl -z-10" />
      <div className="absolute left-0 bottom-10 w-[280px] h-[280px] rounded-full bg-slate-900/10 blur-3xl -z-10" />

      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="max-w-7xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 mb-8">
              <Sparkles className="w-4 h-4 text-slate-900" />
              <span className="text-sm font-medium text-slate-900">
                Early Access — Join 2,000+ developers
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-900" />
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-slate-950">
              Where <span className="text-slate-700">Code</span> meets <br className="hidden sm:block" /> commerce.
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Launch faster with a polished marketplace experience built for developers who want code delivered in GitHub.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/browse">
                <Button size="lg" className="h-12 px-8 text-base font-semibold bg-slate-950 text-white rounded-full hover:bg-slate-800">
                  Browse Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/developer">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold border-slate-300 text-slate-950 rounded-full hover:bg-slate-100">
                  <GithubIcon className="mr-2 w-5 h-5" />
                  Start Selling
                </Button>
              </Link>
            </div>
          </FadeIn>

          <FadeIn delay={0.45}>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-slate-950" />
                <span>2.5% commission</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-slate-950" />
                <span>GitHub delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-slate-950" />
                <span>Starting from ₹49</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-slate-950" />
                <span>Escrow protection</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.55}>
            <div className="mt-14 max-w-2xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors" />
                <Input
                  placeholder="Search templates, UI kits, projects..."
                  className="h-14 pl-12 pr-32 text-base rounded-2xl border border-slate-300 bg-white shadow-sm focus-visible:ring-slate-300"
                  readOnly
                />
                <Button
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 font-semibold rounded-xl bg-slate-950 text-white hover:bg-slate-800"
                >
                  Search
                </Button>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.65} className="mt-16 relative max-w-4xl mx-auto">
            <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200">
                <div>
                  <p className="text-sm text-slate-500">Product launch</p>
                  <p className="text-xl font-semibold text-slate-950">Weekly progress</p>
                </div>
                <div className="rounded-full bg-slate-900/10 px-3 py-1 text-sm text-slate-950">
                  +24%
                </div>
              </div>
              <div className="mt-6 space-y-4 p-6">
                {[
                  { icon: Users, label: "Active teams", value: "2.5K+" },
                  { icon: Activity, label: "Weekly launches", value: "180+" },
                  { icon: Zap, label: "Uptime", value: "99.9%" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-500">{item.label}</span>
                    </div>
                    <span className="text-lg font-semibold text-slate-950">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -inset-4 bg-slate-100/70 rounded-3xl blur-2xl -z-10" />
          </FadeIn>
        </div>
      </section>
    </motion.div>
  );
}
