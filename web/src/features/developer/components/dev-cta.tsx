"use client";
import { FadeIn } from "@/shared/components/fade-in";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/button";


export function DevCTA() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20">
      <FadeIn>
        <div className="max-w-4xl mx-auto text-center bg-slate-950 rounded-3xl px-8 py-16 sm:px-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to start earning?
          </h2>
          <p className="mt-4 text-slate-400 max-w-lg mx-auto">
            Join developers who are already earning passive income on CodeHaat. It takes 5 minutes to list your first product.
          </p>
          <Link href="/developer-register">
            <Button size="lg" className="mt-8 bg-white text-slate-950 hover:bg-slate-100 shadow-lg px-8 h-12 text-base font-semibold rounded-full">
              Create Seller Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
