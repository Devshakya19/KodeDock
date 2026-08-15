"use client";
import { FadeIn } from "@/shared/components/fade-in";

import { Users, TrendingUp, GraduationCap, Wallet } from "lucide-react";


const STATS = [
  { value: "8M+", label: "Indian Developers", icon: Users },
  { value: "2.5%", label: "Lowest Commission", icon: TrendingUp },
  { value: "500K+", label: "CS Graduates / Year", icon: GraduationCap },
  { value: "₹49", label: "Starting Price", icon: Wallet },
];

export function Stats() {
  return (
    <section className="py-16 border-y border-slate-200 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900/10 mb-3 text-slate-950">
                <stat.icon className="w-5.5 h-5.5" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">{stat.value}</div>
              <div className="mt-1 text-sm text-slate-600 font-medium">{stat.label}</div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
