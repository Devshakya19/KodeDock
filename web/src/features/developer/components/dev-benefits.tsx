"use client";
import { GithubIcon } from "@/shared/components/github-icon";
import { FadeIn } from "@/shared/components/fade-in";

import { Badge } from "@/shared/ui/badge";
import {
  Percent,
  BarChart3,
  Zap,
  Shield,
  Users,
} from "lucide-react";


const BENEFITS = [
  {
    icon: Percent,
    title: "2.5% Commission",
    description: "Keep 97.5% of every sale. The lowest commission in the market — CodeCanyon takes 50%.",
  },
  {
    icon: GithubIcon,
    title: "GitHub Delivery",
    description: "Buyers get access directly via GitHub. No .zip files, no manual distribution.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track views, sales, conversion rates, and earnings in real time.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Link your repo, write a description, set your price — go live in under 5 minutes.",
  },
  {
    icon: Shield,
    title: "Payout Protection",
    description: "7-day payout cycle with fraud protection. Your earnings are safe.",
  },
  {
    icon: Users,
    title: "Built-in Audience",
    description: "Access thousands of Indian developers actively looking for quality code.",
  },
];

export function DevBenefits() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase bg-slate-100 border border-slate-300 text-slate-900">
              Why CodeHaat
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              Everything you need to sell code
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              We handle the hard parts — payments, delivery, support — so you can focus on building.
            </p>
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, i) => (
            <FadeIn key={benefit.title} delay={i * 0.1}>
              <div className="p-6 rounded-2xl border border-slate-200 hover:border-slate-950 hover:shadow-lg transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-slate-950/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-5 h-5 text-slate-950" />
                </div>
                <h3 className="text-lg font-semibold text-slate-950">{benefit.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
