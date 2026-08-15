"use client";
import { FadeIn } from "@/shared/components/fade-in";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";


const TESTIMONIALS = [
  {
    quote: "I sold my B.Tech project for ₹499 and made ₹20,000 in my first month.",
    name: "Rahul Verma",
    role: "B.Tech Graduate, Delhi",
    avatar: "RV",
  },
  {
    quote: "As a freelancer, I buy starter templates here and save days of work.",
    name: "Priya Sharma",
    role: "Full-Stack Developer, Bangalore",
    avatar: "PS",
  },
  {
    quote: "2.5% commission is unheard of. I keep almost everything I earn.",
    name: "Sneha Reddy",
    role: "Senior Developer, Hyderabad",
    avatar: "SR",
  },
];

export function Testimonials() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-xs font-semibold tracking-wide uppercase text-slate-900 mb-4">
              Testimonials
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950">
              Trusted by developers across India
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Hear from buyers and sellers who prefer direct GitHub delivery and simple pricing.
            </p>
          </FadeIn>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.1}>
              <Card className="h-full border border-slate-200 hover:border-slate-950 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                        key={j}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 mb-6">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-slate-950/10 flex items-center justify-center text-sm font-bold text-slate-950">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
