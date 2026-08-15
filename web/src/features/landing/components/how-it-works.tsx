"use client";
import { GithubIcon } from "@/shared/components/github-icon";
import { FadeIn } from "@/shared/components/fade-in";

import { Search, Wallet } from "lucide-react";


const STEPS = [
  {
    step: "01",
    icon: Search,
    title: "Browse product listings",
    description: "Explore thousands of code assets and preview them before you buy.",
  },
  {
    step: "02",
    icon: Wallet,
    title: "Secure payment",
    description: "Pay in INR with escrow protection and no surprise fees.",
  },
  {
    step: "03",
    icon: GithubIcon,
    title: "Receive GitHub repo",
    description: "Get a private repository with full commit history delivered to your account.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-xs font-semibold tracking-wide uppercase text-slate-900 mb-4">
              How It Works
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950">
              Three steps to live code delivery
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Discover, purchase, and start building from a real GitHub repository in minutes.
            </p>
          </FadeIn>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-slate-200" />
          {STEPS.map((s, i) => (
            <FadeIn key={s.step} delay={i * 0.15} className="relative">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-950 text-white shadow-sm mb-6 mx-auto">
                  <s.icon className="w-7 h-7" />
                </div>
                <div className="text-xs font-bold tracking-widest text-slate-600 uppercase mb-2">
                  Step {s.step}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-950">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
                  {s.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
