"use client";
import { GithubIcon } from "@/shared/components/github-icon";
import { FadeIn } from "@/shared/components/fade-in";

import Link from "next/link";
import { ArrowRight, Code2, TrendingUp } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";


export function DevHero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/5" />
      <div className="absolute left-1/2 top-10 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-slate-900/10 blur-3xl -z-10" />

      <div className="relative max-w-4xl mx-auto text-center">
        <FadeIn>
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase bg-slate-100 border border-slate-300 text-slate-900">
            For Developers
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-950 leading-[1.1]">
            Sell your code.{" "}
            <span className="gradient-text">Earn from your skills.</span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Turn your side projects into passive income. Link your GitHub repo, set a price, and let
            CodeHaat handle payments, delivery, and support. Only 2.5% commission.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/developer-register">
              <Button size="lg" className="bg-slate-950 text-white hover:bg-slate-800 shadow-lg shadow-slate-950/25 px-8 h-12 text-base font-semibold rounded-full">
                Start Selling
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/#how-it-works">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 h-12 text-base font-semibold rounded-full">
                Learn More
              </Button>
            </Link>
          </div>
        </FadeIn>
        <FadeIn delay={0.4}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span>2.5% commission</span>
            </div>
            <div className="flex items-center gap-2">
              <GithubIcon className="w-4 h-4" />
              <span>GitHub delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Weekly payouts</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
