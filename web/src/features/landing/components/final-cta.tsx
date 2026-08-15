"use client";
import { FadeIn } from "@/shared/components/fade-in";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/shared/ui/button";


export function FinalCTA() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-0">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-10 sm:p-16 md:p-20 text-center text-white">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                Ready to start?
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-4 text-lg text-slate-300 leading-relaxed">
                Join thousands of developers buying and selling code with clear pricing and GitHub repo delivery.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/browse">
                  <Button
                    size="lg"
                    className="h-13 px-8 text-base font-semibold bg-white text-slate-950 rounded-full hover:bg-slate-100"
                  >
                    Browse Products
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/developer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-13 px-8 text-base font-semibold border-white text-white rounded-full hover:bg-white/10"
                  >
                    Become a Seller
                  </Button>
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-white" />
                  Free to join
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-white" />
                  No credit card required
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-white" />
                  Setup in under 2 minutes
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
